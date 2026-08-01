"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  Zap,
  Briefcase,
  User,
  Settings,
  FolderOpen,
  MessageSquare,
  LogOut,
  ExternalLink,
  Globe,
  ChevronDown,
  ChevronRight,
  BarChart3,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Zap },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/stats", label: "Stats", icon: BarChart3 },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/activity", label: "Activity Log", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/files", label: "Files", icon: FolderOpen },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isSiteContentOpen, setIsSiteContentOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [adminName, setAdminName] = useState("Shivam Zaware");

  useEffect(() => {
    if (pathname.startsWith("/admin/site-content")) {
      setIsSiteContentOpen(true);
    }
  }, [pathname]);

  // Fetch admin profile name
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) {
          setAdminName(data.name);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch unread count from API
  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const siteContentSubItems = [
    { href: "/admin/site-content/hero", label: "Hero Section" },
    { href: "/admin/site-content/about", label: "About Me" },
    { href: "/admin/site-content/contact", label: "Contact Section" },
    { href: "/admin/site-content/footer", label: "Footer" },
  ];

  return (
    <aside className="admin-sidebar flex flex-col py-5">
      {/* Header Greeting */}
      <div className="px-6 mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Welcome
        </div>
        <div
          className="text-lg font-bold text-transparent bg-clip-text truncate"
          style={{
            backgroundImage: "linear-gradient(135deg, #60a5fa, #a78bfa, #fb923c)",
          }}
          title={adminName}
        >
          {adminName}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {/* Dashboard link */}
        {navItems.slice(0, 1).map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
              isActive(href, exact)
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* Site Content collapsible group */}
        <div className="space-y-0.5">
          <button
            onClick={() => setIsSiteContentOpen((prev) => !prev)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-left",
              pathname.startsWith("/admin/site-content")
                ? "bg-white/5 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="flex items-center gap-3">
              <Globe size={18} />
              Site Content
            </span>
            {isSiteContentOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {isSiteContentOpen && (
            <div className="pl-9 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              {siteContentSubItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "block px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                    pathname === href
                      ? "text-white bg-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Remaining nav links */}
        {navItems.slice(1).map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
              isActive(href, exact)
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="flex items-center gap-3">
              <Icon size={18} />
              {label}
            </span>
            {label === "Messages" && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs animate-in zoom-in duration-200">
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="px-3 space-y-0.5 border-t border-white/5 pt-3 mt-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink size={18} />
          View Site
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/admin" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          id="admin-signout-btn"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
