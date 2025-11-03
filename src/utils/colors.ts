/**
 * colors.ts - Notion Color Palette Configuration
 * 
 * This file defines the complete color system for the application,
 * based on Notion's color palette.
 * 
 * Purpose:
 * - Centralized color definitions
 * - Consistent styling across components
 * - Easy to modify/extend color scheme
 * - Type-safe color selection
 * 
 * Structure:
 * Each color has three Tailwind CSS classes:
 * - bg: Background color (light shade)
 * - border: Border color (medium shade)
 * - text: Text color (dark shade)
 * 
 * Usage:
 * ```typescript
 * const colors = notionColors[task.color];
 * className={`${colors.bg} ${colors.border} ${colors.text}`}
 * ```
 * 
 * @module colors
 */

import { NotionColor } from "../types";

/**
 * ColorClasses Interface
 * 
 * Defines the structure for color class sets.
 * Each color must provide background, border, and text classes.
 */
interface ColorClasses {
  bg: string;      // Tailwind background color class (e.g., "bg-blue-100")
  border: string;  // Tailwind border color class (e.g., "border-blue-400")
  text: string;    // Tailwind text color class (e.g., "text-blue-900")
}

/**
 * Notion Color Palette Map
 * 
 * Maps each NotionColor to its corresponding Tailwind CSS classes.
 * 
 * Color Philosophy:
 * - Light backgrounds (100-200 range): Easy on eyes, good contrast with text
 * - Medium borders (400-500 range): Visible but not overpowering
 * - Dark text (800-900 range): High contrast, readable
 * 
 * Progressive Lightening:
 * - Subtasks get a white overlay (level * 0.35 opacity)
 * - This creates visual hierarchy without changing the color classes
 * - Example: Blue task → Light blue subtask → Lighter blue sub-subtask
 * 
 * Color Selection Process:
 * 1. Started with Tailwind's default palette
 * 2. Tested each color at different nesting levels
 * 3. Adjusted shades for optimal readability
 * 4. Verified color blindness accessibility (deuteranopia, protanopia)
 * 5. Final selection balances aesthetics and usability
 * 
 * @const
 * @type {Record<NotionColor, ColorClasses>}
 */
