"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

const codeTokens = [
  { text: "<!DOCTYPE html>\n", color: "text-slate-400 font-semibold" },
  { text: "<html ", color: "text-blue-600 font-semibold" },
  { text: "lang=", color: "text-purple-600 font-medium" },
  { text: '"en"', color: "text-emerald-600 font-medium" },
  { text: ">\n", color: "text-blue-600 font-semibold" },
  { text: "  <head>\n", color: "text-blue-600 font-semibold" },
  { text: "    <style>\n", color: "text-pink-600 font-semibold" },
  { text: "      .hero-title {\n", color: "text-amber-600 font-bold" },
  { text: "        background: ", color: "text-cyan-700 font-medium" },
  { text: "linear-gradient(", color: "text-purple-600 font-medium" },
  { text: "135deg", color: "text-orange-600 font-medium" },
  { text: ", ", color: "text-slate-400" },
  { text: "#2563eb", color: "text-blue-600 font-semibold" },
  { text: ", ", color: "text-slate-400" },
  { text: "#7c3aed", color: "text-purple-600 font-semibold" },
  { text: ", ", color: "text-slate-400" },
  { text: "#db2777", color: "text-pink-600 font-semibold" },
  { text: ");\n", color: "text-slate-400" },
  { text: "        color: ", color: "text-cyan-700 font-medium" },
  { text: "transparent", color: "text-amber-600 font-medium" },
  { text: ";\n", color: "text-slate-400" },
  { text: "        font-weight: ", color: "text-cyan-700 font-medium" },
  { text: "800", color: "text-emerald-600 font-bold" },
  { text: ";\n", color: "text-slate-400" },
  { text: "      }\n", color: "text-amber-600 font-bold" },
  { text: "    </style>\n", color: "text-pink-600 font-semibold" },
  { text: "  </head>\n", color: "text-blue-600 font-semibold" },
  { text: "  <body>\n", color: "text-blue-600 font-semibold" },
  { text: "    <h1 ", color: "text-blue-600 font-semibold" },
  { text: "class=", color: "text-purple-600 font-medium" },
  { text: '"hero-title"', color: "text-emerald-600 font-semibold" },
  { text: ">\n", color: "text-blue-600 font-semibold" },
  { text: "      Hello, World!\n", color: "text-slate-900 font-black" },
  { text: "    </h1>\n", color: "text-blue-600 font-semibold" },
  { text: "  </body>\n", color: "text-blue-600 font-semibold" },
  { text: "</html>", color: "text-blue-600 font-semibold" },
];

const totalCodeChars = codeTokens.reduce((acc, t) => acc + t.text.length, 0);

const buildSequence = [
  { text: "⚡ npm run build", type: "cmd", delay: 700 },
  { text: "  ▲ Next.js 14.2 (Compiler active)", type: "info", delay: 500 },
  { text: "  ✓ Compiled /index in 240ms", type: "success", delay: 500 },
  { text: "  ✓ Generated static CSS bundle (2.4kB)", type: "css-success", delay: 400 },
  { text: "  ✓ Production bundle optimized", type: "success", delay: 600 },
  { text: "🚀 npm start", type: "cmd-start", delay: 700 },
  { text: "  Ready on http://localhost:3000", type: "success-bright", delay: 3000 }
];

