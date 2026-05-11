import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";

const milestones = [100, 500, 1000, 5000, 10000];

export default function FollowerMilestoneBadge({ followerCount }: { followerCount: number }) {
  const [show, setShow] = useState(false);
  const milestone = milestones.find((m) => followerCount === m);

  useEffect(() => {
    if (!milestone) return;
    const key = `explorisity.milestone.${milestone}`;
    if (localStorage.getItem(key)) return;
    setShow(true);
    localStorage.setItem(key, "seen");
  }, [milestone]);

  return (
    <AnimatePresence>
      {show && milestone && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          className="fixed bottom-6 left-1/2 z-[90] w-[92vw] max-w-md -translate-x-1/2 rounded-3xl border border-border bg-card p-5 shadow-2xl"
        >
          <button onClick={() => setShow(false)} className="absolute right-3 top-3 rounded-xl p-2 hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black">Follower milestone unlocked</h3>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                You reached {milestone.toLocaleString()} followers on Explorisity.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
