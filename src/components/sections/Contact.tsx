"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Linkedin, Twitter, Mail, Send, CheckCircle, AlertCircle, Instagram, Youtube, MessageCircle, Globe } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FormError } from "@/components/ui";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

interface ContactProps {
  siteContent?: any;
}

function getSocialIcon(platform: string) {
  const p = (platform || "").toLowerCase();
  if (p.includes("github")) return Github;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("twitter") || p.includes("x")) return Twitter;
  if (p.includes("whatsapp") || p.includes("wa.me")) return FaWhatsapp;
  if (p.includes("mail")) return Mail;
  if (p.includes("insta")) return Instagram;
  if (p.includes("youtube")) return Youtube;
  if (p.includes("discord") || p.includes("telegram")) return MessageCircle;
  return Globe;
}

export default function Contact({ siteContent }: ContactProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const content = siteContent || {};

  // Reuse shared social links
  const socialLinks: { href: string; icon: any; label: string }[] = [];
  if (content.githubUrl) socialLinks.push({ href: content.githubUrl, icon: Github, label: "GitHub" });
  if (content.linkedinUrl) socialLinks.push({ href: content.linkedinUrl, icon: Linkedin, label: "LinkedIn" });
  if (content.twitterUrl) socialLinks.push({ href: content.twitterUrl, icon: Twitter, label: "Twitter" });

  let whatsappVal = content.whatsappUrl;
  if (!whatsappVal && content.socialLinks) {
    try {
      const parsed = typeof content.socialLinks === "string" ? JSON.parse(content.socialLinks) : content.socialLinks;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        whatsappVal = parsed.whatsapp || parsed.whatsappUrl || "";
      }
    } catch {}
  }
  const rawWa = (whatsappVal || "https://wa.me/").trim();
  const waHref = rawWa.startsWith("http://") || rawWa.startsWith("https://")
    ? rawWa
    : `https://wa.me/${rawWa.replace(/[^0-9+]/g, "")}`;
  socialLinks.push({ href: waHref, icon: FaWhatsapp, label: "WhatsApp" });

  if (content.email) {
    const emailHref = content.email.includes("@") && !content.email.startsWith("mailto:")
      ? `mailto:${content.email}`
      : content.email;
    socialLinks.push({ href: emailHref, icon: Mail, label: "Email" });
  }

  // Parse dynamic custom social links
  if (content.socialLinks) {
    try {
      const parsed = typeof content.socialLinks === "string" ? JSON.parse(content.socialLinks) : content.socialLinks;
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item?.url && item?.platform) {
            socialLinks.push({
              href: item.url,
              icon: getSocialIcon(item.platform),
              label: item.platform,
            });
          }
        });
      }
    } catch {}
  }

  // Fallback defaults if no shared socials configured
  const displaySocialLinks =
    socialLinks.length > 0
      ? socialLinks
      : [
          { href: "https://github.com", icon: Github, label: "GitHub" },
          { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
          { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
          { href: "https://wa.me/", icon: FaWhatsapp, label: "WhatsApp" },
          { href: "mailto:zawareshivam18@gmail.com", icon: Mail, label: "Email" },
        ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <SectionWrapper id="contact">
      <section className="section relative overflow-hidden bg-white py-16 sm:py-24 lg:py-28">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="container relative z-10">
          <div className="divider mb-16" />

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
            <p className="section-label">{content.contactEyebrow ?? "Say Hello"}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-6">
              {content.contactHeadlineLine1 ?? "Let's work"}
              <br />
              <span className="gradient-text">{content.contactHeadlineLine2 ?? "together"}</span>
            </h2>

            <p className="text-[#6b7280] leading-relaxed mb-8 font-light">
              {content.contactSubtext ??
                "I'm currently open to new opportunities. Whether you have a project in mind, want to collaborate, or just want to say hi — my inbox is always open."}
            </p>

            {/* Social icons (Reusing shared social data) */}
            <div className="flex items-center gap-3">
              {displaySocialLinks.map(({ href, icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-full border border-[rgba(0,0,0,0.08)] flex items-center justify-center text-[#6b7280] hover:text-[#111111] hover:border-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.03)] transition-all"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>

            {/* Availability card (Reusing shared availability status) */}
            {content.isAvailable !== false && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-10 p-5 rounded-2xl bg-[#f9f9fb] border border-[rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-[#111111]">
                    {content.availabilityStatus ?? "Available for work"}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  {content.contactResponseTimeText ?? "Typical response time: within 24 hours"}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <Label htmlFor="contact-name">Your Name</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                <FormError message={errors.name?.message} />
              </div>

              <div>
                <Label htmlFor="contact-email">Email Address</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <FormError message={errors.email?.message} />
              </div>

              <div>
                <Label htmlFor="contact-phone">Phone Number (Optional)</Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                <FormError message={errors.phone?.message} />
              </div>

              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell me about your project or just say hi..."
                  rows={5}
                  {...register("message")}
                  aria-invalid={!!errors.message}
                />
                <FormError message={errors.message?.message} />
              </div>

              {/* Status messages */}
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm"
                >
                  <CheckCircle size={16} />
                  Message sent! I&apos;ll get back to you soon.
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  <AlertCircle size={16} />
                  Something went wrong. Please try again.
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === "loading"}
                id="contact-submit-btn"
              >
                {status === "loading" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
      </section>
    </SectionWrapper>
  );
}
