import React, { useRef, useState } from "react";
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

export function InfiniteCanvas({
  tasks,
  onToggleComplete,
  onAddSubtask,
  onToggleCollapse,
  onMoveTask,
}: InfiniteCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string; isTopLevel: boolean }, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && item.isTopLevel) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          const x = offset.x - canvasRect.left - pan.x;
          const y = offset.y - canvasRect.top - pan.y;
          onMoveTask(item.id, null, { x, y });
        }
      }
    },
  }));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.canvas-bg')) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
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
}
