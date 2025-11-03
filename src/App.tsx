import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Header } from "./components/Header";
import { InfiniteCanvas, InfiniteCanvasRef } from "./components/InfiniteCanvas";
import { CustomDragLayer } from "./components/CustomDragLayer";
import { TrashZone } from "./components/TrashZone";
import { Login } from "./components/Login";
import { ListsSidebar } from "./components/ListsSidebar";
import { MoveTaskDialog } from "./components/MoveTaskDialog";
import { Task, NotionColor, TodoList } from "./types";
import { api } from "./utils/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lists, setLists] = useState<TodoList[]>([]);
  const [currentListId, setCurrentListId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [taskToMove, setTaskToMove] = useState<{ id: string; title: string } | null>(null);
  const canvasRef = useRef<InfiniteCanvasRef>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');

    if (savedToken && savedUserId && savedUserName) {
      setAccessToken(savedToken);
      setUserId(savedUserId);
      setUserName(savedUserName);
      setIsAuthenticated(true);
      loadLists(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Load lists from server
  const loadLists = async (token: string) => {
    try {
      setIsLoading(true);
      const fetchedLists = await api.getLists(token);
      setLists(fetchedLists);
      if (fetchedLists.length > 0) {
        setCurrentListId(fetchedLists[0].id);
      }
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save lists to server (debounced)
  const saveLists = (listsToSave: TodoList[]) => {
    if (!accessToken) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.saveLists(accessToken, listsToSave);
        console.log('Lists saved successfully');
      } catch (error) {
        console.error('Failed to save lists:', error);
      }
    }, 1000);
  };

  // Save lists whenever they change
  useEffect(() => {
    if (isAuthenticated && lists.length > 0) {
      saveLists(lists);
    }
  }, [lists, isAuthenticated]);

  const handleLogin = (token: string, uid: string, name: string) => {
    setAccessToken(token);
    setUserId(uid);
    setUserName(name);
    setIsAuthenticated(true);
    
    // Save to localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', uid);
    localStorage.setItem('userName', name);
    
    // Load user's lists
    loadLists(token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken("");
    setUserId("");
    setUserName("");
    setLists([]);
    setCurrentListId("");
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getCurrentList = () => lists.find(l => l.id === currentListId);

  const updateCurrentList = (updater: (list: TodoList) => TodoList) => {
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === currentListId ? updater(list) : list
      )
    );
  };

  const handleCreateTask = (title: string, color: NotionColor) => {
    const currentList = getCurrentList();
    if (!currentList) return;

    const newTask: Task = {
      id: generateId(),
      title,
      color,
      x: window.innerWidth / 2 - 160,
      y: currentList.tasks.length * 120 + 50,
      completed: false,
      collapsed: false,
      subtasks: [],
    };

    updateCurrentList(list => ({
      ...list,
      tasks: [...list.tasks, newTask]
    }));
    setIsAdding(false);
  };

  const findBestMatch = (tasks: Task[], query: string): string | null => {
    let bestMatch: { id: string; score: number } | null = null;
    const lowerQuery = query.toLowerCase();

    const searchTask = (task: Task) => {
      const title = task.title.toLowerCase();
      
      let score = 0;
      if (title === lowerQuery) {
        score = 100;
      } else if (title.startsWith(lowerQuery)) {
        score = 80;
      } else if (title.includes(lowerQuery)) {
        score = 60;
      } else {
        const queryWords = lowerQuery.split(" ");
        const matchedWords = queryWords.filter(word => title.includes(word)).length;
        score = (matchedWords / queryWords.length) * 40;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id: task.id, score };
      }

      task.subtasks.forEach(searchTask);
    };

    tasks.forEach(searchTask);
    return bestMatch?.id || null;
  };

  const handleSearch = (query: string) => {
    const currentList = getCurrentList();
    if (!currentList) return;

    const taskId = findBestMatch(currentList.tasks, query);
    if (taskId && canvasRef.current) {
      canvasRef.current.centerOnTask(taskId);
    }
    setIsSearching(false);
  };

  const handleToggleSearch = () => {
    setIsSearching(!isSearching);
    if (isAdding) setIsAdding(false);
  };

  const handleToggleAdd = () => {
    setIsAdding(!isAdding);
    if (isSearching) setIsSearching(false);
  };

  const findAndUpdateTask = (
    tasks: Task[],
    id: string,
    updateFn: (task: Task) => Task
  ): Task[] => {
    return tasks.map((task) => {
      if (task.id === id) {
        return updateFn(task);
      }
      if (task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: findAndUpdateTask(task.subtasks, id, updateFn),
        };
      }
      return task;
    });
  };

  const handleToggleComplete = (id: string) => {
    updateCurrentList(list => ({
      ...list,
      tasks: findAndUpdateTask(list.tasks, id, (task) => ({
        ...task,
        completed: !task.completed,
      }))
    }));
  };

  const handleToggleCollapse = (id: string) => {
    updateCurrentList(list => ({
      ...list,
      tasks: findAndUpdateTask(list.tasks, id, (task) => ({
        ...task,
        collapsed: !task.collapsed,
      }))
    }));
  };

  const handleEditTask = (id: string, newTitle: string) => {
    updateCurrentList(list => ({
      ...list,
      tasks: findAndUpdateTask(list.tasks, id, (task) => ({
        ...task,
        title: newTitle,
      }))
    }));
  };

  const handleAddSubtask = (parentId: string, title: string, color: NotionColor) => {
    const newSubtask: Task = {
      id: generateId(),
      title,
      color,
      x: 0,
      y: 0,
      completed: false,
      collapsed: false,
      subtasks: [],
      parentId,
    };

    updateCurrentList(list => ({
      ...list,
      tasks: findAndUpdateTask(list.tasks, parentId, (task) => ({
        ...task,
        subtasks: [...task.subtasks, newSubtask],
      }))
    }));
  };

  const removeTaskFromTree = (tasks: Task[], taskId: string): { tasks: Task[]; removed: Task | null } => {
    let removedTask: Task | null = null;

    const filtered = tasks.filter((task) => {
      if (task.id === taskId) {
        removedTask = task;
        return false;
      }
      return true;
    });

    if (removedTask) {
      return { tasks: filtered, removed: removedTask };
    }

    const updated = filtered.map((task) => {
      if (task.subtasks.length > 0) {
        const result = removeTaskFromTree(task.subtasks, taskId);
        if (result.removed) {
          removedTask = result.removed;
          return { ...task, subtasks: result.tasks };
        }
      }
      return task;
    });

    return { tasks: updated, removed: removedTask };
  };

  const handleMoveTask = (
    taskId: string,
    newParentId: string | null,
    newPosition: { x: number; y: number } | null
  ) => {
    updateCurrentList(list => {
      const { tasks: afterRemoval, removed } = removeTaskFromTree(list.tasks, taskId);

      if (!removed) return list;

      if (newParentId) {
        const movedTask = { ...removed, parentId: newParentId, x: 0, y: 0 };
        return {
          ...list,
          tasks: findAndUpdateTask(afterRemoval, newParentId, (parent) => ({
            ...parent,
            subtasks: [...parent.subtasks, movedTask],
          }))
        };
      } else if (newPosition) {
        const movedTask = { ...removed, x: newPosition.x, y: newPosition.y, parentId: undefined };
        return {
          ...list,
          tasks: [...afterRemoval, movedTask]
        };
      }

      return list;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    updateCurrentList(list => {
      const { tasks: afterRemoval } = removeTaskFromTree(list.tasks, taskId);
      return {
        ...list,
        tasks: afterRemoval
      };
    });
  };

  // List management functions
  const handleCreateList = (name: string) => {
    const newList: TodoList = {
      id: generateId(),
      name,
      tasks: [],
    };
    setLists([...lists, newList]);
    setCurrentListId(newList.id);
  };

  const handleDeleteList = (listId: string) => {
    const updatedLists = lists.filter(l => l.id !== listId);
    setLists(updatedLists);
    if (currentListId === listId && updatedLists.length > 0) {
      setCurrentListId(updatedLists[0].id);
    }
  };

  const handleRenameList = (listId: string, newName: string) => {
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === listId ? { ...list, name: newName } : list
      )
    );
  };

  const handleMoveToList = (taskId: string) => {
    const currentList = getCurrentList();
    if (!currentList) return;

    const findTask = (tasks: Task[]): Task | null => {
      for (const task of tasks) {
        if (task.id === taskId) return task;
        const found = findTask(task.subtasks);
        if (found) return found;
      }
      return null;
    };

    const task = findTask(currentList.tasks);
    if (task) {
      setTaskToMove({ id: taskId, title: task.title });
      setMoveDialogOpen(true);
    }
  };

  const handleConfirmMoveToList = (targetListId: string) => {
    if (!taskToMove) return;

    const currentList = getCurrentList();
    if (!currentList || targetListId === currentListId) return;

    // Remove task from current list
    const { tasks: afterRemoval, removed } = removeTaskFromTree(currentList.tasks, taskToMove.id);
    
    if (!removed) return;

    // Update current list
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === currentListId) {
          return { ...list, tasks: afterRemoval };
        } else if (list.id === targetListId) {
          // Add task to target list with new position
          const movedTask = {
            ...removed,
            x: window.innerWidth / 2 - 160,
            y: list.tasks.length * 120 + 50,
            parentId: undefined,
          };
          return { ...list, tasks: [...list.tasks, movedTask] };
        }
        return list;
      })
    );

    setTaskToMove(null);
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-[#3D3630] opacity-60">Loading...</div>
      </div>
    );
  }

  const currentList = getCurrentList();
  const otherLists = lists.filter(l => l.id !== currentListId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-screen h-screen overflow-hidden">
        <Header
          isAdding={isAdding}
          isSearching={isSearching}
          onToggleAdd={handleToggleAdd}
          onToggleSearch={handleToggleSearch}
          onCreateTask={handleCreateTask}
          onSearch={handleSearch}
          userName={userName}
          onLogout={handleLogout}
        />
        
        <ListsSidebar
          lists={lists}
          currentListId={currentListId}
          onSelectList={setCurrentListId}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
          onRenameList={handleRenameList}
        />

        <div className="ml-[300px]">
          <InfiniteCanvas
            ref={canvasRef}
            tasks={currentList?.tasks || []}
            onToggleComplete={handleToggleComplete}
            onAddSubtask={handleAddSubtask}
            onToggleCollapse={handleToggleCollapse}
            onMoveTask={handleMoveTask}
            onEditTask={handleEditTask}
            onMoveToList={handleMoveToList}
          />
        </div>

        <CustomDragLayer />
        <TrashZone onDeleteTask={handleDeleteTask} />

        {taskToMove && (
          <MoveTaskDialog
            isOpen={moveDialogOpen}
            taskTitle={taskToMove.title}
            currentListName={currentList?.name || ""}
            lists={otherLists}
            onMove={handleConfirmMoveToList}
            onClose={() => {
              setMoveDialogOpen(false);
              setTaskToMove(null);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;
