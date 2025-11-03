import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useDrop } from "react-dnd";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface InfiniteCanvasProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string, color: any) => void;
  onToggleCollapse: (id: string) => void;
  onMoveTask: (taskId: string, newParentId: string | null, newPosition: { x: number; y: number } | null) => void;
}

export interface InfiniteCanvasRef {
  centerOnTask: (taskId: string) => void;
}

export const InfiniteCanvas = forwardRef<InfiniteCanvasRef, InfiniteCanvasProps>(({
  tasks,
  onToggleComplete,
  onAddSubtask,
  onToggleCollapse,
  onMoveTask,
}, ref) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const findTaskPosition = (tasks: Task[], taskId: string, parentX = 0, parentY = 0): { x: number; y: number } | null => {
    for (const task of tasks) {
      if (task.id === taskId) {
        return { x: task.x + parentX, y: task.y + parentY };
      }
      if (task.subtasks.length > 0) {
        const found = findTaskPosition(task.subtasks, taskId, task.x, task.y);
        if (found) return found;
      }
    }
    return null;
  };

  useImperativeHandle(ref, () => ({
    centerOnTask: (taskId: string) => {
      const position = findTaskPosition(tasks, taskId);
      if (position && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        // Animate to center position
        setPan({
          x: centerX - position.x - 160, // 160 is half the task width
          y: centerY - position.y - 50,
        });
      }
    },
  }));

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggingTask && (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-bg'))) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isDraggingTask) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className="fixed inset-0 top-[10vh] bg-[#FAFAF9] overflow-hidden cursor-grab active:cursor-grabbing canvas-bg"
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
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
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
              isTopLevel={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
});