"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (visible in Vercel function logs)
    console.error("[GlobalError boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,1) 0%, transparent 60%)",
          filter: "blur(100px)",
          transform: "translate(30%, -20%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(239,68,68,1) 0%, transparent 60%)",
          filter: "blur(100px)",
          transform: "translate(-20%, 20%)",
        }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Animated error icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <AlertTriangle size={36} className="text-white" />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-sm font-semibold text-orange-700">
            500 — Something went wrong
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight mb-4"
        >
          An unexpected error occurred
        </motion.h1>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-[#6b7280] text-base leading-relaxed mb-10 font-light"
        >
          Something broke on our end. Try refreshing the page — if the problem
          persists, head back to the homepage.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] text-white text-sm font-semibold hover:bg-[#1f2937] transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 bg-white text-[#374151] text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
