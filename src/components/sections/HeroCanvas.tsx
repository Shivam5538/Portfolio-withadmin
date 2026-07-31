"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let isVisible = true;
    let particles: Particle[] = [];
    
    // Mouse tracking
    let mouse = { x: -1000, y: -1000, radius: 150 };
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      opacity: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        
        // Depth effect: 10% large/bright (foreground), 30% medium, 60% small/faint (background)
        const rand = Math.random();
        let isForeground = false;
        if (rand > 0.9) {
          this.size = Math.random() * 2 + 2.5;
          this.opacity = Math.random() * 0.5 + 0.4;
          isForeground = true;
        } else if (rand > 0.6) {
          this.size = Math.random() * 1.5 + 1.2;
          this.opacity = Math.random() * 0.3 + 0.2;
        } else {
          this.size = Math.random() * 1 + 0.5;
          this.opacity = Math.random() * 0.15 + 0.05;
        }
        this.density = isForeground ? Math.random() * 40 + 20 : Math.random() * 20 + 5;
        
        const colors = ["59,130,246", "139,92,246", "249,115,22"]; // RGB for blue, purple, coral
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
      }

      update() {
        // Idle gentle drift
        this.baseX += (Math.random() - 0.5) * 0.2;
        this.baseY += (Math.random() - 0.5) * 0.2;

        if (this.baseX < 0) this.baseX = canvas!.width;
        if (this.baseX > canvas!.width) this.baseX = 0;
        if (this.baseY < 0) this.baseY = canvas!.height;
        if (this.baseY > canvas!.height) this.baseY = 0;

        if (!isTouchDevice) {
          // Cursor interaction
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density * 0.6;
            let directionY = forceDirectionY * force * this.density * 0.6;
            
            this.x -= directionX;
            this.y -= directionY;
          } else {
            // Return to base position smoothly
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX;
              this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY;
              this.y -= dy / 20;
            }
          }
        } else {
          this.x = this.baseX;
          this.y = this.baseY;
        }
        
        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      const width = window.innerWidth;
      let baseCount = 170; // Slightly increased density (desktop)
      if (isTouchDevice || width < 768) {
        baseCount = 48; // Mobile
      } else if (width < 1024) {
        baseCount = 85; // Tablet
      }

      const screenScale = Math.min(1, (canvas.width * canvas.height) / (1920 * 1080));
      const particleCount = Math.floor(baseCount * Math.max(0.7, screenScale));

      for (let i = 0; i < particleCount; i++) {
        // Bias towards right side (where code window sits)
        let x = Math.random() > 0.4 ? (Math.random() * 0.5 + 0.5) * canvas.width : Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const drawLines = () => {
      if (!ctx || isTouchDevice || mouse.x === -1000) return;

      // Spatial Optimization: Filter only particles within mouse interaction radius first (O(N))
      // Then compute connection lines ONLY among this small nearby subset (O(k^2) where k << N)
      const nearby: Particle[] = [];
      const maxRadiusSq = 22500; // 150px radius squared

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        if (dx * dx + dy * dy <= maxRadiusSq) {
          nearby.push(p);
        }
      }

      const nearbyLen = nearby.length;
      for (let a = 0; a < nearbyLen; a++) {
        const pA = nearby[a];
        for (let b = a + 1; b < nearbyLen; b++) {
          const pB = nearby[b];
          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 10000) { // 100px radius squared
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.18 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!isVisible || document.hidden) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      drawLines();

      animFrameId = requestAnimationFrame(animate);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Intersection Observer to pause animation when scrolled out
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !document.hidden) {
          cancelAnimationFrame(animFrameId);
          animate();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Tab visibility listener to pause rendering when tab is inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameId);
      } else if (isVisible) {
        cancelAnimationFrame(animFrameId);
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", resize);
    if (!isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);
    }

    resize();
    animate();

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

  if (shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
