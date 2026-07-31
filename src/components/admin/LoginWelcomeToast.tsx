"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Sparkles } from "lucide-react";

export default function LoginWelcomeToast() {
  const { data: session } = useSession();
  const [showToast, setShowToast] = useState(false);
  const [userName, setUserName] = useState("Shivam Zaware");

  useEffect(() => {
    // Check if user just logged in via sessionStorage flag
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      setShowToast(true);
      sessionStorage.removeItem("justLoggedIn");

      // Auto dismiss after 4.5 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, []);

  // Also fetch dynamic profile name for the toast
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) {
          setUserName(data.name);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 text-white rounded-2xl p-4 shadow-2xl shadow-slate-900/50 flex items-start gap-3.5"
        >
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shrink-0 shadow-md shadow-emerald-500/30">
            <CheckCircle2 size={20} />
          </div>

          <div className="flex-1 pr-2">
            <div className="flex items-center gap-1.5 font-bold text-sm text-white">
              <span>Successfully Logged In!</span>
              <Sparkles size={14} className="text-yellow-400" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed">
              Welcome back, <span className="font-bold text-emerald-400">{userName}</span>
            </p>
          </div>

          <button
            onClick={() => setShowToast(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
