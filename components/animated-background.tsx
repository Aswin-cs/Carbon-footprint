"use client";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <motion.div
      className="fixed bottom-[-20%] left-[-10%] right-[-10%] h-[80vh] bg-emerald-400/50 rounded-[100%] blur-[120px] pointer-events-none"
      animate={{
        scale: [1, 1.1, 0.9, 1],
        y: [0, -50, 20, 0],
        x: [0, 30, -30, 0],
        opacity: [0.5, 0.7, 0.6, 0.5]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    />
  );
}
