import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { TodoList } from "../types";

interface MoveTaskDialogProps {
  isOpen: boolean;
  taskTitle: string;
  currentListName: string;
  lists: TodoList[];
  onMove: (targetListId: string) => void;
  onClose: () => void;
}

export function MoveTaskDialog({
  isOpen,
  taskTitle,
  currentListName,
  lists,
  onMove,
  onClose,
}: MoveTaskDialogProps) {
  const [selectedListId, setSelectedListId] = useState<string>("");

  const handleMove = () => {
    if (selectedListId) {
      onMove(selectedListId);
      setSelectedListId("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#FAFAF9] rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#3D3630] opacity-80">Move Task</h2>
              <button
                onClick={onClose}
                className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[#5A5550] opacity-60 text-sm mb-2">Task:</p>
              <p className="text-[#3D3630] opacity-90 px-4 py-3 bg-white/50 rounded-lg border border-[#E8E6E3]">
                {taskTitle}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[#5A5550] opacity-60 text-sm mb-2">From:</p>
              <p className="text-[#3D3630] opacity-70 px-4 py-3 bg-white/30 rounded-lg border border-[#E8E6E3]">
                {currentListName}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[#5A5550] opacity-60 text-sm mb-2">To:</p>
              <div className="space-y-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                      selectedListId === list.id
                        ? "bg-[#3D3630] text-white border-[#3D3630]"
                        : "bg-white/50 text-[#3D3630] border-[#E8E6E3] hover:border-[#5A5550]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{list.name}</span>
                      {selectedListId === list.id && (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/50 text-[#5A5550] rounded-lg border border-[#E8E6E3] hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={!selectedListId}
                className="flex-1 px-4 py-3 bg-[#3D3630] text-white rounded-lg hover:bg-[#3D3630]/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Move Task
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
