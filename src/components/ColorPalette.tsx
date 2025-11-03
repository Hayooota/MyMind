import { motion } from "motion/react";
import { NotionColor } from "../types";
import { notionColors } from "../utils/colors";

interface ColorPaletteProps {
  onSelectColor: (color: NotionColor) => void;
  className?: string;
}

export function ColorPalette({ onSelectColor, className = "" }: ColorPaletteProps) {
  const colors: NotionColor[] = [
    "gray",
    "brown",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "red",
  ];

  return (
    <div className={`flex gap-2 ${className}`}>
      {colors.map((color, index) => (
        <motion.button
          key={color}
          onClick={() => onSelectColor(color)}
          className={`w-7 h-7 rounded-full border-2 ${notionColors[color].bg} ${notionColors[color].border} hover:scale-110 transition-transform`}
          aria-label={`Select ${color} color`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.05,
            duration: 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}