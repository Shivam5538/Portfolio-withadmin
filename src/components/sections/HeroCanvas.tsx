"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Dot {
  x: number;
  y: number;
  normX: number;
  normY: number;
  baseRadius: number;
  currentRadius: number;
  baseOpacity: number;
  currentOpacity: number;
  rgb: { r: number; g: number; b: number };
  activeRgb: { r: number; g: number; b: number };
}

// Accent gradient color stops for dot glow tint: Blue -> Purple -> Coral
function sampleAccentColor(xRatio: number, yRatio: number): { r: number; g: number; b: number } {
  const t = Math.max(0, Math.min(1, (xRatio * 0.6 + yRatio * 0.4)));
  if (t < 0.45) {
    // Blue to Indigo
    const k = t / 0.45;
    return {
      r: Math.round(37 + (99 - 37) * k),
      g: Math.round(99 + (102 - 99) * k),
      b: Math.round(235 + (241 - 235) * k),
    };
  } else if (t < 0.8) {
    // Indigo to Purple
    const k = (t - 0.45) / 0.35;
    return {
      r: Math.round(99 + (139 - 99) * k),
      g: Math.round(102 + (92 - 102) * k),
      b: Math.round(241 + (246 - 241) * k),
    };
  } else {
    // Purple to Coral/Amber
    const k = (t - 0.8) / 0.2;
    return {
      r: Math.round(139 + (245 - 139) * k),
      g: Math.round(92 + (158 - 92) * k),
      b: Math.round(246 + (11 - 246) * k),
    };
  }
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let isVisible = true;
    let dots: Dot[] = [];

    // Mouse tracking with smooth lerp
    const targetMouse = { x: -2000, y: -2000 };
    const currentMouse = { x: -2000, y: -2000 };
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    // Initialize sparse, restrained dot grid
    const initDots = () => {
      dots = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Sparser grid: ~72 dots on desktop, ~36 on mobile
      const cols = isTouchDevice || width < 768 ? 7 : 11;
      const rows = isTouchDevice || width < 768 ? 6 : 8;

      const spacingX = width / cols;
      const spacingY = height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Slight organic jitter to avoid mechanical stiffness
          const jitterX = (Math.random() - 0.5) * spacingX * 0.35;
          const jitterY = (Math.random() - 0.5) * spacingY * 0.35;

          const x = (c + 0.5) * spacingX + jitterX;
          const y = (r + 0.5) * spacingY + jitterY;

          const normX = Math.max(0, Math.min(1, x / width));
          const normY = Math.max(0, Math.min(1, y / height));

          // Base neutral gray dot color
          const rgb = { r: 156, g: 163, b: 175 }; // Muted neutral gray
          const activeRgb = sampleAccentColor(normX, normY);

          const baseRadius = Math.random() * 0.6 + 1.2; // 1.2px - 1.8px
          const baseOpacity = Math.random() * 0.15 + 0.18; // 0.18 - 0.33

          dots.push({
            x,
            y,
            normX,
            normY,
            baseRadius,
            currentRadius: baseRadius,
            baseOpacity,
            currentOpacity: baseOpacity,
            rgb,
            activeRgb,
          });
        }
      }
    };

    const render = () => {
      if (!isVisible || document.hidden) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse coordinates
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.1;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.1;

      const glowRadius = 175;
      const glowRadiusSq = glowRadius * glowRadius;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        let glowFactor = 0;
        if (!isTouchDevice && !shouldReduceMotion && currentMouse.x > -1000) {
          const dx = dot.x - currentMouse.x;
          const dy = dot.y - currentMouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < glowRadiusSq) {
            const dist = Math.sqrt(distSq);
            glowFactor = Math.pow(1 - dist / glowRadius, 1.8);
          }
        }

        // Target state based on cursor glow
        const targetRadius = dot.baseRadius + glowFactor * 1.8;
        const targetOpacity = dot.baseOpacity + glowFactor * 0.55;

        // Smooth transition back to neutral
        dot.currentRadius += (targetRadius - dot.currentRadius) * 0.12;
        dot.currentOpacity += (targetOpacity - dot.currentOpacity) * 0.12;

        // Interpolate color from neutral gray to accent gradient
        const r = Math.round(dot.rgb.r + (dot.activeRgb.r - dot.rgb.r) * glowFactor);
        const g = Math.round(dot.rgb.g + (dot.activeRgb.g - dot.rgb.g) * glowFactor);
        const b = Math.round(dot.rgb.b + (dot.activeRgb.b - dot.rgb.b) * glowFactor);

        // Draw restrained dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dot.currentOpacity})`;
        ctx.fill();

        // Optional soft radial halo if highlighted
        if (glowFactor > 0.15) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.currentRadius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dot.activeRgb.r}, ${dot.activeRgb.g}, ${dot.activeRgb.b}, ${glowFactor * 0.15})`;
          ctx.fill();
        }
      }

      if (!shouldReduceMotion) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initDots();
      render();
    };

    // Intersection Observer to pause rendering when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !document.hidden && !shouldReduceMotion) {
          cancelAnimationFrame(animFrameId);
          render();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Tab visibility listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else if (isVisible && !shouldReduceMotion) {
        cancelAnimationFrame(animFrameId);
        render();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Mouse listeners
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      targetMouse.x = -2000;
      targetMouse.y = -2000;
    };

    window.addEventListener("resize", resize);
    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);
    }

    resize();

    return () => {
      cancelAnimationFrame(animFrameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", resize);
      if (!isTouchDevice) {
        window.removeEventListener("mousemove", handleMouseMove);
        document.body.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
