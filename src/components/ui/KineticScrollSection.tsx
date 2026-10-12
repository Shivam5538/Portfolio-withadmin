"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KineticScrollSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  parallaxSpeed?: number; // 0.1 to 0.4
}

/**
 * KineticScrollSection
 * Adds 3D depth, buttery scroll-driven parallax shifts, and kinetic reveal transitions
 */
export function KineticScrollSection({
  children,
  className = "",
  id,
  parallaxSpeed = 0.15,
}: KineticScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Smooth out the scroll progress with a spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax vertical shift
  const yRange = 60 * parallaxSpeed;
  const y = useTransform(smoothProgress, [0, 0.5, 1], [yRange, 0, -yRange]);

  // Subtle 3D perspective scale & opacity entrance
  const opacity = useTransform(smoothProgress, [0, 0.18, 0.85, 1], [0.35, 1, 1, 0.6]);
  const scale = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.97, 1, 1, 0.98]);

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <section ref={ref} id={id} className={cn("relative will-change-transform", className)}>
      <motion.div
        style={{
          y,
          opacity,
          scale,
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

/**
 * ParallaxFloatingLayer
 * Shifts child elements (e.g. background badges, icons, decor blobs) at varying parallax speeds
 */
export function ParallaxFloatingLayer({
  children,
  className = "",
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 28,
  });

  const y = useTransform(smoothProgress, [0, 1], [40 * speed, -40 * speed]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
