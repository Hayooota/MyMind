import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Header } from "./components/Header";
import { InfiniteCanvas } from "./components/InfiniteCanvas";
import { CustomDragLayer } from "./components/CustomDragLayer";
import { Task, NotionColor } from "./types";

function App() {
  const [isAdding, setIsAdding] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-screen h-screen overflow-hidden">
        <Header
          isAdding={isAdding}
          onToggleAdd={() => setIsAdding(!isAdding)}
          onCreateTask={handleCreateTask}
        />
        <InfiniteCanvas
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onAddSubtask={handleAddSubtask}
          onToggleCollapse={handleToggleCollapse}
          onMoveTask={handleMoveTask}
        />
        <CustomDragLayer />
      </div>
    </DndProvider>
  );
}

export default App;