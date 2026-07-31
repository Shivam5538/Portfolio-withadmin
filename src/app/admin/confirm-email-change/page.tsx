"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing token parameter in URL.");
      setLoading(false);
      return;
    }

    fetch("/api/admin/confirm-email-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || "Failed to confirm email change.");
        } else {
          setNewEmail(body.newEmail);
        }
      })
      .catch(() => {
        setError("A network error occurred. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-8 space-y-4">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-medium text-slate-600">Verifying email change token...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
        <AlertCircle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Confirmation Failed</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <div className="pt-2">
          <Link href="/admin/settings">
            <Button variant="secondary" className="w-full">
              Go to Account Settings
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
      <CheckCircle2 size={48} className="text-green-500 mx-auto" />
      <h2 className="text-xl font-bold text-slate-900">Email Address Confirmed!</h2>
      <p className="text-sm text-slate-600">
        Your admin account email address has been updated to:
      </p>
      <div className="bg-slate-100 p-3 rounded-xl font-mono text-sm text-slate-800 font-semibold">
        {newEmail}
      </div>
      <p className="text-xs text-slate-500">
        You can now use this email address to log into your admin account.
      </p>
      <div className="pt-4">
        <Link href="/admin">
          <Button size="lg" className="w-full">
            Go to Admin Dashboard →
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111111]">Email Confirmation</h1>
          </div>

          <Suspense fallback={<div className="flex justify-center p-6"><Loader2 className="animate-spin text-slate-400" /></div>}>
            <ConfirmEmailContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
