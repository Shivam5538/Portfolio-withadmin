"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * SectionWrapper
 * High-performance 120fps GPU-accelerated spatial perspective reveal
 */
export function SectionWrapper({ children, className = "", id }: SectionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Pure quartic ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