export default function FloatingCodeWindow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Animation states
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'typing' | 'preview' | 'terminal'>('typing');
  const [charIndex, setCharIndex] = useState(0);
  const [termIndex, setTermIndex] = useState(0);

  // Intersection Observer for pausing
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sequence Logic
  useEffect(() => {
    if (!isVisible || shouldReduceMotion) return;

    let timeoutId: NodeJS.Timeout;

    if (phase === 'typing') {
      if (charIndex < totalCodeChars) {
        const delay = Math.random() * 25 + 8; 
        
        timeoutId = setTimeout(() => {
          setCharIndex(c => c + 1);
        }, delay);
      } else {
        // Done typing code, wait before switching to preview
        timeoutId = setTimeout(() => {
          setPhase('preview');
        }, 1200);
      }
    } else if (phase === 'preview') {
      // Hold on the preview screen for 3 seconds
      timeoutId = setTimeout(() => {
        setPhase('terminal');
        setTermIndex(0);
      }, 3000);
    } else if (phase === 'terminal') {
      if (termIndex < buildSequence.length) {
        // Terminal sequence logic
        timeoutId = setTimeout(() => {
          setTermIndex(t => t + 1);
        }, buildSequence[termIndex].delay);
      } else {
        // Done terminal, wait and reset
        timeoutId = setTimeout(() => {
          setPhase('typing');
          setCharIndex(0);
        }, 500); 
      }
    }

    return () => clearTimeout(timeoutId);
  }, [isVisible, shouldReduceMotion, phase, charIndex, termIndex]);

  // Render logic for typed code
  const renderTypedCode = () => {
    let charsLeft = charIndex;
    const rendered = [];
    
    for (let i = 0; i < codeTokens.length; i++) {
      const token = codeTokens[i];
      if (charsLeft <= 0) break;
      
      const toTake = Math.min(charsLeft, token.text.length);
      rendered.push(
        <span key={i} className={token.color}>
          {token.text.substring(0, toTake)}
        </span>
      );
      charsLeft -= toTake;
    }
    return rendered;
  };

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="hidden lg:block absolute right-[4%] xl:right-[6%] top-1/2 -translate-y-1/2 z-20 pointer-events-none"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-window-steady {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-window-steady {
          animation: float-window-steady 5s ease-in-out infinite;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: cursor-blink 1s step-end infinite;
        }
      `}} />
      
      <div className="animate-float-window-steady">
        <div 
          ref={containerRef}
          className="w-[460px] rounded-2xl overflow-hidden border border-white/80 bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] text-[12.5px] font-mono flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex items-center px-4 py-3 border-b border-slate-200/80 bg-slate-100/80 shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="mx-auto text-xs font-mono font-medium text-slate-600 mr-12 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {phase === 'typing' ? 'index.html — HTML & CSS' : phase === 'preview' ? 'localhost:3000 — Web Preview' : 'bash — terminal'}
            </div>
          </div>
          
          {/* Body Container */}
          <div className="p-5 text-slate-800 leading-normal min-h-[350px] flex flex-col relative bg-slate-50/60">
            <AnimatePresence mode="wait">
              {phase === 'typing' && (
                <motion.div 
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="whitespace-pre absolute inset-5 overflow-hidden"
                >
                  {renderTypedCode()}
                  {charIndex < totalCodeChars && (
                    <span className="inline-block w-2 h-4 bg-blue-600 ml-[1px] animate-cursor-blink align-middle"></span>
                  )}
                </motion.div>
              )}

              {phase === 'preview' && (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 flex flex-col bg-white rounded-b-xl overflow-hidden border border-slate-200/80 shadow-sm"
                >
                  {/* Mini Browser Address Bar */}
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100/90 border-b border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-slate-200/80 w-full max-w-[240px] shadow-xs">
                      <span className="text-emerald-500 text-[10px]">🔒</span>
                      <span className="text-slate-700 font-mono font-medium truncate">localhost:3000</span>
                    </div>
                    <span className="ml-auto text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      200 OK
                    </span>
                  </div>

                  {/* Web Page Canvas */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-purple-50/30">
                    {/* Background Radial Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-purple-400/15 rounded-full blur-2xl pointer-events-none"></div>

                    {/* Mini Glass Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-[11px] text-slate-700 font-medium mb-3 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Interactive Web App
                    </div>

                    {/* Styled Gradient Title (Vibrant Light Gradient) */}
                    <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 drop-shadow-xs">
                      Hello, World!
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[12px] font-sans text-slate-600 max-w-[280px] leading-relaxed mb-4 font-normal">
                      Crafting fast, dynamic & responsive web applications.
                    </p>

                    {/* Mini Action Buttons */}
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold shadow-sm shadow-blue-500/20">
                        Get Started
                      </span>
                      <span className="px-3.5 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-[11px] font-medium shadow-xs">
                        View Docs
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === 'terminal' && (
                <motion.div 
                  key="terminal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[13px] flex flex-col gap-2.5 absolute inset-5"
                >
                  {buildSequence.slice(0, termIndex).map((line, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className={
                        line.type === 'cmd' ? 'text-blue-600 font-semibold' :
                        line.type === 'info' ? 'text-purple-600 font-medium' :
                        line.type === 'css-success' ? 'text-amber-600 font-medium' :
                        line.type === 'cmd-start' ? 'text-pink-600 font-semibold' :
                        line.type === 'success-bright' ? 'text-cyan-800 font-bold bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200' :
                        'text-emerald-600 font-medium'
                      }>
                        {line.text}
                      </span>
                    </div>
                  ))}
                  {termIndex < buildSequence.length && (
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-4 bg-slate-400 animate-cursor-blink align-middle"></span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
