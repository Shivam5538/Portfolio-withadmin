"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-up" | "blur-reveal";
  delay?: number;
  duration?: number;
  threshold?: number;
}

const variants = {
  "fade-up": {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -32, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -32, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 32, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  "blur-reveal": {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
};


/**
 * ScrollReveal Component
 * Smooth viewport-triggered appearance animation with optical blur dissipation and spring physics
 */
export function ScrollReveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
  duration = 0.65,
  threshold = 0.15,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer
 * Cascades child appearance animations sequentially when scrolled into view
 */
export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem
 * Individual child item inside a StaggerContainer
 */
export function StaggerItem({
  children,
  className = "",
  variant = "fade-up",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "fade-up" | "scale-up" | "blur-reveal";
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants[variant]}
      transition={{
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * TextRevealMask
 * Slides text upwards from an invisible clipping mask for headlines
 */
export function TextRevealMask({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("overflow-hidden inline-block", className)}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.75,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
