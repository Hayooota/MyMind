/**
 * ColorPalette.tsx - Color Selection Component
 * 
 * This component renders a horizontal palette of all 9 Notion colors
 * for selecting task colors when creating new tasks.
 * 
 * Features:
 * - Displays all 9 Notion colors as circular buttons
 * - Staggered fade-in animation (cascade effect)
 * - Hover scale effect for better interactivity
 * - Accessible with aria-labels
 * 
 * Design:
 * - Circular color swatches (7x7 grid)
 * - 2px colored border matching each color
 * - Background fill in color's light shade
 * - Hover enlarges button slightly (scale 1.1x)
 * 
 * Animation:
 * - Each color appears with 50ms delay after previous
 * - Creates pleasing cascade effect from left to right
 * - Total animation time: 450ms for all 9 colors
 * 
 * @component
 */

import { motion } from "motion/react"; // Animation library
import { NotionColor } from "../types"; // Type for color options
import { notionColors } from "../utils/colors"; // Color definitions

/**
 * Props interface for ColorPalette component
 * @interface ColorPaletteProps
 */
interface ColorPaletteProps {
  onSelectColor: (color: NotionColor) => void;  // Callback when color is selected
  className?: string;                           // Optional additional CSS classes
}

/**
 * ColorPalette Component
 * 
 * Renders a row of color selector buttons with staggered animation.
 * Each button is a circular swatch of one of the 9 Notion colors.
 * 
 * @param {ColorPaletteProps} props - Component props
 */
export function ColorPalette({ onSelectColor, className = "" }: ColorPaletteProps) {
  /**
   * Array of all available colors
   * 
   * Order matches Notion's palette:
   * Gray, Brown, Orange, Yellow, Green, Blue, Purple, Pink, Red
   * 
   * This order provides good visual flow from neutral to warm to cool.
   */
  const colors: NotionColor[] = [
    "gray",    // Neutral
    "brown",   // Neutral-warm
    "orange",  // Warm
    "yellow",  // Warm-bright
    "green",   // Cool
    "blue",    // Cool (default)
    "purple",  // Cool-saturated
    "pink",    // Warm-saturated
    "red",     // Warm-intense
  ];

  return (
    // Container: Horizontal flex layout with small gaps between colors
    <div className={`flex gap-2 ${className}`}>
      {colors.map((color, index) => (
        /**
         * Color Button
         * 
         * Each button is a Motion component for animations.
         * 
         * Styling:
         * - w-7 h-7: 28px × 28px circle
         * - rounded-full: Perfect circle
         * - border-2: 2px border
         * - Tailwind classes from notionColors map:
         *   - bg: Background color (light shade)
         *   - border: Border color (darker shade)
         * 
         * Interactions:
         * - hover:scale-110: Enlarge 10% on hover
         * - transition-transform: Smooth scale animation
         * - onClick: Call parent callback with selected color
         * 
         * Accessibility:
         * - aria-label: Screen reader support
         * - key: React list key for efficient re-rendering
         * 
         * Animation:
         * - initial: Start invisible and above final position
         * - animate: Fade in and slide down
         * - transition:
         *   - delay: Staggered based on index (50ms per color)
         *   - duration: 300ms fade-in
         *   - ease: easeOut for natural deceleration
         */
        <motion.button
          key={color}
          onClick={() => onSelectColor(color)}
          className={`w-7 h-7 rounded-full border-2 ${notionColors[color].bg} ${notionColors[color].border} hover:scale-110 transition-transform`}
          aria-label={`Select ${color} color`}
          
          // Animation: Cascade effect
          initial={{ opacity: 0, y: -20 }}  // Start invisible, 20px above
          animate={{ opacity: 1, y: 0 }}    // Fade in, slide to position
          transition={{ 
            delay: index * 0.05,  // Each color 50ms after previous
            duration: 0.3,        // 300ms animation
            ease: "easeOut"       // Natural deceleration
          }}
        />
      ))}
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 * 
 * <ColorPalette 
 *   onSelectColor={(color) => setSelectedColor(color)}
 * />
 * 
 * When user clicks a color:
 * 1. Button scales up on hover
 * 2. onClick fires
 * 3. Parent component receives color value
 * 4. Parent can use color for new task
 */
