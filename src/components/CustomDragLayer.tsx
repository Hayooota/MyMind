import { useDragLayer } from "react-dnd";
import { Task } from "../types";
import { notionColors } from "../utils/colors";

export function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem() as { id: string; task: Task; isTopLevel: boolean } | null,
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset || !item?.task) {
    return null;
  }

  const { task } = item;
  const colors = notionColors[task.color];

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
          opacity: 0.8,
        }}
      >
        <div
          className={`w-80 ${colors.bg} ${colors.border} border-2 rounded-xl p-4 shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 ${colors.border} opacity-30`} />
            <span className={`flex-1 ${colors.text}`}>{task.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
