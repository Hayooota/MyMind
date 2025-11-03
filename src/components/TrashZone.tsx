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
        } transition-colors relative`}
      >
        {/* Trash can body */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isOver ? "text-red-500" : "text-[#5A5550]"}
        >
          {/* Trash can base */}
          <path
            d="M3 6H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Animated lid */}
          <motion.path
            d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              d: isOver
                ? "M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6"
                : "M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6",
              transformOrigin: "center top",
            }}
            style={{
              transformOrigin: "50% 25%",
            }}
          />
          {/* Inner lines */}
          <motion.g
            animate={{
              opacity: isOver ? 0.3 : 1,
            }}
          >
            <path
              d="M10 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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