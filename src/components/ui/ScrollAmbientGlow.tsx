"use client";

import { useReducedMotion } from "framer-motion";

/**
 * ScrollAmbientGlow
 * Renders smooth floating ambient light blobs using GPU-accelerated radial gradients
 * Zero repaint cost, ensuring silky 120fps scroll smoothness
 */
export function ScrollAmbientGlow() {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Top Right Luminous Cyan/Blue Aura */}
      <div
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.04) 45%, transparent 70%)",
        }}
        className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
      />

      {/* Center Left Floating Violet Aura */}
      <div
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, rgba(236, 72, 153, 0.03) 45%, transparent 70%)",
        }}
        className="absolute top-[35vh] -left-48 w-[750px] h-[750px] rounded-full"
      />

      {/* Bottom Floating Amber Aura */}
      <div
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, rgba(249, 115, 22, 0.02) 45%, transparent 70%)",
        }}
        className="absolute top-[75vh] right-[5%] w-[650px] h-[650px] rounded-full"
      />
    </div>
  );
}

