/**
 * TaskCard.tsx - Individual Task Component with Nested Subtasks
 * 
 * This component represents a single task in the hierarchical todo list.
 * It supports up to 3 levels of nesting (task → subtask → sub-subtask).
 * 
 * Features:
 * - Drag and drop at ALL levels (top-level and all subtasks)
 * - Drop zones to accept other tasks as subtasks (at ALL levels)
 * - Inline editing of task titles
 * - Completion toggle with visual feedback
 * - Collapsible subtasks (double-click to toggle)
 * - Color-coded with progressive lightening for nested levels
 * - Add new subtasks inline
 * - Hover actions (edit, add subtask)
 * 
 * @component
 */

import React from "react";
import { Check, Plus, Edit2 } from "lucide-react"; // Icon components
import { motion } from "motion/react"; // Animation library
import { useDrag, useDrop } from "react-dnd"; // Drag and drop hooks
import { getEmptyImage } from "react-dnd-html5-backend"; // For custom drag preview
import { Task, NotionColor } from "../types"; // Type definitions
import { notionColors } from "../utils/colors"; // Color palette

/**
 * Props interface for TaskCard component
 * @interface TaskCardProps
 */
interface TaskCardProps {
  task: Task;                      // The task object to render
  level: number;                   // Current nesting level (0 = top-level, 1 = subtask, 2 = sub-subtask)
  onToggleComplete: (id: string) => void;  // Callback to mark task as complete/incomplete
  onAddSubtask: (parentId: string, title: string, color: NotionColor) => void;  // Callback to add a new subtask
  onToggleCollapse: (id: string) => void;  // Callback to collapse/expand subtasks
  onMoveTask: (taskId: string, newParentId: string | null, newPosition: { x: number; y: number } | null) => void;  // Callback to move task
  onEditTask?: (id: string, newTitle: string) => void;  // Optional callback to edit task title
  isTopLevel?: boolean;            // Flag indicating if this is a root-level task
}

/**
 * TaskCard Component
 * 
 * Renders a task card with all its functionality and recursively renders subtasks.
 * Supports drag-and-drop for repositioning and nesting at ALL levels.
 */
