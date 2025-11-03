import { Search, Plus, X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { NotionColor } from "../types";
import { ColorPalette } from "./ColorPalette";

interface HeaderProps {
  isAdding: boolean;
  isSearching: boolean;
  onToggleAdd: () => void;
  onToggleSearch: () => void;
  onCreateTask: (title: string, color: NotionColor) => void;
  onSearch: (query: string) => void;
}

export function Header({ isAdding, isSearching, onToggleAdd, onToggleSearch, onCreateTask, onSearch }: HeaderProps) {
  const [taskTitle, setTaskTitle] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState<NotionColor>("blue");
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onCreateTask(taskTitle, selectedColor);
      setTaskTitle("");
      setSelectedColor("blue");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[10vh] bg-[#FAFAF9] border-b border-[#E8E6E3] z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <button
          onClick={onToggleSearch}
          className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
        >
          <Search className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center">
          {!isAdding && !isSearching ? (
            <h1 className="text-[#5A5550] opacity-60">My Mind</h1>
          ) : isAdding ? (
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="..."
                className="w-full bg-transparent border-none outline-none text-center text-[#5A5550] placeholder:text-[#5A5550] placeholder:opacity-40"
                autoFocus
              />
            </form>
          ) : (
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full bg-transparent border-none outline-none text-center text-[#5A5550] placeholder:text-[#5A5550] placeholder:opacity-40"
                autoFocus
              />
            </form>
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
      
      {/* Color palette below header */}
      {isAdding && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50">
          <ColorPalette onSelectColor={setSelectedColor} />
        </div>
      )}
    </header>
  );
}