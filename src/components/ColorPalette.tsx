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
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelectColor(color)}
          className={`w-7 h-7 rounded-full border-2 ${notionColors[color].bg} ${notionColors[color].border} hover:scale-110 transition-transform`}
          aria-label={`Select ${color} color`}
        />
      ))}
    </div>
  );
}
