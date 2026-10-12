"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. "rgba(99,102,241,0.25)"
  enableTilt?: boolean;
}

/**
 * SpatialCard (Apple VisionOS / Linear Style)
 * Hardware-accelerated 3D perspective lift, interactive magnetic tilt, and real-time cursor spotlight sheen
 */
export function SpatialCard({
  children,
  className = "",
  glowColor = "rgba(99,102,241,0.22)",
  enableTilt = true,
}: SpatialCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Mouse position relative to card center [-0.5 to 0.5]
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 320, damping: 24 });
  const mouseYSpring = useSpring(y, { stiffness: 320, damping: 24 });

  // 3D Tilt angles (subtle 5 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ref.current.style.setProperty("--mouse-x", `${mouseX}px`);
    ref.current.style.setProperty("--mouse-y", `${mouseY}px`);

    if (enableTilt && !shouldReduceMotion) {
      x.set(mouseX / rect.width - 0.5);
      y.set(mouseY / rect.height - 0.5);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1], // Apple standard ease
      }}
      className={cn("relative group will-change-transform", className)}
    >
      <motion.div
        style={{
          rotateX: enableTilt ? rotateX : 0,
          rotateY: enableTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative"
      >
        {/* Card Content */}
        <div className="relative z-10 w-full h-full">{children}</div>

        {/* VisionOS Interactive Dynamic Cursor Spotlight Glow */}
        <div
          style={{
            background: `radial-gradient(450px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 65%)`,
            opacity: isHovered ? 1 : 0,
          }}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-20 transition-opacity duration-300 -m-[1px]"
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * SpecularShimmerBeam
 * A luminous light beam that sweeps across cards as they scroll into view
 */
export function SpecularShimmerBeam({ className = "" }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] z-30", className)}>
      <motion.div
        initial={{ x: "-120%", opacity: 0 }}
        whileInView={{ x: "220%", opacity: [0, 0.9, 0.9, 0] }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
      />
    </div>
  );
}

