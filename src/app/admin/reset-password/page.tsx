"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError } from "@/components/ui";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setErrorMsg("Missing reset token in URL. Please use the full link from your email.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setErrorMsg(body.error || "Failed to reset password. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle size={40} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Invalid Reset Link</h2>
        <p className="text-sm text-slate-600">
          This password reset link is missing a valid token.
        </p>
        <Link href="/admin/forgot-password">
          <Button variant="secondary" className="mt-2">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <CheckCircle2 size={48} className="text-green-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Password Reset Complete</h2>
        <p className="text-sm text-slate-600">
          Your admin password has been updated successfully.
        </p>
        <div className="pt-2">
          <Link href="/admin">
            <Button size="lg" className="w-full">
              Sign In with New Password →
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="new-password">New Password</Label>
        <div className="relative">
          <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            className="pl-10 pr-10"
            placeholder="Minimum 8 characters"
            {...register("newPassword")}
            aria-invalid={!!errors.newPassword}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FormError message={errors.newPassword?.message} />
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <div className="relative">
          <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            className="pl-10"
            placeholder="Re-enter new password"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
        </div>
        <FormError message={errors.confirmPassword?.message} />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} />
            Reset Error
          </div>
          <p className="text-xs text-red-600">{errorMsg}</p>
          <div className="pt-1">
            <Link href="/admin/forgot-password" className="text-xs font-semibold text-red-800 underline">
              Request a new password reset link
            </Link>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full mt-2"
        size="lg"
        disabled={isLoading}
        id="reset-submit-btn"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" /> Updating Password...</>
        ) : (
          "Set New Password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <KeyRound size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111111]">Set New Password</h1>
            <p className="text-sm text-[#9ca3af] mt-1">
              Enter your new secure admin password below
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center p-6"><Loader2 className="animate-spin text-slate-400" /></div>}>
            <ResetPasswordFormContent />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
