/**
 * App.tsx - Main Application Component
 * 
 * This is the root component of the My Mind hierarchical todo application.
 * It manages all application state, authentication, and data persistence.
 * 
 * Key Responsibilities:
 * - User authentication (login/logout)
 * - Task state management (CRUD operations)
 * - Auto-save to backend (debounced)
 * - Session persistence (localStorage)
 * - Task search and navigation
 * - Drag-and-drop coordination
 * 
 * Data Flow:
 * 1. User authenticates → Receives access token
 * 2. Tasks loaded from Supabase backend
 * 3. User modifies tasks → State updates
 * 4. After 1 second of no changes → Auto-save to backend
 * 5. On logout → Clear all state and localStorage
 * 
 * @component
 * @version 2.0.0 - Removed lists feature, simplified to single task collection per user
 */

import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd"; // Drag-and-drop context provider
import { HTML5Backend } from "react-dnd-html5-backend"; // HTML5 drag-and-drop backend
import { Header } from "./components/Header"; // Top navigation bar
import { InfiniteCanvas, InfiniteCanvasRef } from "./components/InfiniteCanvas"; // Main canvas
import { CustomDragLayer } from "./components/CustomDragLayer"; // Custom drag preview
import { TrashZone } from "./components/TrashZone"; // Delete zone
import { Login } from "./components/Login"; // Authentication UI
import { Task, NotionColor } from "./types"; // Type definitions
import { api } from "./utils/api"; // Backend API client

/**
 * Main Application Component
 * 
 * Manages authentication state and task data.
 * Routes between Login view and main app based on authentication status.
 */
