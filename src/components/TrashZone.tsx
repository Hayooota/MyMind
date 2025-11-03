import { Trash2 } from "lucide-react";
import { useDrop } from "react-dnd";
import { motion } from "motion/react";

interface TrashZoneProps {
  onDeleteTask: (taskId: string) => void;
}

export function TrashZone({ onDeleteTask }: TrashZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string; task: any; isTopLevel: boolean }) => {
      onDeleteTask(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        animate={{
          scale: isOver ? 1.2 : 1,
          opacity: isOver ? 0.8 : 0.3,
        }}
        transition={{ duration: 0.2 }}
        className={`p-4 rounded-full ${
          isOver ? "bg-red-100" : "bg-transparent"
        } transition-colors`}
      >
        <Trash2
          className={`w-6 h-6 ${
            isOver ? "text-red-500" : "text-[#5A5550]"
          } transition-colors`}
        />
      </motion.div>
    </div>
  );
}
