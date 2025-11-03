/**
 * Header.tsx - Top Navigation Bar Component
 * 
 * This component renders the fixed header at the top of the application.
 * It provides three main functions:
 * 1. Search interface (left icon)
 * 2. Personalized title display (center) or active input (search/create)
 * 3. Create task interface (right icon)
 * 
 * Features:
 * - Toggleable search and create modals (inline in header)
 * - Color palette dropdown when creating tasks
 * - Logout button with user name display
 * - Smooth animations when switching modes
 * - Personalized title: "[User's Name]'s Mind"
 * 
 * Design Philosophy:
 * - Minimal and unobtrusive
 * - Only one modal active at a time (search OR create, not both)
 * - Empty placeholders (just cursor) for cleaner aesthetic
 * - Icons use Lucide React for consistency
 * 
 * @component
 */

import { Search, Plus, LogOut } from "lucide-react"; // Icon components
import { motion } from "motion/react"; // Animation library
import React from "react";
import { NotionColor } from "../types"; // Type for color selection
import { ColorPalette } from "./ColorPalette"; // Color selector dropdown

/**
 * Props interface for Header component
 * @interface HeaderProps
 */
interface HeaderProps {
  isAdding: boolean;           // Whether create task modal is open
  isSearching: boolean;        // Whether search modal is open
  onToggleAdd: () => void;     // Toggle create task modal
  onToggleSearch: () => void;  // Toggle search modal
  onCreateTask: (title: string, color: NotionColor) => void;  // Create new task callback
  onSearch: (query: string) => void;  // Search callback
  userName?: string;           // User's display name (optional)
  onLogout?: () => void;       // Logout callback (optional)
}

/**
 * Header Component
 * 
 * Renders the top navigation bar with search, title/input, and create button.
 * Manages three states:
 * 1. Default: Show title and icons
 * 2. Adding: Show create task input and color palette
 * 3. Searching: Show search input
 */
export function Header({ 
  isAdding, 
  isSearching, 
  onToggleAdd, 
  onToggleSearch, 
  onCreateTask, 
  onSearch, 
  userName, 
  onLogout 
}: HeaderProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // State: Title for new task being created
  const [taskTitle, setTaskTitle] = React.useState("");
  
  // State: Selected color for new task (defaults to blue)
  const [selectedColor, setSelectedColor] = React.useState<NotionColor>("blue");
  
  // State: Search query entered by user
  const [searchQuery, setSearchQuery] = React.useState("");

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle task creation form submission
   * 
   * Flow:
   * 1. Prevent default form submission (no page reload)
   * 2. Validate title is not empty
   * 3. Call parent callback with title and color
   * 4. Reset form state
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Only create task if title is not empty (after trimming whitespace)
    if (taskTitle.trim()) {
      onCreateTask(taskTitle, selectedColor);
      
      // Reset form to default state
      setTaskTitle("");
      setSelectedColor("blue"); // Reset to default color
    }
  };

  /**
   * Handle search form submission
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Validate query is not empty
   * 3. Call parent callback with query
   * 
   * Note: Parent component (App.tsx) handles closing the search modal,
   * so we don't reset searchQuery here.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Only search if query is not empty
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      // Note: searchQuery is NOT cleared here because the search modal
      // closes automatically, and clearing would look jarring
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    // Fixed header at top of screen
    // Takes up 10% of viewport height (10vh)
    // Always visible even when scrolling canvas
    <header className="fixed top-0 left-0 right-0 h-[10vh] bg-[#FAFAF9] border-b border-[#E8E6E3] z-50">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* ====================================================================
            LEFT SECTION: Search and Logout
        ==================================================================== */}
        <div className="flex items-center gap-4">
          {/* SEARCH BUTTON - Opens search modal */}
          <button
            onClick={onToggleSearch}
            className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
            title="Search tasks"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* LOGOUT BUTTON - Only shown when user is authenticated */}
          {userName && onLogout && (
            <button
              onClick={onLogout}
              className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity flex items-center gap-2"
              title={`Logged in as ${userName}`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">{userName}</span>
            </button>
          )}
        </div>

        {/* ====================================================================
            CENTER SECTION: Title or Active Input
            
            Three possible states:
            1. Default: Show "[Name]'s Mind"
            2. Adding: Show task creation input
            3. Searching: Show search input
        ==================================================================== */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* STATE 1: DEFAULT - Show personalized title */}
          {!isAdding && !isSearching ? (
            <h1 className="text-[#5A5550] opacity-60">
              {userName ? `${userName}'s Mind` : "My Mind"}
            </h1>
          ) : isAdding ? (
            // STATE 2: ADDING - Show task creation form
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="" // Empty placeholder = just blinking cursor
                className="w-full bg-transparent border-none outline-none text-center text-[#5A5550]"
                autoFocus // Automatically focus when form appears
              />
            </form>
          ) : (
            // STATE 3: SEARCHING - Show search form
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="" // Empty placeholder = just blinking cursor
                className="w-full bg-transparent border-none outline-none text-center text-[#5A5550]"
                autoFocus // Automatically focus when form appears
              />
            </form>
          )}
        </div>

        {/* ====================================================================
            RIGHT SECTION: Add Task Button
            
            Uses Motion for smooth rotation animation:
            - Default: + icon (0 degrees)
            - Active: × icon (45 degrees rotation)
        ==================================================================== */}
        <motion.button
          onClick={onToggleAdd}
          animate={{ rotate: isAdding ? 45 : 0 }} // Rotate to X when active
          transition={{ duration: 0.2 }}          // 200ms smooth transition
          className="text-[#5A5550] opacity-40 hover:opacity-60 transition-opacity"
          title={isAdding ? "Cancel" : "Add task"}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
      
      {/* ======================================================================
          COLOR PALETTE DROPDOWN
          
          Only shown when creating a task (isAdding = true).
          Positioned absolutely below the header, centered horizontally.
          
          The ColorPalette component renders the 9 Notion colors for selection.
          When user clicks a color, it updates selectedColor state via callback.
      ====================================================================== */}
      {isAdding && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50">
          <ColorPalette onSelectColor={setSelectedColor} />
        </div>
      )}
    </header>
  );
}
