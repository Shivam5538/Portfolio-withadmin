"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ActivityLogItem {
  id: string;
  section: string;
  entityId: string | null;
  entityLabel: string;
  action: "create" | "update" | "delete" | string;
  oldValue: any;
  newValue: any;
  createdAt: string;
}

interface AdminActivityClientProps {
  initialLogs: ActivityLogItem[];
  initialTotal: number;
  initialTotalPages: number;
}

const SECTION_OPTIONS = [
  "All",
  "Hero",
  "About Me",
  "Contact",
  "Footer",
  "Project",
  "Experience",
  "Skill",
  "Technology",
  "Stats",
];

function getSectionBadgeColor(section: string) {
  switch (section) {
    case "Hero":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "About Me":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Contact":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "Footer":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Project":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Experience":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Skill":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Technology":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "Stats":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getActionBadge(action: string) {
  switch (action) {
    case "create":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Plus size={12} /> CREATE
        </span>
      );
    case "update":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Edit3 size={12} /> UPDATE
        </span>
      );
    case "delete":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <Trash2 size={12} /> DELETE
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase">
          {action}
        </span>
      );
  }
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function SnapshotDiffView({ oldVal, newVal }: { oldVal: any; newVal: any }) {
  if (!oldVal && !newVal) return <p className="text-xs text-gray-400">No snapshot data available.</p>;

  const keys = Array.from(
    new Set([
      ...Object.keys(oldVal || {}),
      ...Object.keys(newVal || {}),
    ])
  ).filter((k) => !["createdAt", "updatedAt", "id"].includes(k));

  if (keys.length === 0) {
    return <p className="text-xs text-gray-400 font-mono p-3 bg-gray-50 rounded-xl">No field changes detected.</p>;
  }

  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-12 gap-2 font-bold uppercase tracking-wider text-[10px] text-gray-400 pb-1 border-b border-gray-100">
        <div className="col-span-3">Field</div>
        <div className="col-span-4 text-red-600">Previous Value</div>
        <div className="col-span-5 text-emerald-600">New Value</div>
      </div>

      {keys.map((key) => {
        const vOld = oldVal ? oldVal[key] : undefined;
        const vNew = newVal ? newVal[key] : undefined;
        const strOld = formatValue(vOld);
        const strNew = formatValue(vNew);
        const isChanged = strOld !== strNew;

        if (!isChanged) return null;

        return (
          <div
            key={key}
            className="grid grid-cols-12 gap-2 p-2 rounded-xl border border-amber-100 bg-amber-50/40 font-mono leading-relaxed"
          >
            <div className="col-span-3 font-bold text-gray-800 break-words flex items-center">
              {key}
            </div>
            <div className="col-span-4 text-red-700 bg-red-50/70 p-1.5 rounded-lg border border-red-100 break-all whitespace-pre-wrap">
              {strOld}
            </div>
            <div className="col-span-5 text-emerald-700 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100 break-all whitespace-pre-wrap">
              {strNew}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminActivityClient({
  initialLogs,
  initialTotal,
  initialTotalPages,
}: AdminActivityClientProps) {
  const [logs, setLogs] = useState<ActivityLogItem[]>(initialLogs);
  const [total, setTotal] = useState<number>(initialTotal);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Revert Modal State
  const [revertTarget, setRevertTarget] = useState<ActivityLogItem | null>(null);
  const [isReverting, setIsReverting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLogs = async (page: number, section: string) => {
    setIsLoading(true);
    try {
      const sectionQuery = section !== "All" ? `&section=${encodeURIComponent(section)}` : "";
      const res = await fetch(`/api/activity-log?page=${page}&limit=25${sectionQuery}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (newSection: string) => {
    setSelectedSection(newSection);
    setCurrentPage(1);
    fetchLogs(1, newSection);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchLogs(newPage, selectedSection);
  };

  const handleRevertClick = (log: ActivityLogItem) => {
    setRevertTarget(log);
  };

  const executeRevert = async () => {
    if (!revertTarget) return;
    setIsReverting(true);
    setToastMessage(null);

    try {
      const res = await fetch("/api/activity-log/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: revertTarget.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Revert failed");
      }

      setToastMessage({ type: "success", text: data.message || "Reverted successfully!" });
      setRevertTarget(null);
      // Refresh log list to show the new revert entry
      fetchLogs(currentPage, selectedSection);
    } catch (err: any) {
      setToastMessage({ type: "error", text: err?.message || "Failed to revert entry" });
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <div className="relative p-6 max-w-6xl mx-auto space-y-6 min-h-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 max-w-md ${
              toastMessage.type === "success"
                ? "bg-emerald-900 text-white border-emerald-700"
                : "bg-red-900 text-white border-red-700"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto text-white/60 hover:text-white text-xs font-bold px-2 py-1 rounded-lg"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <History size={24} className="text-blue-600" />
            Activity Log & Changelog
          </h1>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">
            Full audit history of all content changes with snapshot diffs and one-click revert capability.
          </p>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Filter size={14} className="text-gray-400 shrink-0 mr-1" />
          {SECTION_OPTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => handleSectionChange(sec)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedSection === sec
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Subheader summary bar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 text-xs font-semibold text-gray-500">
          <span>
            Showing {logs.length} of {total} entry{total !== 1 ? "ies" : ""}
          </span>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-blue-600">
              <Loader2 size={14} className="animate-spin" /> Fetching logs...
            </span>
          )}
        </div>

        {/* Log list */}
        {logs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <History size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No activity logged yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Any future save, edit, or deletion across Hero, About, Projects, Skills, Experience, or Stats will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const canRevert = log.action === "update" || log.action === "delete";

              return (
                <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Badges + Title */}
                    <div className="flex items-start sm:items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSectionBadgeColor(log.section)}`}>
                        {log.section}
                      </span>

                      {getActionBadge(log.action)}

                      <span className="text-sm font-bold text-gray-900">
                        {log.entityLabel}
                      </span>
                    </div>

                    {/* Right: Timestamp + Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={13} />
                        {formatRelativeTime(log.createdAt)}
                      </span>

                      {/* Expand Diff button */}
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-2xs"
                      >
                        <span>{isExpanded ? "Hide Diff" : "View Diff"}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {/* Revert button */}
                      {canRevert && (
                        <button
                          onClick={() => handleRevertClick(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-2xs group"
                          title="Revert content back to this version"
                        >
                          <RotateCcw size={13} className="group-hover:-rotate-90 transition-transform duration-300" />
                          <span>Revert</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Diff Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100 overflow-hidden"
                      >
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-500" />
                          Field Snapshot Diff
                        </h4>
                        <SnapshotDiffView oldVal={log.oldValue} newVal={log.newValue} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Revert */}
      <AnimatePresence>
        {revertTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Confirm Revert Operation
                  </h3>
                  <p className="text-xs text-gray-500">
                    Restoring previous content version
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  Are you sure you want to revert "{revertTarget.entityLabel}"?
                </p>
                <p className="leading-relaxed font-medium">
                  This will overwrite the current live content in <span className="font-bold">{revertTarget.section}</span> with the snapshot taken on {new Date(revertTarget.createdAt).toLocaleString()}.
                </p>
                <p className="text-[11px] text-amber-700 italic">
                  Note: A new activity log entry will be created for this revert, allowing you to undo it later if needed.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setRevertTarget(null)}
                  disabled={isReverting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={executeRevert}
                  disabled={isReverting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isReverting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Reverting...
                    </>
                  ) : (
                    "Confirm & Revert Now"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
