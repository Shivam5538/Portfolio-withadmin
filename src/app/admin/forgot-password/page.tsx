"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError } from "@/components/ui";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setMessage("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        setErrorMsg(body.error || "Failed to process request. Please try again.");
      } else {
        setMessage(body.message || "If that email is registered, a password reset link has been sent.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111111]">Forgot Password?</h1>
            <p className="text-sm text-[#9ca3af] mt-1">
              Enter your email address to receive a password reset link
            </p>
          </div>

          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3"
            >
              <CheckCircle2 size={32} className="text-green-600 mx-auto" />
              <p className="text-sm font-medium text-green-900">{message}</p>
              <p className="text-xs text-green-700">
                Please check your inbox (and spam folder) for the instructions.
              </p>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-block text-xs font-semibold text-green-800 hover:underline"
                >
                  Return to Admin Login →
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="forgot-email">Admin Email Address</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <Input
                    id="forgot-email"
                    type="email"
                    className="pl-10"
                    placeholder="User Name"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                </div>
                <FormError message={errors.email?.message} />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle size={15} />
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                disabled={isLoading}
                id="forgot-submit-btn"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending Link...</>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
