"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError } from "@/components/ui";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

const changeEmailSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required for security verification"),
  newEmail: z.string().email("Invalid email address"),
});

type ChangeEmailData = z.infer<typeof changeEmailSchema>;

export default function AdminAccountSecurity() {
  const { data: session } = useSession();
  const currentEmail = session?.user?.email || "zawareshivam18@gmail.com";

  // Password Change State
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: errorsPwd },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordData) => {
    setPasswordLoading(true);
    setPasswordSuccess("");
    setPasswordError("");

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setPasswordError(body.error || "Failed to change password");
      } else {
        setPasswordSuccess("Password changed successfully! A confirmation email has been sent.");
        resetPwd();
      }
    } catch (err) {
      setPasswordError("A network error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Email Change State
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmailForm,
    formState: { errors: errorsEmail },
  } = useForm<ChangeEmailData>({
    resolver: zodResolver(changeEmailSchema),
  });

  const onChangeEmail = async (data: ChangeEmailData) => {
    setEmailLoading(true);
    setEmailSuccess("");
    setEmailError("");

    try {
      const res = await fetch("/api/admin/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newEmail: data.newEmail,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setEmailError(body.error || "Failed to initiate email change");
      } else {
        setEmailSuccess(body.message || "Confirmation link sent to your new email address.");
        resetEmailForm();
      }
    } catch (err) {
      setEmailError("A network error occurred. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="border-t border-slate-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Account Security Settings</h2>
            <p className="text-xs text-slate-500">Manage your admin password and account email address</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 1. Change Password Card */}
          <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={18} className="text-slate-700" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#374151]">
                Change Password
              </h3>
            </div>

            <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-4">
              <div>
                <Label htmlFor="sec-current-pwd">Current Password *</Label>
                <div className="relative">
                  <Input
                    id="sec-current-pwd"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerPwd("currentPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormError message={errorsPwd.currentPassword?.message} />
              </div>

              <div>
                <Label htmlFor="sec-new-pwd">New Password *</Label>
                <Input
                  id="sec-new-pwd"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  {...registerPwd("newPassword")}
                />
                <FormError message={errorsPwd.newPassword?.message} />
              </div>

              <div>
                <Label htmlFor="sec-confirm-pwd">Confirm New Password *</Label>
                <Input
                  id="sec-confirm-pwd"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  {...registerPwd("confirmPassword")}
                />
                <FormError message={errorsPwd.confirmPassword?.message} />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                  <AlertCircle size={15} />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-xs font-medium"
                >
                  <CheckCircle2 size={15} />
                  {passwordSuccess}
                </motion.div>
              )}

              <Button type="submit" size="md" disabled={passwordLoading} id="change-pwd-btn">
                {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
              </Button>
            </form>
          </div>

          {/* 2. Change Email Card */}
          <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Mail size={18} className="text-slate-700" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#374151]">
                Change Admin Email
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
              Current Email: <span className="font-semibold text-slate-900">{currentEmail}</span>
            </div>

            <form onSubmit={handleSubmitEmail(onChangeEmail)} className="space-y-4">
              <div>
                <Label htmlFor="sec-new-email">New Email Address *</Label>
                <Input
                  id="sec-new-email"
                  type="email"
                  placeholder="newadmin@example.com"
                  {...registerEmail("newEmail")}
                />
                <FormError message={errorsEmail.newEmail?.message} />
              </div>

              <div>
                <Label htmlFor="sec-email-current-pwd">Re-enter Current Password *</Label>
                <Input
                  id="sec-email-current-pwd"
                  type="password"
                  placeholder="Verify password to allow email change"
                  {...registerEmail("currentPassword")}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Required to prevent session hijacking email transfers.
                </p>
                <FormError message={errorsEmail.currentPassword?.message} />
              </div>

              {emailError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                  <AlertCircle size={15} />
                  {emailError}
                </div>
              )}

              {emailSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-green-50 text-green-700 text-xs font-medium space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 size={15} />
                    Confirmation Request Sent
                  </div>
                  <p>{emailSuccess}</p>
                </motion.div>
              )}

              <Button type="submit" variant="secondary" size="md" disabled={emailLoading} id="change-email-btn">
                {emailLoading ? <Loader2 size={16} className="animate-spin" /> : "Request Email Change"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
