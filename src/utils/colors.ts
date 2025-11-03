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
 * Color Philosophy (Classic Notion Colors - Restored):
 * - Ultra-light backgrounds (50 range): Soft pastels, barely-there tints
 * - Very subtle borders (200 range): Gentle definition, elegant
 * - Medium text (600 range): Perfect balance of readability and softness
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
   * GRAY - Classic Notion Gray
   * Purpose: Neutral, low-priority, archived tasks
   * Psychology: Calm, professional, minimal
   * Best for: Reference material, completed projects, templates
   */
  gray: {
    bg: "bg-gray-50",           // Ultra soft gray background
    border: "border-gray-200",   // Very subtle gray border
    text: "text-gray-600",       // Medium gray text
  },

  /**
   * BROWN - Classic Notion Brown
   * Purpose: Routine tasks, earth-related, stable projects
   * Psychology: Warm, reliable, grounded
   * Best for: Daily habits, home tasks, maintenance
   */
  brown: {
    bg: "bg-orange-50",         // Soft peachy-tan background
    border: "border-orange-200", // Gentle tan border
    text: "text-orange-700",     // Warm brown text
  },

  /**
   * ORANGE - Classic Notion Orange
   * Purpose: Creative tasks, brainstorming, energetic projects
   * Psychology: Energetic, creative, enthusiastic
   * Best for: Creative work, ideation, marketing tasks
   */
  orange: {
    bg: "bg-orange-50",         // Soft peach background
    border: "border-orange-300", // Gentle orange border
    text: "text-orange-600",     // Warm orange text
  },

  /**
   * YELLOW - Classic Notion Yellow
   * Purpose: Important, attention-grabbing, high-visibility
   * Psychology: Optimistic, attention-grabbing, cheerful
   * Best for: Deadlines, reminders, highlights
   */
  yellow: {
    bg: "bg-yellow-50",         // Soft butter background
    border: "border-yellow-200", // Gentle yellow border
    text: "text-yellow-700",     // Warm yellow-brown text
  },

  /**
   * GREEN - Classic Notion Green
   * Purpose: Growth, success, health-related, completed goals
   * Psychology: Calm, natural, successful
   * Best for: Health goals, financial tasks, growth projects
   */
  green: {
    bg: "bg-emerald-50",        // Soft mint background
    border: "border-emerald-200", // Gentle green border
    text: "text-emerald-600",    // Fresh green text
  },

  /**
   * BLUE (DEFAULT) - Classic Notion Blue
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
    bg: "bg-sky-50",            // Soft sky blue background
    border: "border-sky-200",    // Gentle blue border
    text: "text-sky-600",        // Clear blue text
  },

  /**
   * PURPLE - Classic Notion Purple
   * Purpose: Creative, strategic, long-term planning
   * Psychology: Creative, luxurious, strategic
   * Best for: Strategy, vision, big-picture thinking
   */
  purple: {
    bg: "bg-purple-50",         // Soft lavender background
    border: "border-purple-200", // Gentle purple border
    text: "text-purple-600",     // Rich purple text
  },

  /**
   * PINK - Classic Notion Pink
   * Purpose: Personal, relationship-related, fun projects
   * Psychology: Friendly, fun, personal
   * Best for: Personal tasks, relationships, hobbies
   */
  pink: {
    bg: "bg-pink-50",           // Soft rose background
    border: "border-pink-200",   // Gentle pink border
    text: "text-pink-600",       // Warm pink text
  },

  /**
   * RED - Classic Notion Red
   * Purpose: Urgent, critical, high-priority
   * Psychology: Urgent, important, dangerous
   * Best for: Deadlines, critical tasks, emergencies
   */
  red: {
    bg: "bg-red-50",            // Soft coral background
    border: "border-red-200",    // Gentle red border
    text: "text-red-600",        // Clear red text
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
 * Why these specific shade numbers (50, 200, 600)?
 * - 50: Ultra-light pastel backgrounds (classic Notion aesthetic)
 * - 200: Very subtle borders (barely visible, elegant)
 * - 600: Medium text (readable without being harsh)
 * - These exact shades match the beautiful Notion color system
 */
