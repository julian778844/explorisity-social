import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewPostsPill({
  show,
  count,
  onClick,
}: {
  show: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <AnimatePresence>
      {show && count > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.96 }}
          onClick={onClick}
          className="fixed left-1/2 top-24 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-xl"
        >
          <ArrowUp className="h-4 w-4" />
          {count} new post{count === 1 ? "" : "s"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
