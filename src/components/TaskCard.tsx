import React from "react";
import { Check, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useDrag, useDrop } from "react-dnd";
import { Task, NotionColor } from "../types";
import { notionColors } from "../utils/colors";

interface TaskCardProps {
  task: Task;
  level: number;
  onToggleComplete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string, color: NotionColor) => void;
  onToggleCollapse: (id: string) => void;
  onMoveTask: (taskId: string, newParentId: string | null, newPosition: { x: number; y: number } | null) => void;
  isTopLevel?: boolean;
}

export function TaskCard({
  task,
  level,
  onToggleComplete,
  onAddSubtask,
  onToggleCollapse,
  onMoveTask,
  isTopLevel = false,
}: TaskCardProps) {
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  const [subtaskTitle, setSubtaskTitle] = React.useState("");
  const [subtaskColor, setSubtaskColor] = React.useState<NotionColor>("blue");
  const [lastClickTime, setLastClickTime] = React.useState(0);

  const maxLevel = 3;
  const canAddSubtask = level < maxLevel;
  const colors = notionColors[task.color];

  // Drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id, isTopLevel, parentId: task.parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Drop functionality for subtasks
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string; isTopLevel: boolean; parentId?: string }) => {
      if (item.id !== task.id && canAddSubtask) {
        onMoveTask(item.id, task.id, null);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleDoubleClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 300) {
      onToggleCollapse(task.id);
    }
    setLastClickTime(now);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (subtaskTitle.trim()) {
      onAddSubtask(task.id, subtaskTitle, subtaskColor);
      setSubtaskTitle("");
      setIsAddingSubtask(false);
    }
  };

  const width = isTopLevel ? "w-80" : `w-${Math.max(60, 80 - level * 10)}`;
  const opacity = level === 0 ? 100 : Math.max(70, 100 - level * 10);

  return (
    <div
      ref={(node) => {
        if (isTopLevel) {
          drag(node);
        }
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isTopLevel ? "move" : "default",
      }}
      onClick={handleDoubleClick}
    >
      <motion.div
        ref={drop}
        className={`${width} ${colors.bg} ${colors.border} border-2 rounded-xl p-4 shadow-sm`}
        style={{ opacity: opacity / 100 }}
        whileHover={{ scale: isOver ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`w-5 h-5 rounded border-2 ${colors.border} flex items-center justify-center opacity-30 hover:opacity-60 transition-opacity`}
          >
            {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
          </button>

          <span className={`flex-1 ${colors.text} ${task.completed ? "line-through opacity-50" : ""}`}>
            {task.title}
          </span>

          {canAddSubtask && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingSubtask(!isAddingSubtask);
              }}
              className="opacity-30 hover:opacity-60 transition-opacity"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {isAddingSubtask && (
          <form onSubmit={handleAddSubtask} className="mt-3">
            <input
              type="text"
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              placeholder="Subtask name..."
              className={`w-full px-3 py-1.5 bg-white/50 border ${colors.border} rounded-lg outline-none`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </form>
        )}

        {!task.collapsed && task.subtasks.length > 0 && (
          <div className="mt-3 space-y-2 ml-4">
            {task.subtasks.map((subtask) => (
              <TaskCard
                key={subtask.id}
                task={subtask}
                level={level + 1}
                onToggleComplete={onToggleComplete}
                onAddSubtask={onAddSubtask}
                onToggleCollapse={onToggleCollapse}
                onMoveTask={onMoveTask}
                isTopLevel={false}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