export function TaskCard({
  task,
  level,
  onToggleComplete,
  onAddSubtask,
  onToggleCollapse,
  onMoveTask,
  onEditTask,
  isTopLevel = false,
}: TaskCardProps) {
  // State: Controls visibility of subtask creation form
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  
  // State: Holds the title for the new subtask being created
  const [subtaskTitle, setSubtaskTitle] = React.useState("");
  
  // State: Controls whether this task is in edit mode
  const [isEditing, setIsEditing] = React.useState(false);
  
  // State: Holds the edited title while editing
  const [editTitle, setEditTitle] = React.useState(task.title);
  
  // State: Tracks the last click time for double-click detection
  const [lastClickTime, setLastClickTime] = React.useState(0);

  // Constants
  const maxLevel = 3; // Maximum nesting depth (task → subtask → sub-subtask)
  const canAddSubtask = level < maxLevel; // Can only add subtasks if not at max depth
  const colors = notionColors[task.color]; // Get color scheme for this task

  /**
   * DRAG FUNCTIONALITY
   * 
   * This hook enables dragging for ALL tasks (top-level and subtasks).
   * The item being dragged contains all necessary information for the drop handler.
   * 
   * IMPORTANT: Previously only top-level tasks could be dragged.
   * Now ALL levels can be dragged, enabling flexible reorganization.
   */
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "TASK", // Type identifier for drag-drop system
    item: { 
      id: task.id,           // Unique task identifier
      task,                  // Full task object
      isTopLevel,            // Whether this is a root task
      parentId: task.parentId // Current parent (if any)
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // Track if this task is currently being dragged
    }),
  }));

  /**
   * CUSTOM DRAG PREVIEW
   * 
   * For top-level tasks, we use a custom drag layer (CustomDragLayer component).
   * This provides a nicer visual experience than the default HTML5 drag preview.
   * For subtasks, we use the default preview (opacity change).
   */
  React.useEffect(() => {
    if (isTopLevel) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview, isTopLevel]);

  /**
   * DROP FUNCTIONALITY
   * 
   * This hook enables ALL tasks (not just top-level) to accept drops.
   * This means:
   * - Subtasks can accept other subtasks
   * - Sub-subtasks can accept other tasks (if not at max depth)
   * - Top-level tasks can accept any task
   * 
   * CRITICAL FIX: Previously only top-level tasks could accept drops.
   * Now subtasks can be nested into other subtasks at any level (up to max depth).
   * 
   * Drop rules:
   * 1. Cannot drop a task onto itself
   * 2. Cannot drop if target is at max nesting level
   * 3. Otherwise, the dropped task becomes a subtask of the target
   */
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK", // Accept items with type "TASK"
    drop: (item: { id: string; task: Task; isTopLevel: boolean; parentId?: string }) => {
      // Rule 1: Prevent dropping a task onto itself
      if (item.id !== task.id && canAddSubtask) {
        // Move the dropped task to become a subtask of this task
        // newParentId = this task's ID
        // newPosition = null (subtasks don't have canvas positions)
        onMoveTask(item.id, task.id, null);
      }
    },
    // Prevent dropping if target cannot accept subtasks
    canDrop: (item: { id: string; task: Task; isTopLevel: boolean; parentId?: string }) => {
      return item.id !== task.id && canAddSubtask;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && monitor.canDrop(), // Only highlight if drop is valid
    }),
  }));

  /**
   * DOUBLE-CLICK DETECTION
   * 
   * Custom implementation to detect double-clicks for collapsing/expanding subtasks.
   * We use a time-based approach (300ms window) to detect double-clicks.
   * 
   * Why custom? React doesn't have a reliable onDoubleClick handler,
   * so we implement it manually using timestamps.
   */
  const handleDoubleClick = () => {
    const now = Date.now();
    // If less than 300ms since last click, it's a double-click
    if (now - lastClickTime < 300) {
      onToggleCollapse(task.id);
    }
    setLastClickTime(now);
  };

  /**
   * SUBTASK CREATION HANDLER
   * 
   * Handles form submission when creating a new subtask.
   * Validates that title is not empty, then calls parent callback.
   */
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (subtaskTitle.trim()) {
      // Create subtask with trimmed title and parent's color
      onAddSubtask(task.id, subtaskTitle, task.color);
      setSubtaskTitle(""); // Clear input
      setIsAddingSubtask(false); // Hide creation form
    }
  };

  /**
   * TASK EDIT HANDLER
   * 
   * Handles form submission when editing a task title.
   * Validates that new title is not empty.
   */
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (editTitle.trim() && onEditTask) {
      onEditTask(task.id, editTitle.trim()); // Update task with trimmed title
      setIsEditing(false); // Exit edit mode
    }
  };

  /**
   * START EDITING MODE
   * 
   * Switches task into edit mode when edit button is clicked.
   * Prevents click from bubbling to parent (which would trigger double-click detection).
   */
  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger double-click
    setIsEditing(true); // Enter edit mode
    setEditTitle(task.title); // Initialize edit field with current title
  };

  /**
   * DYNAMIC STYLING
   * 
   * Calculate width and background opacity based on nesting level.
   * Deeper levels are slightly narrower and progressively lighter.
   */
  const width = isTopLevel ? "w-80" : `w-${Math.max(60, 80 - level * 10)}`;
  const backgroundOpacity = level === 0 ? 100 : Math.max(40, 100 - level * 20);

  /**
   * RENDER COMPONENT
   * 
   * Structure:
   * 1. Outer div: Drag source (all tasks can be dragged)
   * 2. Inner motion.div: Drop target (all tasks can accept drops) + visual feedback
   * 3. Content: Checkbox, title, action buttons
   * 4. Subtask form (if adding)
   * 5. Recursive subtask rendering
   */
  return (
    <div
      ref={drag} // CRITICAL: Attach drag ref to enable dragging at ALL levels
      style={{
        opacity: isDragging ? 0.3 : 1, // Make semi-transparent when dragging
        cursor: "grab", // Show grab cursor to indicate draggability
        transition: "opacity 0.1s ease", // Smooth opacity transition
      }}
      onClick={handleDoubleClick} // Detect double-clicks for collapse/expand
      className="group" // Enable group hover effects
    >
      {/* Main task card with drop functionality */}
      <motion.div
        ref={drop} // CRITICAL: Attach drop ref to enable accepting drops at ALL levels
        className={`${width} ${colors.bg} ${colors.border} border-2 rounded-xl p-4 shadow-sm relative`}
        whileHover={{ scale: isOver ? 1.02 : 1 }} // Slight scale up when valid drop target
        transition={{ duration: 0.2 }}
        style={{
          // Visual feedback when hovering with a draggable task
          boxShadow: isOver ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : undefined,
        }}
      >
        {/* 
          WHITE OVERLAY FOR NESTED LEVELS
          Creates the progressive lightening effect for subtasks.
          Each level adds 35% white overlay to create hierarchy visual.
        */}
        {level > 0 && (
          <div
            className="absolute inset-0 bg-white rounded-xl pointer-events-none"
            style={{ opacity: level * 0.35 }}
          />
        )}

        {/* Task content (relative z-index to appear above overlay) */}
        <div className="relative z-10">
          {/* Top row: checkbox, title, action buttons */}
          <div className="flex items-center gap-3">
            {/* COMPLETION CHECKBOX */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Don't trigger double-click
                onToggleComplete(task.id);
              }}
              className={`w-5 h-5 rounded border-2 ${colors.border} flex items-center justify-center opacity-30 hover:opacity-60 transition-opacity`}
            >
              {/* Show checkmark if task is completed */}
              {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
            </button>

            {/* TITLE - Either edit mode or display mode */}
            {isEditing ? (
              // EDIT MODE: Show input field
              <form onSubmit={handleEdit} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`flex-1 px-2 py-1 bg-white/70 border ${colors.border} rounded outline-none`}
                  autoFocus // Automatically focus when entering edit mode
                  onClick={(e) => e.stopPropagation()} // Don't trigger double-click
                  onBlur={() => {
                    // Save on blur if title is valid
                    if (editTitle.trim()) {
                      handleEdit({ preventDefault: () => {} } as React.FormEvent);
                    } else {
                      setIsEditing(false); // Cancel if empty
                    }
                  }}
                  onKeyDown={(e) => {
                    // Cancel edit on Escape key
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditTitle(task.title); // Restore original title
                    }
                  }}
                />
              </form>
            ) : (
              // DISPLAY MODE: Show task title
              <span className={`flex-1 ${colors.text} ${task.completed ? "line-through opacity-50" : ""}`}>
                {task.title}
              </span>
            )}

            {/* ACTION BUTTONS (visible on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* EDIT BUTTON - Only show if onEditTask callback provided and not already editing */}
              {onEditTask && !isEditing && (
                <button
                  onClick={startEditing}
                  className="opacity-40 hover:opacity-60 transition-opacity"
                  title="Edit task"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}

              {/* ADD SUBTASK BUTTON - Only show if not at max nesting level */}
              {canAddSubtask && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger double-click
                    setIsAddingSubtask(!isAddingSubtask); // Toggle subtask creation form
                  }}
                  className="opacity-40 hover:opacity-60 transition-opacity"
                  title="Add subtask"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* SUBTASK CREATION FORM (shown when isAddingSubtask is true) */}
          {isAddingSubtask && (
            <form onSubmit={handleAddSubtask} className="mt-3">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Subtask name..."
                className={`w-full px-3 py-1.5 bg-white/50 border ${colors.border} rounded-lg outline-none`}
                autoFocus
                onClick={(e) => e.stopPropagation()} // Don't trigger double-click
              />
            </form>
          )}

          {/* 
            RECURSIVE SUBTASK RENDERING
            
            Only render subtasks if:
            1. Task is not collapsed
            2. Task has subtasks
            
            IMPORTANT: Each subtask is rendered as a full TaskCard component,
            creating the recursive hierarchy. The level is incremented by 1
            for each nesting level.
          */}
          {!task.collapsed && task.subtasks.length > 0 && (
            <div className="mt-3 space-y-2 ml-4">
              {task.subtasks.map((subtask) => (
                <TaskCard
                  key={subtask.id}
                  task={subtask}
                  level={level + 1} // Increment nesting level
                  onToggleComplete={onToggleComplete}
                  onAddSubtask={onAddSubtask}
                  onToggleCollapse={onToggleCollapse}
                  onMoveTask={onMoveTask}
                  onEditTask={onEditTask}
                  isTopLevel={false} // Subtasks are never top-level
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
