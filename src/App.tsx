import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Header } from "./components/Header";
import { InfiniteCanvas, InfiniteCanvasRef } from "./components/InfiniteCanvas";
import { CustomDragLayer } from "./components/CustomDragLayer";
import { TrashZone } from "./components/TrashZone";
import { Login } from "./components/Login";
import { Task, NotionColor } from "./types";
import { api } from "./utils/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      loadTasks(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Load tasks from server
  const loadTasks = async (token: string) => {
    try {
      setIsLoading(true);
      const fetchedTasks = await api.getTasks(token);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save tasks to server (debounced)
  const saveTasks = (tasksToSave: Task[]) => {
    if (!accessToken) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.saveTasks(accessToken, tasksToSave);
        console.log('Tasks saved successfully');
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    }, 1000);
  };

  // Save tasks whenever they change
  useEffect(() => {
    if (isAuthenticated && tasks.length >= 0) {
      saveTasks(tasks);
    }
  }, [tasks, isAuthenticated]);

  const handleLogin = (token: string, uid: string, name: string) => {
    setAccessToken(token);
    setUserId(uid);
    setUserName(name);
    setIsAuthenticated(true);
    
    // Save to localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', uid);
    localStorage.setItem('userName', name);
    
    // Load user's tasks
    loadTasks(token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken("");
    setUserId("");
    setUserName("");
    setTasks([]);
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleCreateTask = (title: string, color: NotionColor) => {
    const newTask: Task = {
      id: generateId(),
      title,
      color,
      x: window.innerWidth / 2 - 160,
      y: tasks.length * 120 + 50,
      completed: false,
      collapsed: false,
      subtasks: [],
    };
    setTasks([...tasks, newTask]);
    setIsAdding(false);
  };

  const findBestMatch = (tasks: Task[], query: string): string | null => {
    let bestMatch: { id: string; score: number } | null = null;
    const lowerQuery = query.toLowerCase();

    const searchTask = (task: Task) => {
      const title = task.title.toLowerCase();
      
      // Calculate match score (simple implementation)
      let score = 0;
      if (title === lowerQuery) {
        score = 100; // exact match
      } else if (title.startsWith(lowerQuery)) {
        score = 80; // starts with query
      } else if (title.includes(lowerQuery)) {
        score = 60; // contains query
      } else {
        // Check if all words in query are in title
        const queryWords = lowerQuery.split(" ");
        const matchedWords = queryWords.filter(word => title.includes(word)).length;
        score = (matchedWords / queryWords.length) * 40;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id: task.id, score };
      }

      // Search subtasks recursively
      task.subtasks.forEach(searchTask);
    };

    tasks.forEach(searchTask);
    return bestMatch?.id || null;
  };

  const handleSearch = (query: string) => {
    const taskId = findBestMatch(tasks, query);
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
    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, id, (task) => ({
        ...task,
        completed: !task.completed,
      }))
    );
  };

  const handleToggleCollapse = (id: string) => {
    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, id, (task) => ({
        ...task,
        collapsed: !task.collapsed,
      }))
    );
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

    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, parentId, (task) => ({
        ...task,
        subtasks: [...task.subtasks, newSubtask],
      }))
    );
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
    setTasks((prevTasks) => {
      const { tasks: afterRemoval, removed } = removeTaskFromTree(prevTasks, taskId);

      if (!removed) return prevTasks;

      if (newParentId) {
        // Moving to a new parent (as subtask)
        const movedTask = { ...removed, parentId: newParentId, x: 0, y: 0 };
        return findAndUpdateTask(afterRemoval, newParentId, (parent) => ({
          ...parent,
          subtasks: [...parent.subtasks, movedTask],
        }));
      } else if (newPosition) {
        // Moving to canvas
        const movedTask = { ...removed, x: newPosition.x, y: newPosition.y, parentId: undefined };
        return [...afterRemoval, movedTask];
      }

      return prevTasks;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => {
      const { tasks: afterRemoval } = removeTaskFromTree(prevTasks, taskId);
      return afterRemoval;
    });
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
        <InfiniteCanvas
          ref={canvasRef}
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onAddSubtask={handleAddSubtask}
          onToggleCollapse={handleToggleCollapse}
          onMoveTask={handleMoveTask}
        />
        <CustomDragLayer />
        <TrashZone onDeleteTask={handleDeleteTask} />
      </div>
    </DndProvider>
  );
}

export default App;