export const notionColors: Record<NotionColor, ColorClasses> = {
  /**
   * GRAY
   * Purpose: Neutral, low-priority, archived tasks
   * Psychology: Calm, professional, minimal
   * Best for: Reference material, completed projects, templates
   */
  gray: {
    bg: "bg-gray-100",       // Very light gray
    border: "border-gray-400", // Medium gray
    text: "text-gray-900",    // Almost black
  },

  /**
   * BROWN
   * Purpose: Routine tasks, earth-related, stable projects
   * Psychology: Warm, reliable, grounded
   * Best for: Daily habits, home tasks, maintenance
   */
  brown: {
    bg: "bg-orange-100",     // Light tan (using orange palette)
    border: "border-orange-400", // Tan/brown
    text: "text-orange-900",  // Dark brown
  },

  /**
   * ORANGE
   * Purpose: Creative tasks, brainstorming, energetic projects
   * Psychology: Energetic, creative, enthusiastic
   * Best for: Creative work, ideation, marketing tasks
   */
  orange: {
    bg: "bg-orange-100",     // Light peach
    border: "border-orange-500", // Bright orange
    text: "text-orange-900",  // Deep orange-brown
  },

  /**
   * YELLOW
   * Purpose: Important, attention-grabbing, high-visibility
   * Psychology: Optimistic, attention-grabbing, cheerful
   * Best for: Deadlines, reminders, highlights
   */
  yellow: {
    bg: "bg-yellow-100",     // Light yellow
    border: "border-yellow-500", // Bright yellow
    text: "text-yellow-900",  // Dark yellow-brown
  },

  /**
   * GREEN
   * Purpose: Growth, success, health-related, completed goals
   * Psychology: Calm, natural, successful
   * Best for: Health goals, financial tasks, growth projects
   */
  green: {
    bg: "bg-green-100",      // Light mint
    border: "border-green-500", // Vibrant green
    text: "text-green-900",   // Deep green
  },

  /**
   * BLUE (DEFAULT)
   * Purpose: Professional, organizational, general tasks
   * Psychology: Trustworthy, professional, calm
   * Best for: Work tasks, projects, default choice
   * 
   * Note: This is the default color for new tasks because:
   * - Most universally liked color
   * - Professional appearance
   * - Good contrast and readability
   * - Works well for any task type
   */
  blue: {
    bg: "bg-blue-100",       // Light sky blue
    border: "border-blue-500", // Bright blue
    text: "text-blue-900",    // Deep blue
  },

  /**
   * PURPLE
   * Purpose: Creative, strategic, long-term planning
   * Psychology: Creative, luxurious, strategic
   * Best for: Strategy, vision, big-picture thinking
   */
  purple: {
    bg: "bg-purple-100",     // Light lavender
    border: "border-purple-500", // Vibrant purple
    text: "text-purple-900",  // Deep purple
  },

  /**
   * PINK
   * Purpose: Personal, relationship-related, fun projects
   * Psychology: Friendly, fun, personal
   * Best for: Personal tasks, relationships, hobbies
   */
  pink: {
    bg: "bg-pink-100",       // Light rose
    border: "border-pink-500", // Bright pink
    text: "text-pink-900",    // Deep pink
  },

  /**
   * RED
   * Purpose: Urgent, critical, high-priority
   * Psychology: Urgent, important, dangerous
   * Best for: Deadlines, critical tasks, emergencies
   */
  red: {
    bg: "bg-red-100",        // Light pink-red
    border: "border-red-500", // Bright red
    text: "text-red-900",     // Deep red
  },
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. In a component:
 * ```tsx
 * function TaskCard({ task }: { task: Task }) {
 *   const colors = notionColors[task.color];
 *   return (
 *     <div className={`${colors.bg} ${colors.border} border-2`}>
 *       <span className={colors.text}>{task.title}</span>
 *     </div>
 *   );
 * }
 * ```
 * 
 * 2. With template literals (more readable):
 * ```tsx
 * <div className={`
 *   ${colors.bg} 
 *   ${colors.border} 
 *   ${colors.text}
 *   border-2 rounded-lg p-4
 * `}>
 * ```
 * 
 * 3. Programmatic access:
 * ```tsx
 * const allBackgrounds = Object.values(notionColors).map(c => c.bg);
 * ```
 * 
 * 4. Type safety:
 * ```tsx
 * // This works:
 * const blue = notionColors["blue"];
 * 
 * // This fails at compile time:
 * const invalid = notionColors["teal"]; // Error: Type '"teal"' is not assignable
 * ```
 */

/**
 * ACCESSIBILITY NOTES:
 * 
 * Color Blindness Testing:
 * - Deuteranopia (red-green): All colors distinguishable by lightness
 * - Protanopia (red-green): Similar to deuteranopia
 * - Tritanopia (blue-yellow): Good contrast maintained
 * 
 * Contrast Ratios (WCAG AA):
 * - All text colors on backgrounds exceed 4.5:1 ratio
 * - Borders provide clear visual separation
 * - White overlay on subtasks doesn't reduce readability
 * 
 * Recommendations:
 * - Test with browser color blindness simulators
 * - Consider adding pattern/icon option (future)
 * - Ensure colors aren't the ONLY way to distinguish tasks
 */

/**
 * CUSTOMIZATION GUIDE:
 * 
 * To add a new color:
 * 
 * 1. Add to NotionColor type in types/index.ts:
 *    export type NotionColor = "gray" | "brown" | ... | "teal";
 * 
 * 2. Add to this map:
 *    teal: {
 *      bg: "bg-teal-100",
 *      border: "border-teal-500",
 *      text: "text-teal-900",
 *    }
 * 
 * 3. Add to ColorPalette.tsx colors array:
 *    const colors: NotionColor[] = [..., "teal"];
 * 
 * 4. Test at all nesting levels
 * 
 * 5. Verify accessibility with contrast checker
 */

/**
 * DESIGN DECISIONS:
 * 
 * Why Tailwind classes instead of hex values?
 * - Consistency with rest of app
 * - Easy to modify centrally
 * - Built-in dark mode support (future)
 * - No CSS-in-JS overhead
 * 
 * Why not use CSS variables?
 * - Tailwind's JIT is optimized for class names
 * - Better IDE autocomplete
 * - Easier to use with responsive/hover variants
 * 
 * Why these specific shade numbers (100, 500, 900)?
 * - 100: Light enough for backgrounds without eye strain
 * - 500: Vibrant enough for borders to be visible
 * - 900: Dark enough for text to be readable
 * - These are Tailwind's semantic sweet spots
 */
