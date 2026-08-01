"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,1) 0%, transparent 60%)",
          filter: "blur(100px)",
          transform: "translate(30%, -20%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.05] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,1) 0%, transparent 60%)",
          filter: "blur(100px)",
          transform: "translate(-20%, 20%)",
        }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Animated 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-6"
        >
          <span
            className="block text-[clamp(6rem,20vw,12rem)] font-extrabold leading-none tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #f0653e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
        </motion.div>

        {/* Icon badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/60 bg-white/70 backdrop-blur-md shadow-sm text-sm font-semibold text-[#374151]">
            <Search size={15} className="text-blue-500" />
            Page not found
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight mb-4"
        >
          Looks like you&apos;re lost
        </motion.h1>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-[#6b7280] text-base leading-relaxed mb-10 font-light"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Head back home and explore from there.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#111111] text-white text-sm font-semibold hover:bg-[#1f2937] transition-colors shadow-sm"
          >
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 bg-white text-[#374151] text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            View Projects
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
