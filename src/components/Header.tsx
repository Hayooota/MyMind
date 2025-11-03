import { Search, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import { NotionColor } from "../types";
import { ColorPalette } from "./ColorPalette";

interface HeaderProps {
  isAdding: boolean;
  onToggleAdd: () => void;
  onCreateTask: (title: string, color: NotionColor) => void;
}

export function Header({ isAdding, onToggleAdd, onCreateTask }: HeaderProps) {
  const [taskTitle, setTaskTitle] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState<NotionColor>("blue");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onCreateTask(taskTitle, selectedColor);
      setTaskTitle("");
      setSelectedColor("blue");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[10vh] bg-[#FAFAF9] border-b border-[#E8E6E3] z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <Search className="w-5 h-5 text-[#5A5550] opacity-40" />

        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          {!isAdding ? (
            <h1 className="text-[#5A5550] opacity-60">My Mind</h1>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="w-full max-w-md">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task name..."
                  className="w-full bg-transparent border-none outline-none text-center text-[#5A5550] placeholder:text-[#5A5550] placeholder:opacity-40"
                  autoFocus
                />
              </form>
              <ColorPalette
                onSelectColor={setSelectedColor}
                className="animate-in fade-in duration-200"
              />
            </>
          )}
        </div>

        <motion.button
          onClick={onToggleAdd}
          animate={{ rotate: isAdding ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
}

import React from "react";
