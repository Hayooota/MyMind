import React from "react";
import { Check, Plus, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { Task, NotionColor } from "../types";
import { notionColors } from "../utils/colors";

interface TaskCardProps {
  task: Task;
  level: number;
  onToggleComplete: (id: string) => void;
  onAddSubtask: (parentId: string, title: string, color: NotionColor) => void;
  onToggleCollapse: (id: string) => void;
  onMoveTask: (taskId: string, newParentId: string | null, newPosition: { x: number; y: number } | null) => void;
  onEditTask?: (id: string, newTitle: string) => void;
  isTopLevel?: boolean;
}

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
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);
  const [subtaskTitle, setSubtaskTitle] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(task.title);
  const [lastClickTime, setLastClickTime] = React.useState(0);

  const maxLevel = 3;
  const canAddSubtask = level < maxLevel;
  const colors = notionColors[task.color];

  // Drag functionality - now enabled for all tasks, not just top level
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id, task, isTopLevel, parentId: task.parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Use empty image as drag preview to use custom drag layer (only for top-level)
  React.useEffect(() => {
    if (isTopLevel) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview, isTopLevel]);

  // Drop functionality for subtasks
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string; task: Task; isTopLevel: boolean; parentId?: string }) => {
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
      onAddSubtask(task.id, subtaskTitle, task.color);
      setSubtaskTitle("");
      setIsAddingSubtask(false);
    }
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim() && onEditTask) {
      onEditTask(task.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const width = isTopLevel ? "w-80" : `w-${Math.max(60, 80 - level * 10)}`;
  const backgroundOpacity = level === 0 ? 100 : Math.max(40, 100 - level * 20);

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: "grab",
        transition: "opacity 0.1s ease",
      }}
      onClick={handleDoubleClick}
      className="group"
    >
      <motion.div
        ref={drop}
        className={`${width} ${colors.bg} ${colors.border} border-2 rounded-xl p-4 shadow-sm relative`}
        whileHover={{ scale: isOver ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {level > 0 && (
          <div
            className="absolute inset-0 bg-white rounded-xl pointer-events-none"
            style={{ opacity: level * 0.35 }}
          />
        )}
        <div className="relative z-10">
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

            {isEditing ? (
              <form onSubmit={handleEdit} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`flex-1 px-2 py-1 bg-white/70 border ${colors.border} rounded outline-none`}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => {
                    if (editTitle.trim()) {
                      handleEdit({ preventDefault: () => {} } as React.FormEvent);
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditTitle(task.title);
                    }
                  }}
                />
              </form>
            ) : (
              <span className={`flex-1 ${colors.text} ${task.completed ? "line-through opacity-50" : ""}`}>
                {task.title}
              </span>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEditTask && !isEditing && (
                <button
                  onClick={startEditing}
                  className="opacity-40 hover:opacity-60 transition-opacity"
                  title="Edit task"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}

              {canAddSubtask && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingSubtask(!isAddingSubtask);
                  }}
                  className="opacity-40 hover:opacity-60 transition-opacity"
                  title="Add subtask"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
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
                  onEditTask={onEditTask}
                  isTopLevel={false}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}