function App() {
  // ============================================================================
  // AUTHENTICATION STATE
  // ============================================================================
  
  // State: Whether user is currently authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // State: JWT access token for API requests
  const [accessToken, setAccessToken] = useState<string>("");
  
  // State: Unique user ID from Supabase
  const [userId, setUserId] = useState<string>("");
  
  // State: User's display name (from signup)
  const [userName, setUserName] = useState<string>("");

  // ============================================================================
  // UI STATE
  // ============================================================================
  
  // State: Whether the "add task" modal is open in header
  const [isAdding, setIsAdding] = useState(false);
  
  // State: Whether the search modal is open in header
  const [isSearching, setIsSearching] = useState(false);
  
  // State: Loading indicator for initial data fetch
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // TASK DATA STATE
  // ============================================================================
  
  // State: Array of all top-level tasks (each can have nested subtasks)
  const [tasks, setTasks] = useState<Task[]>([]);

  // ============================================================================
  // REFS
  // ============================================================================
  
  // Ref: Access to InfiniteCanvas methods (e.g., centerOnTask for search)
  const canvasRef = useRef<InfiniteCanvasRef>(null);
  
  // Ref: Timeout handle for debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // ============================================================================
  // SESSION PERSISTENCE
  // ============================================================================
  
  /**
   * Check for existing session on component mount
   * 
   * Flow:
   * 1. Check localStorage for saved authentication data
   * 2. If found, restore session and load user's tasks
   * 3. If not found, show login screen
   * 
   * This provides seamless experience - users don't need to login
   * every time they visit the app.
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');

    if (savedToken && savedUserId && savedUserName) {
      // Restore authenticated session
      setAccessToken(savedToken);
      setUserId(savedUserId);
      setUserName(savedUserName);
      setIsAuthenticated(true);
      // Load user's tasks from backend
      loadTasks(savedToken);
    } else {
      // No saved session, show login
      setIsLoading(false);
    }
  }, []); // Run only once on mount

  // ============================================================================
  // DATA LOADING AND SAVING
  // ============================================================================

  /**
   * Load tasks from backend
   * 
   * Fetches all tasks for the authenticated user from Supabase.
   * Sets loading state during fetch to show loading indicator.
   * 
   * @param {string} token - JWT access token for authentication
   */
  const loadTasks = async (token: string) => {
    try {
      setIsLoading(true);
      const fetchedTasks = await api.getTasks(token);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Note: We don't clear authentication on error - user stays logged in
      // This handles temporary network issues gracefully
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save tasks to backend (debounced)
   * 
   * This function implements auto-save with a 1-second debounce.
   * Every time tasks change, we:
   * 1. Cancel any pending save
   * 2. Start a new 1-second timer
   * 3. When timer expires, save to backend
   * 
   * Why debounce?
   * - Prevents excessive API calls during rapid edits
   * - Reduces server load
   * - Improves performance
   * 
   * Example: If user types "Hello" quickly, we don't make 5 API calls.
   * We wait until they stop typing for 1 second, then save once.
   * 
   * @param {Task[]} tasksToSave - Array of tasks to persist
   */
  const saveTasks = (tasksToSave: Task[]) => {
    if (!accessToken) return; // Can't save without authentication

    // Clear existing timeout (if user makes another change)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.saveTasks(accessToken, tasksToSave);
        console.log('Tasks saved successfully'); // Confirmation for debugging
      } catch (error) {
        console.error('Failed to save tasks:', error);
        // Note: We don't show error to user - auto-save is transparent
        // User can refresh page to reload from last successful save
      }
    }, 1000); // 1 second debounce
  };

  /**
   * Auto-save effect
   * 
   * Triggers save whenever tasks change.
   * Only runs after initial authentication (prevents saving empty array on login).
   * 
   * Dependencies:
   * - tasks: Save whenever task array changes
   * - isAuthenticated: Only save if user is logged in
   */
  useEffect(() => {
    if (isAuthenticated && tasks.length >= 0) {
      saveTasks(tasks);
    }
    // Note: We intentionally don't include saveTasks in dependencies
    // because it's recreated on every render. This is safe because
    // saveTasks doesn't use any state except accessToken, which doesn't change.
  }, [tasks, isAuthenticated]);

  // ============================================================================
  // AUTHENTICATION HANDLERS
  // ============================================================================

  /**
   * Handle successful login
   * 
   * Called by Login component when user successfully authenticates.
   * Sets all authentication state and persists to localStorage.
   * 
   * @param {string} token - JWT access token
   * @param {string} uid - User's unique ID
   * @param {string} name - User's display name
   */
  const handleLogin = (token: string, uid: string, name: string) => {
    // Set authentication state
    setAccessToken(token);
    setUserId(uid);
    setUserName(name);
    setIsAuthenticated(true);
    
    // Persist to localStorage for session restoration
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', uid);
    localStorage.setItem('userName', name);
    
    // Load user's tasks from backend
    loadTasks(token);
  };

  /**
   * Handle logout
   * 
   * Clears all authentication state and localStorage.
   * Returns user to login screen.
   */
  const handleLogout = () => {
    // Clear in-memory state
    setIsAuthenticated(false);
    setAccessToken("");
    setUserId("");
    setUserName("");
    setTasks([]);
    
    // Clear persisted state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  // ============================================================================
  // TASK CRUD OPERATIONS
  // ============================================================================

  /**
   * Generate unique task ID
   * 
   * Creates a random alphanumeric ID for new tasks.
   * Uses base-36 encoding for compact IDs.
   * 
   * @returns {string} Unique task ID
   */
  const generateId = () => Math.random().toString(36).substring(2, 9);

  /**
   * Create new top-level task
   * 
   * Called from Header when user submits the "add task" form.
   * Positions new tasks in a vertical stack.
   * 
   * @param {string} title - Task title
   * @param {NotionColor} color - Selected color
   */
  const handleCreateTask = (title: string, color: NotionColor) => {
    const newTask: Task = {
      id: generateId(),
      title,
      color,
      // Position: Center horizontally, stack vertically
      x: window.innerWidth / 2 - 160, // Center (task width is ~320px)
      y: tasks.length * 120 + 50,     // Stack with 120px spacing
      completed: false,
      collapsed: false,
      subtasks: [],
    };

    setTasks([...tasks, newTask]); // Add to task array
    setIsAdding(false); // Close add task modal
  };

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================

  /**
   * Find best matching task for search query
   * 
   * Implements intelligent search with scoring system:
   * - Exact match: 100 points
   * - Starts with query: 80 points
   * - Contains query: 60 points
   * - Word matching: Proportional to matched words (0-40 points)
   * 
   * Searches recursively through all tasks and subtasks at all levels.
   * Returns the task ID with the highest score.
   * 
   * @param {Task[]} tasks - Array of tasks to search
   * @param {string} query - Search query
   * @returns {string | null} ID of best matching task, or null if no match
   */
  const findBestMatch = (tasks: Task[], query: string): string | null => {
    let bestMatch: { id: string; score: number } | null = null;
    const lowerQuery = query.toLowerCase();

    /**
     * Recursive search function
     * 
     * Searches task and all its subtasks, maintaining best match across entire tree.
     */
    const searchTask = (task: Task) => {
      const title = task.title.toLowerCase();
      
      let score = 0;
      
      // Calculate match score
      if (title === lowerQuery) {
        score = 100; // Exact match
      } else if (title.startsWith(lowerQuery)) {
        score = 80; // Starts with query
      } else if (title.includes(lowerQuery)) {
        score = 60; // Contains query
      } else {
        // Word-by-word matching
        const queryWords = lowerQuery.split(" ");
        const matchedWords = queryWords.filter(word => title.includes(word)).length;
        score = (matchedWords / queryWords.length) * 40; // Proportional score
      }

      // Update best match if this score is higher
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id: task.id, score };
      }

      // Recursively search subtasks
      task.subtasks.forEach(searchTask);
    };

    // Search all top-level tasks
    tasks.forEach(searchTask);
    
    return bestMatch?.id || null;
  };

  /**
   * Handle search submission
   * 
   * Finds best matching task and centers canvas on it.
   * Closes search modal after search.
   * 
   * @param {string} query - Search query from user
   */
  const handleSearch = (query: string) => {
    const taskId = findBestMatch(tasks, query);
    if (taskId && canvasRef.current) {
      canvasRef.current.centerOnTask(taskId); // Smooth scroll to task
    }
    setIsSearching(false); // Close search modal
  };

  /**
   * Toggle search modal
   * 
   * Opens search modal and closes add modal if open.
   * Only one modal can be open at a time.
   */
  const handleToggleSearch = () => {
    setIsSearching(!isSearching);
    if (isAdding) setIsAdding(false); // Close add modal
  };

  /**
   * Toggle add task modal
   * 
   * Opens add task modal and closes search modal if open.
   * Only one modal can be open at a time.
   */
  const handleToggleAdd = () => {
    setIsAdding(!isAdding);
    if (isSearching) setIsSearching(false); // Close search modal
  };

  // ============================================================================
  // TASK TREE MANIPULATION UTILITIES
  // ============================================================================

  /**
   * Find and update a task in the tree
   * 
   * Recursively searches through tasks and subtasks to find a specific task by ID.
   * When found, applies the update function and returns the updated tree.
   * 
   * This is a pure function - it doesn't mutate state, it returns a new tree.
   * 
   * @param {Task[]} tasks - Array of tasks to search
   * @param {string} id - ID of task to update
   * @param {Function} updateFn - Function to apply to the task
   * @returns {Task[]} New task array with update applied
   */
  const findAndUpdateTask = (
    tasks: Task[],
    id: string,
    updateFn: (task: Task) => Task
  ): Task[] => {
    return tasks.map((task) => {
      // If this is the task we're looking for, apply update
      if (task.id === id) {
        return updateFn(task);
      }
      // If task has subtasks, recursively search them
      if (task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: findAndUpdateTask(task.subtasks, id, updateFn),
        };
      }
      // Not the task we're looking for, return unchanged
      return task;
    });
  };

  /**
   * Toggle task completion status
   * 
   * Marks task as complete/incomplete.
   * Works at any nesting level.
   * 
   * @param {string} id - ID of task to toggle
   */
  const handleToggleComplete = (id: string) => {
    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, id, (task) => ({
        ...task,
        completed: !task.completed,
      }))
    );
  };

  /**
   * Toggle task collapse state
   * 
   * Collapses or expands task's subtasks.
   * Works at any nesting level.
   * 
   * @param {string} id - ID of task to toggle
   */
  const handleToggleCollapse = (id: string) => {
    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, id, (task) => ({
        ...task,
        collapsed: !task.collapsed,
      }))
    );
  };

  /**
   * Edit task title
   * 
   * Updates task title.
   * Works at any nesting level.
   * 
   * @param {string} id - ID of task to edit
   * @param {string} newTitle - New title for task
   */
  const handleEditTask = (id: string, newTitle: string) => {
    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, id, (task) => ({
        ...task,
        title: newTitle,
      }))
    );
  };

  /**
   * Add subtask to a parent task
   * 
   * Creates new subtask and adds it to parent's subtasks array.
   * Inherits parent's color.
   * 
   * @param {string} parentId - ID of parent task
   * @param {string} title - Title for new subtask
   * @param {NotionColor} color - Color for new subtask
   */
  const handleAddSubtask = (parentId: string, title: string, color: NotionColor) => {
    const newSubtask: Task = {
      id: generateId(),
      title,
      color,
      x: 0, // Subtasks don't have canvas positions
      y: 0,
      completed: false,
      collapsed: false,
      subtasks: [],
      parentId, // Track parent for potential future use
    };

    setTasks((prevTasks) =>
      findAndUpdateTask(prevTasks, parentId, (task) => ({
        ...task,
        subtasks: [...task.subtasks, newSubtask],
      }))
    );
  };

  /**
   * Remove task from tree
   * 
   * Recursively searches for and removes a task from the tree.
   * Returns both the updated tree and the removed task (for potential reinsertion).
   * 
   * @param {Task[]} tasks - Array of tasks to search
   * @param {string} taskId - ID of task to remove
   * @returns {{ tasks: Task[]; removed: Task | null }} Updated tree and removed task
   */
  const removeTaskFromTree = (tasks: Task[], taskId: string): { tasks: Task[]; removed: Task | null } => {
    let removedTask: Task | null = null;

    // Filter out the task at this level
    const filtered = tasks.filter((task) => {
      if (task.id === taskId) {
        removedTask = task; // Save the removed task
        return false; // Remove from array
      }
      return true; // Keep in array
    });

    // If we found and removed the task, return immediately
    if (removedTask) {
      return { tasks: filtered, removed: removedTask };
    }

    // Otherwise, recursively search subtasks
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

  /**
   * Move task to new location
   * 
   * This is the core drag-and-drop handler.
   * Supports three scenarios:
   * 
   * 1. Drop on canvas (newParentId = null, newPosition = {x, y})
   *    → Make task top-level at specified position
   * 
   * 2. Drop on another task (newParentId = taskId, newPosition = null)
   *    → Make task a subtask of target task
   * 
   * 3. Drop on trash (handled separately in handleDeleteTask)
   * 
   * CRITICAL: This enables ALL subtask permutations:
   * - Subtask → Subtask: Drop subtask onto another subtask
   * - Subtask → Top-level: Drop subtask onto canvas
   * - Top-level → Subtask: Drop top-level task onto another task
   * - Sub-subtask → Anywhere: All levels can be moved
   * 
   * @param {string} taskId - ID of task being moved
   * @param {string | null} newParentId - ID of new parent (null if moving to canvas)
   * @param {{ x: number; y: number } | null} newPosition - New canvas position (null if nesting)
   */
  const handleMoveTask = (
    taskId: string,
    newParentId: string | null,
    newPosition: { x: number; y: number } | null
  ) => {
    setTasks((prevTasks) => {
      // Step 1: Remove task from current location
      const { tasks: afterRemoval, removed } = removeTaskFromTree(prevTasks, taskId);

      if (!removed) return prevTasks; // Task not found, no change

      // Step 2a: Moving to a parent (making it a subtask)
      if (newParentId) {
        const movedTask = { ...removed, parentId: newParentId, x: 0, y: 0 };
        return findAndUpdateTask(afterRemoval, newParentId, (parent) => ({
          ...parent,
          subtasks: [...parent.subtasks, movedTask],
        }));
      } 
      // Step 2b: Moving to canvas (making it top-level)
      else if (newPosition) {
        const movedTask = { ...removed, x: newPosition.x, y: newPosition.y, parentId: undefined };
        return [...afterRemoval, movedTask];
      }

      // No valid destination, return unchanged
      return prevTasks;
    });
  };

  /**
   * Delete task
   * 
   * Permanently removes task from tree.
   * Works at any nesting level.
   * 
   * @param {string} taskId - ID of task to delete
   */
  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => {
      const { tasks: afterRemoval } = removeTaskFromTree(prevTasks, taskId);
      return afterRemoval;
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show loading indicator while fetching initial data
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-[#3D3630] opacity-60">Loading...</div>
      </div>
    );
  }

  // Main application UI
  return (
    // DndProvider: Enables drag-and-drop throughout the app
    <DndProvider backend={HTML5Backend}>
      <div className="w-screen h-screen overflow-hidden">
        {/* Top navigation bar */}
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

        {/* Main infinite canvas with tasks */}
        <InfiniteCanvas
          ref={canvasRef}
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onAddSubtask={handleAddSubtask}
          onToggleCollapse={handleToggleCollapse}
          onMoveTask={handleMoveTask}
          onEditTask={handleEditTask}
        />

        {/* Custom drag preview for top-level tasks */}
        <CustomDragLayer />
        
        {/* Trash zone for deleting tasks */}
        <TrashZone onDeleteTask={handleDeleteTask} />
      </div>
    </DndProvider>
  );
}

export default App;
