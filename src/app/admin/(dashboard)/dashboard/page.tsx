import { prisma } from "@/lib/prisma";
import {
  FolderKanban,
  Zap,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Mail,
  ArrowRight,
  Phone,
  LayoutTemplate,
  UserCircle,
  Clock,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import LoginWelcomeToast from "@/components/admin/LoginWelcomeToast";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [projects, skills, experience, messages, unread, recentUnread, recentProjects] = await Promise.all([
      prisma.project.count(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.message.count(),
      prisma.message.count({ where: { read: false } }),
      prisma.message.findMany({
        where: { read: false },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, title: true, updatedAt: true }
      })
    ]);
    return { projects, skills, experience, messages, unread, recentUnread, recentProjects };
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
    return { projects: 0, skills: 0, experience: 0, messages: 0, unread: 0, recentUnread: [], recentProjects: [] };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const cards = [
    {
      label: "Projects",
      value: data.projects,
      icon: FolderKanban,
      href: "/admin/projects",
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      trend: "+2 this month",
    },
    {
      label: "Skills",
      value: data.skills,
      icon: Zap,
      href: "/admin/skills",
      gradient: "from-violet-500 to-fuchsia-500",
      shadow: "shadow-violet-500/20",
      trend: "+1 recently",
    },
    {
      label: "Experience",
      value: data.experience,
      icon: Briefcase,
      href: "/admin/experience",
      gradient: "from-orange-400 to-amber-500",
      shadow: "shadow-orange-500/20",
    },
    {
      label: "Messages",
      value: data.messages,
      icon: MessageSquare,
      href: "/admin/messages",
      gradient: "from-emerald-400 to-teal-500",
      shadow: "shadow-emerald-500/20",
      badge: data.unread > 0 ? `${data.unread} unread` : undefined,
    },
  ];

  return (
    <div className="relative p-6 max-w-6xl mx-auto space-y-6 min-h-full">
      {/* Welcome Toast Popup Notification */}
      <LoginWelcomeToast />

      {/* Subtle Background Blob */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-blue-50/80 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-xs mt-0.5 font-medium">Manage your portfolio content and customer inquiries</p>
      </div>

      {/* Prominent Unread Messages Notification Card (Only visible when unread > 0) */}
      {data.unread > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-blue-200/80 p-3.5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                You have {data.unread} new unread message{data.unread > 1 ? "s" : ""}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  Needs Attention
                </span>
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">
                Recent contact form submissions received from your website
              </p>
            </div>
          </div>

          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all shrink-0"
          >
            <span>View Messages</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, href, gradient, shadow, badge, trend }) => (
          <Link
            key={label}
            href={href}
            className="group relative bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 block overflow-hidden"
          >
            {/* Hover subtle glow effect */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-full blur-xl -mr-8 -mt-8`} />
            
            <div className="flex items-center justify-between mb-3 relative">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md ${shadow}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              {badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            
            <div className="relative">
              <div className="text-2xl font-black text-gray-900 tracking-tight mb-0.5">{value}</div>
              <div className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors flex items-center justify-between">
                {label}
                {trend && (
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    {trend}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick links */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-1.5">
            <Zap size={14} className="text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { label: "Edit Hero Section", href: "/admin/site-content/hero", icon: LayoutTemplate, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Edit About Me", href: "/admin/site-content/about", icon: UserCircle, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Manage Projects", href: "/admin/projects", icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Manage Experience", href: "/admin/experience", icon: Briefcase, color: "text-orange-600", bg: "bg-orange-50" },
            ].map(({ label, href, icon: Icon, color, bg }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-xs transition-all group bg-white"
              >
                <div className={`p-2 rounded-lg ${bg} ${color}`}>
                  <Icon size={16} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">{label}</span>
              </Link>
            ))}
            
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 hover:border-blue-200 transition-all group bg-gradient-to-r from-blue-50 to-indigo-50/50 sm:col-span-2 mt-1"
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs shrink-0">
                <ExternalLink size={16} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-xs font-extrabold text-blue-900">View Live Portfolio</span>
                <span className="text-[11px] text-blue-600/80 font-medium">See production site changes</span>
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3.5 flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {data.recentUnread.map((msg) => (
              <div key={msg.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Mail size={13} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-800 leading-snug truncate">
                    <span className="font-bold text-gray-900">{msg.name}</span> sent a message
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {data.recentProjects.map((proj) => (
              <div key={proj.id} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Edit3 size={13} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-800 leading-snug truncate">
                    <span className="font-bold text-gray-900">"{proj.title}"</span> updated
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {new Date(proj.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {data.recentUnread.length === 0 && data.recentProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Clock size={16} className="text-gray-300 mb-1" />
                <p className="text-xs font-bold text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
