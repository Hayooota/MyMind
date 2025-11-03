import React, { useState } from "react";
import { Plus, List, Trash2, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TodoList } from "../types";

interface ListsSidebarProps {
  lists: TodoList[];
  currentListId: string;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, newName: string) => void;
}

export function ListsSidebar({
  lists,
  currentListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
}: ListsSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName("");
      setIsCreating(false);
    }
  };

  const handleRenameList = (listId: string) => {
    if (editName.trim()) {
      onRenameList(listId, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  };

  const startEditing = (list: TodoList) => {
    setEditingId(list.id);
    setEditName(list.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isExpanded ? 0 : -260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-[10vh] bottom-0 w-[300px] bg-[#FAFAF9] border-r border-[#E8E6E3] z-40 shadow-sm"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#E8E6E3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-[#5A5550] opacity-60" />
            <h2 className="text-[#5A5550] opacity-80">Lists</h2>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Create new list form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pt-3 border-b border-[#E8E6E3]"
            >
              <form onSubmit={handleCreateList} className="pb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="New list name..."
                    className="flex-1 px-3 py-2 bg-white/50 border border-[#E8E6E3] rounded-lg outline-none focus:border-[#5A5550]/30 text-[#5A5550]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewListName("");
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto py-2">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`mx-2 mb-1 rounded-lg transition-colors ${
                currentListId === list.id
                  ? "bg-[#E8E6E3]"
                  : "hover:bg-[#E8E6E3]/50"
              }`}
            >
              {editingId === list.id ? (
                <div className="p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white/50 border border-[#E8E6E3] rounded outline-none focus:border-[#5A5550]/30 text-[#5A5550]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRenameList(list.id);
                      } else if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                  />
                  <button
                    onClick={() => handleRenameList(list.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="p-3 flex items-center justify-between group">
                  <button
                    onClick={() => onSelectList(list.id)}
                    className="flex-1 text-left text-[#5A5550] opacity-80"
                  >
                    {list.name}
                    <span className="ml-2 text-xs opacity-50">
                      ({list.tasks.length})
                    </span>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(list)}
                      className="p-1 text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {lists.length > 1 && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${list.name}"? This will delete all tasks in this list.`
                            )
                          ) {
                            onDeleteList(list.id);
                          }
                        }}
                        className="p-1 text-red-500 opacity-40 hover:opacity-60 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#FAFAF9] border border-[#E8E6E3] rounded-r-lg flex items-center justify-center text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
        >
          <div
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ›
          </div>
        </button>
      </div>
    </motion.div>
  );
}
