/**
 * TrashZone.tsx - Task Deletion Drop Zone Component
 * 
 * This component renders a trash can icon at the bottom center of the screen
 * that acts as a drop zone for deleting tasks via drag-and-drop.
 * 
 * Features:
 * - Fixed position at bottom of screen
 * - Accepts dropped tasks from anywhere (any nesting level)
 * - Visual feedback when hovering with a task:
 *   - Icon scales up (1.2x)
 *   - Background appears (light red)
 *   - Icon color changes to red
 *   - Icon opacity increases
 * - Animated SVG trash can with custom design
 * 
 * User Experience:
 * - Always visible but unobtrusive (low opacity)
 * - Clear affordance: "drop here to delete"
 * - Immediate visual feedback on hover
 * - Safe: Only triggers on direct hover (not accidental nearby drops)
 * 
 * Design Decision:
 * - Bottom center position: Easy to find, out of the way
 * - Circular background: Matches color palette buttons
 * - Red on hover: Universal color for delete/danger
 * - Scale animation: Confirms target is active
 * 
 * @component
 */

import { Trash2 } from "lucide-react"; // Trash icon (alternative design)
import { useDrop } from "react-dnd"; // Drag-and-drop hook
import { motion } from "motion/react"; // Animation library

/**
 * Props interface for TrashZone component
 * @interface TrashZoneProps
 */
interface TrashZoneProps {
  onDeleteTask: (taskId: string) => void;  // Callback to permanently delete task
}

/**
 * TrashZone Component
 * 
 * Renders a drop zone for task deletion.
 * When a task is dropped here, it's permanently deleted from the tree.
 * 
 * @param {TrashZoneProps} props - Component props
 */
export function TrashZone({ onDeleteTask }: TrashZoneProps) {
  /**
   * DROP ZONE CONFIGURATION
   * 
   * Uses react-dnd's useDrop hook to create a drop target.
   * 
   * accept: "TASK" - Only accepts items with type "TASK"
   * drop: Callback when item is dropped
   *   - Receives the dragged item (contains task ID)
   *   - Calls parent's onDeleteTask with ID
   *   - Parent removes task from state
   * collect: Tracks hover state for visual feedback
   *   - isOver: true when task is hovering over drop zone
   */
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK", // Accept draggable items of type "TASK"
    
    /**
     * Drop handler
     * 
     * Called when user releases mouse while hovering over trash zone.
     * The item parameter contains all data passed from useDrag in TaskCard.
     * 
     * @param {Object} item - Dragged item data
     * @param {string} item.id - Unique task ID
     * @param {Task} item.task - Full task object
     * @param {boolean} item.isTopLevel - Whether task is root-level
     */
    drop: (item: { id: string; task: any; isTopLevel: boolean }) => {
      onDeleteTask(item.id); // Delete the task
      // Note: We don't need to check if task exists - parent handles that
    },
    
    /**
     * Collect function
     * 
     * Maps drag-drop monitor state to component props.
     * Re-runs whenever drag state changes.
     * 
     * @param {DropTargetMonitor} monitor - Drag-drop state monitor
     * @returns {Object} Object merged into component props
     */
    collect: (monitor) => ({
      isOver: monitor.isOver(), // Is a draggable task hovering over this zone?
    }),
  }));

  return (
    /**
     * Container
     * 
     * Position:
     * - fixed: Stays in same place even when canvas pans
     * - bottom-6: 24px from bottom of screen
     * - left-1/2: Centered horizontally (50% from left)
     * - -translate-x-1/2: Offset back by own width to truly center
     * 
     * Z-index:
     * - z-50: Appears above canvas but below header
     * 
     * Drop Ref:
     * - ref={drop}: Marks this element as a drop target
     */
    <div
      ref={drop}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      {/**
       * Animated Wrapper
       * 
       * Uses Motion for smooth visual feedback:
       * - Scale: Normal (1.0) → Enlarged (1.2) when hovering with task
       * - Opacity: Subtle (0.3) → Visible (0.8) when hovering with task
       * - Background: Transparent → Light red when hovering with task
       * 
       * Transition:
       * - duration: 200ms for all property changes
       * - Matches app's standard animation speed
       * 
       * Styling:
       * - p-4: Padding creates larger hit area (easier to drop on)
       * - rounded-full: Circular background
       * - transition-colors: Smooth background color change
       * - relative: Positions child absolutely if needed
       */}
      <motion.div
        animate={{
          scale: isOver ? 1.2 : 1,         // Enlarge when task hovering
          opacity: isOver ? 0.8 : 0.3,     // More visible when active
        }}
        transition={{ duration: 0.2 }}    // Smooth 200ms transition
        className={`p-4 rounded-full ${ 
          isOver ? "bg-red-100" : "bg-transparent"  // Light red background when hovering
        } transition-colors relative`}
      >
        {/**
         * TRASH CAN SVG
         * 
         * Custom SVG trash can icon with animated lid.
         * Uses Lucide's Trash2 icon as reference but customized.
         * 
         * Structure:
         * - Lid (top horizontal line)
         * - Handle (small rectangle on lid)
         * - Body (main container)
         * - Inner lines (vertical stripes inside)
         * 
         * Dimensions:
         * - 24x24px viewBox
         * - Scales with container
         * 
         * Color:
         * - Default: Neutral brown (#5A5550)
         * - Hover with task: Red (#EF4444)
         * 
         * Animation:
         * - Lid could animate open (not currently implemented)
         * - Inner lines fade out on hover (for "full" effect)
         */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isOver ? "text-red-500" : "text-[#5A5550]"}
        >
          {/* Top horizontal line (lid top edge) */}
          <path
            d="M3 6H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Handle on lid (small raised section) */}
          <path
            d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/**
           * Main body (can container)
           * 
           * Motion path for potential animation.
           * Currently static, but could animate:
           * - Lid opening (rotate origin at top)
           * - Shaking (when hovering)
           * - Filling up (when multiple deletes)
           * 
           * For future enhancement:
           * animate={{
           *   d: isOver ? [openLidPath] : [closedLidPath]
           * }}
           */}
          <motion.path
            d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              // Could add lid animation here
              d: isOver
                ? "M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
                : "M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6",
              transformOrigin: "center top",
            }}
            style={{
              transformOrigin: "50% 25%", // Rotation point for lid animation
            }}
          />
          
          {/**
           * Inner lines (vertical stripes inside trash can)
           * 
           * Fade out when hovering to suggest trash is "filling up"
           * or to make icon simpler/bolder when active.
           */}
          <motion.g
            animate={{
              opacity: isOver ? 0.3 : 1, // Fade out on hover
            }}
          >
            {/* Left vertical line */}
            <path
              d="M10 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Right vertical line */}
            <path
              d="M14 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * USAGE NOTES:
 * 
 * 1. This component should be rendered at the root level of the app,
 *    not inside the canvas, so it stays fixed during panning.
 * 
 * 2. The onDeleteTask callback should handle:
 *    - Removing task from state
 *    - Removing task from all parent task subtask arrays
 *    - Triggering auto-save
 * 
 * 3. Drop only triggers on direct hover. The hit area is the circular
 *    background (p-4 padding = 32px diameter).
 * 
 * 4. No confirmation dialog - deletion is immediate. Consider adding
 *    an undo toast notification for better UX.
 * 
 * ACCESSIBILITY:
 * - Could add aria-label for screen readers
 * - Could add keyboard shortcut (Delete key) for deletion
 * - Consider alternative deletion method for users who can't drag
 */
