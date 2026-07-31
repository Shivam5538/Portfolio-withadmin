"use client";

import { ArrowUp, Github, Linkedin, Twitter, Mail, Heart, Instagram, Youtube, MessageCircle, Globe } from "lucide-react";
import { motion } from "framer-motion";

function getSocialIcon(platform: string) {
  const p = (platform || "").toLowerCase();
  if (p.includes("github")) return Github;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("twitter") || p.includes("x")) return Twitter;
  if (p.includes("mail")) return Mail;
  if (p.includes("insta")) return Instagram;
  if (p.includes("youtube")) return Youtube;
  if (p.includes("discord") || p.includes("telegram")) return MessageCircle;
  return Globe;
}

export default function Footer({ siteContent }: { siteContent?: any }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const content = siteContent || {};
  const footerText = content.footerText || content.heroName || "Shivam Zaware";
  const tagline = content.footerTagline || content.heroSubtext || "Crafted with clean code & modern web technologies.";

  // 1. Copyright year range
  const currentYear = new Date().getFullYear();
  let copyrightYearDisplay = String(currentYear);
  if (content.footerLaunchYear) {
    const launchYr = parseInt(String(content.footerLaunchYear).trim(), 10);
    if (!isNaN(launchYr) && launchYr > 1990 && launchYr < currentYear) {
      copyrightYearDisplay = `${launchYr} – ${currentYear}`;
    }
  }

  // 2. Parse footer navigation links
  let navLinks: { label: string; href: string }[] = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ];

  if (content.footerNavLinks) {
    try {
      const parsed = typeof content.footerNavLinks === "string" ? JSON.parse(content.footerNavLinks) : content.footerNavLinks;
      if (Array.isArray(parsed) && parsed.length > 0) {
        navLinks = parsed.map((item: any) => {
          if (typeof item === "string") {
            const clean = item.trim();
            const href = clean.toLowerCase().startsWith("#") ? clean.toLowerCase() : `#${clean.toLowerCase()}`;
            return { label: clean, href };
          }
          return { label: item.label || "", href: item.href || "#" };
        });
      }
    } catch {}
  }

  // Social Links List (Primary + Custom)
  const socialList: { icon: any; href: string; label: string }[] = [];
  if (content.githubUrl) socialList.push({ icon: Github, href: content.githubUrl, label: "GitHub" });
  if (content.linkedinUrl) socialList.push({ icon: Linkedin, href: content.linkedinUrl, label: "LinkedIn" });
  if (content.twitterUrl) socialList.push({ icon: Twitter, href: content.twitterUrl, label: "Twitter" });
  if (content.email) {
    const emailHref = content.email.includes("@") && !content.email.startsWith("mailto:") ? `mailto:${content.email}` : content.email;
    socialList.push({ icon: Mail, href: emailHref, label: "Email" });
  }

  if (content.socialLinks) {
    try {
      const parsed = typeof content.socialLinks === "string" ? JSON.parse(content.socialLinks) : content.socialLinks;
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item?.url && item?.platform) {
            socialList.push({
              href: item.url,
              icon: getSocialIcon(item.platform),
              label: item.platform,
            });
          }
        });
      }
    } catch {}
  }

  const finalSocials = socialList.length > 0 ? socialList : [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Mail, href: "mailto:zawareshivam18@gmail.com", label: "Email" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#0b0f19] text-slate-300 border-t border-slate-800/60 pt-16 pb-12">
      {/* Top Gradient Border Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 opacity-80" />

      {/* Background Radial Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10 space-y-10">
        {/* Main Footer Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">
          <div className="space-y-2.5 max-w-lg">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xl font-black tracking-tight text-white">
                {footerText}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Available for new opportunities
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {tagline}
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 flex-wrap">
            {finalSocials.map(({ icon: Icon, href, label }, idx) => (
              <a
                key={`${label}-${idx}`}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                aria-label={label}
                title={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation & Back To Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="relative group text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 py-1"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-blue-400 to-purple-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* Back to top Button */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            className="group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/90 border border-slate-700/80 shadow-md hover:border-blue-500/50 hover:text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/15 transition-all duration-200 cursor-pointer"
            aria-label={content.footerBackToTop ?? "Back to top"}
          >
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform duration-200 text-blue-400" />
            <span>{content.footerBackToTop ?? "Back to top"}</span>
          </motion.button>
        </div>

        {/* Copyright & Built with Love Row */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {copyrightYearDisplay}{" "}
            <span className="text-slate-300 font-semibold">{footerText}</span>.{" "}
            {content.footerCopyright ?? "All rights reserved."}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Designed & Built with</span>
            <Heart size={13} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by {footerText}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
