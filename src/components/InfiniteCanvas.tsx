/**
 * InfiniteCanvas.tsx - Smooth Pannable Canvas for Task Positioning
 * 
 * This component provides an infinite canvas where top-level tasks can be positioned freely.
 * Think of it like a whiteboard - you can put tasks anywhere and pan around to see everything.
 * 
 * KEY FEATURES:
 * - Smooth panning: Click and drag on empty space to move the canvas
 * - Drop zone: Drag tasks onto the canvas to position them
 * - Performance: Uses GPU-accelerated transforms for buttery-smooth 60 FPS
 * - Search integration: Can programmatically pan to any task
 * 
 * HOW PANNING WORKS:
 * 1. User clicks on empty space (not on a task)
 * 2. Mouse movement is tracked
 * 3. Canvas position updates via CSS transform
 * 4. When user releases mouse, panning stops
 * 
 * HOW DROPPING WORKS:
 * 1. User drags a task and releases it over empty canvas space
 * 2. Drop position is calculated (accounting for current pan offset)
 * 3. Task is repositioned to that absolute canvas coordinate
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - CSS transforms instead of top/left (GPU accelerated)
 * - will-change: transform (tells browser to optimize)
 * - Smooth transition when searching (cubic-bezier easing)
 * - No transition during manual panning (feels more responsive)
 * 
 * @component
 */

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useDrop } from "react-dnd";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";

/**
 * Props interface for InfiniteCanvas
 */
interface InfiniteCanvasProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string, color: any) => void;
  onToggleCollapse: (id: string) => void;
  onMoveTask: (taskId: string, newParentId: string | null, newPosition: { x: number; y: number } | null) => void;
  onEditTask?: (id: string, newTitle: string) => void;
}

/**
 * Ref interface - allows parent to control canvas programmatically
 * Used for search feature (pan to found task)
 */
export interface InfiniteCanvasRef {
  centerOnTask: (taskId: string) => void;
}

/**
 * InfiniteCanvas Component
 * 
 * Renders an infinite pannable canvas with tasks positioned at absolute coordinates.
 * Users can pan by dragging empty space and reposition tasks by drag-and-drop.
 */
export const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>(({
  tasks,
  onToggleComplete,
  onAddSubtask,
  onToggleCollapse,
  onMoveTask,
  onEditTask,
}, ref) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Current pan offset of the canvas (how much it's been moved)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Whether user is currently panning (click-and-drag on empty space)
  const [isPanning, setIsPanning] = useState(false);
  
  // Starting position when pan began (used to calculate delta)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  // Whether a task is being dragged (prevents panning during task drag)
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  
  // Reference to the canvas DOM element
  const canvasRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Find a task's absolute position in the canvas
   * 
   * This function searches the entire task tree (including subtasks) to find
   * a specific task and calculate its absolute position on the canvas.
   * 
   * WHY WE NEED THIS:
   * - Subtasks don't have their own canvas positions
   * - We need to add parent's position + subtask's relative offset
   * - Used by search feature to pan to any task
   * 
   * @param tasks - Array of tasks to search
   * @param taskId - ID of task to find
   * @param parentX - Parent's X position (for recursion)
   * @param parentY - Parent's Y position (for recursion)
   * @returns Absolute {x, y} position or null if not found
   */
  const findTaskPosition = (
    tasks: Task[], 
    taskId: string, 
    parentX = 0, 
    parentY = 0
  ): { x: number; y: number } | null => {
    // Search each task at current level
    for (const task of tasks) {
      // Found it! Return absolute position
      if (task.id === taskId) {
        return { x: task.x + parentX, y: task.y + parentY };
      }
      
      // Not found? Search subtasks recursively
      if (task.subtasks.length > 0) {
        const found = findTaskPosition(
          task.subtasks, 
          taskId, 
          task.x,
          task.y
        );
        if (found) return found;
      }
    }
    
    // Task not found in this branch
    return null;
  };

  // ============================================================================
  // IMPERATIVE HANDLE (for parent component control)
  // ============================================================================

  /**
   * Expose centerOnTask method to parent via ref
   * 
   * This allows the parent component (App.tsx) to programmatically
   * pan the canvas to center on a specific task.
   * 
   * USED BY: Search feature
   * When user searches for a task, we:
   * 1. Find the task
   * 2. Calculate where canvas needs to be to center it
   * 3. Smoothly animate to that position
   */
  useImperativeHandle(ref, () => ({
    centerOnTask: (taskId: string) => {
      // Find where the task is located
      const position = findTaskPosition(tasks, taskId);
      
      if (position && canvasRef.current) {
        // Get canvas dimensions
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        // Calculate pan needed to center the task
        // 160 = half of task card width (320px / 2)
        setPan({
          x: centerX - position.x - 160,
          y: centerY - position.y - 50,
        });
      }
    },
  }));

  // ============================================================================
  // DRAG-AND-DROP FUNCTIONALITY
  // ============================================================================

  /**
   * Drop zone for repositioning tasks on canvas
   * 
   * When a task is dropped on empty canvas space:
   * 1. Calculate where it was dropped (mouse position)
   * 2. Account for current pan offset
   * 3. Update task's position
   */
  const [, drop] = useDrop(() => ({
    accept: "TASK",
    
    drop: (item: { id: string; task: Task; isTopLevel: boolean }, monitor) => {
      const offset = monitor.getClientOffset();
      
      if (offset && item.isTopLevel) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          const x = offset.x - canvasRect.left - pan.x;
          const y = offset.y - canvasRect.top - pan.y;
          
          onMoveTask(item.id, null, { x, y });
        }
      }
      
      setIsDraggingTask(false);
    },
    
    hover: () => {
      setIsDraggingTask(true);
    },
  }));

  // ============================================================================
  // PANNING EVENT HANDLERS
  // ============================================================================

  /**
   * Start panning when mouse is pressed on empty space
   * 
   * ONLY start panning if:
   * 1. Not currently dragging a task
   * 2. Click is on empty canvas (not on a task card)
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    const isCanvasBg = e.target === canvasRef.current || 
                       (e.target as HTMLElement).closest('.canvas-bg');
    
    if (!isDraggingTask && isCanvasBg) {
      setIsPanning(true);
      setStartPan({ 
        x: e.clientX - pan.x, 
        y: e.clientY - pan.y 
      });
    }
  };

  /**
   * Update pan position as mouse moves
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isDraggingTask) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  /**
   * Stop panning when mouse is released or leaves canvas
   */
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className="fixed inset-0 top-[10vh] bg-[#FAFAF9] overflow-hidden canvas-bg"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          position: "absolute",
          top: 0,
          left: 0,
          willChange: "transform",
          transition: isPanning ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              position: "absolute",
              left: task.x,
              top: task.y,
            }}
          >
            <TaskCard
              task={task}
              level={0}
              onToggleComplete={onToggleComplete}
              onAddSubtask={onAddSubtask}
              onToggleCollapse={onToggleCollapse}
              onMoveTask={onMoveTask}
              onEditTask={onEditTask}
              isTopLevel={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
