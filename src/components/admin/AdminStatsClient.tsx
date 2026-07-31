"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  Save,
  Loader2,
  Check,
  X,
  Sparkles,
  LayoutGrid,
  Split,
  Flame,
  Box,
  Compass,
  MoveRight,
  FolderKanban,
  Users,
  GitCommit,
  Coffee,
  Award,
  Zap,
  CheckCircle,
  TrendingUp,
  Clock,
  Code,
  Star,
  Layers,
  Cpu,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui";
import { STATS_TEMPLATES, getStatsTemplateById } from "@/lib/statsTemplates";
import Stats from "@/components/sections/Stats";

interface StatItem {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  iconKey?: string;
  order?: number;
}

const COMMON_STAT_ICONS = [
  { key: "FolderKanban", label: "Projects / Work", icon: FolderKanban },
  { key: "Users", label: "Clients / Team", icon: Users },
  { key: "GitCommit", label: "Commits / Code", icon: GitCommit },
  { key: "Coffee", label: "Coffee / Fuel", icon: Coffee },
  { key: "Award", label: "Awards / Experience", icon: Award },
  { key: "Sparkles", label: "Sparkles / Polish", icon: Sparkles },
  { key: "Zap", label: "Performance / Speed", icon: Zap },
  { key: "CheckCircle", label: "Completed / Quality", icon: CheckCircle },
  { key: "TrendingUp", label: "Growth / Impact", icon: TrendingUp },
  { key: "Clock", label: "Hours / Experience", icon: Clock },
  { key: "Code", label: "Codebase / Repos", icon: Code },
  { key: "Star", label: "Stars / Ratings", icon: Star },
];

export default function AdminStatsClient() {
  const [activeTab, setActiveTab] = useState<"templates" | "manage">("templates");

  const [stats, setStats] = useState<StatItem[]>([]);
  const [activeStatsTemplate, setActiveStatsTemplate] = useState<string>("template_1");
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<string>("template_1");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [modalFormData, setModalFormData] = useState<{
    label: string;
    value: string;
    suffix: string;
    iconKey: string;
  }>({
    label: "",
    value: "",
    suffix: "",
    iconKey: "FolderKanban",
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          if (Array.isArray(data.stats)) setStats(data.stats);
          if (data.activeStatsTemplate) {
            setActiveStatsTemplate(data.activeStatsTemplate);
            setSelectedTemplateForPreview(data.activeStatsTemplate);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load stats:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSaveAll = async (overrideTemplate?: string) => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const templateToSave = overrideTemplate || selectedTemplateForPreview;

    try {
      const res = await fetch("/api/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats,
          activeStatsTemplate: templateToSave,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save stats configuration.");
      }

      setActiveStatsTemplate(templateToSave);
      setSelectedTemplateForPreview(templateToSave);
      const tmplObj = getStatsTemplateById(templateToSave);
      setMessage({
        type: "success",
        text: `Switched to "${tmplObj.name}" layout template! Live website updated.`,
      });
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Stat Item Reordering
  const moveStat = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === stats.length - 1)
    ) {
      return;
    }
    const updated = [...stats];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setStats(updated);
  };

  // Delete Stat
  const deleteStat = (id: string) => {
    setStats((prev) => prev.filter((s) => s.id !== id));
  };

  // Open Modal for Add
  const openAddModal = () => {
    setEditingStat(null);
    setModalFormData({
      label: "",
      value: "10",
      suffix: "+",
      iconKey: "FolderKanban",
    });
    setShowModal(true);
  };

  // Open Modal for Edit
  const openEditModal = (stat: StatItem) => {
    setEditingStat(stat);
    setModalFormData({
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix || "",
      iconKey: stat.iconKey || "FolderKanban",
    });
    setShowModal(true);
  };

  // Submit Modal
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFormData.label.trim() || !modalFormData.value.trim()) return;

    if (editingStat) {
      // Edit existing
      setStats((prev) =>
        prev.map((s) =>
          s.id === editingStat.id
            ? {
                ...s,
                label: modalFormData.label.trim(),
                value: modalFormData.value.trim(),
                suffix: modalFormData.suffix.trim(),
                iconKey: modalFormData.iconKey,
              }
            : s
        )
      );
    } else {
      // Add new
      const newStat: StatItem = {
        id: String(Date.now()),
        label: modalFormData.label.trim(),
        value: modalFormData.value.trim(),
        suffix: modalFormData.suffix.trim(),
        iconKey: modalFormData.iconKey,
        order: stats.length + 1,
      };
      setStats((prev) => [...prev, newStat]);
    }

    setShowModal(false);
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "Split":
        return <Split size={18} />;
      case "LayoutGrid":
        return <LayoutGrid size={18} />;
      case "Flame":
        return <Flame size={18} />;
      case "Box":
        return <Box size={18} />;
      case "Compass":
        return <Compass size={18} />;
      case "MoveRight":
        return <MoveRight size={18} />;
      default:
        return <BarChart3 size={18} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={22} /> Stats & Metrics Editor
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your "By the Numbers" entries and choose between 6 layout templates
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message.text && (
            <div
              className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in duration-200 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.type === "success" ? <Check size={14} /> : <X size={14} />}
              {message.text}
            </div>
          )}

          <Button
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            size="sm"
            className="px-5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-1.5" size={14} /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5" size={14} /> Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "templates"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <LayoutGrid size={15} /> 1. Layout Template Gallery & Live Preview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "manage"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <BarChart3 size={15} /> 2. Manage Stat Entries ({stats.length})
        </button>
      </div>

      {/* TAB 1: Layout Gallery & Interactive Live Preview */}
      {activeTab === "templates" && (
        <div className="space-y-8">
          {/* Template Gallery Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" /> Select Active Layout Template
                </h2>
                <p className="text-xs text-gray-500">
                  Choose from 6 preset layout styles. Click a card to preview it live below.
                </p>
              </div>

              <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                Active on Site: {getStatsTemplateById(activeStatsTemplate).name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATS_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateForPreview === tmpl.id;
                const isActiveOnSite = activeStatsTemplate === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSaveAll(tmpl.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      isActiveOnSite
                        ? "bg-purple-50/80 border-purple-500 shadow-md ring-2 ring-purple-400/40 scale-[1.01]"
                        : isSelected
                        ? "bg-purple-50/40 border-purple-300 shadow-xs"
                        : "bg-white border-gray-200/90 hover:border-purple-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                          <div className="p-2 rounded-xl bg-purple-100/80 text-purple-700">
                            {getTemplateIcon(tmpl.iconName)}
                          </div>
                          <span>{tmpl.name}</span>
                        </div>

                        {isActiveOnSite ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200 shadow-2xs">
                            <Check size={11} /> Active Template
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                            Selected
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed">{tmpl.description}</p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {tmpl.badge}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSaving}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveAll(tmpl.id);
                        }}
                        className={`text-[11px] h-7 rounded-lg px-3 ${
                          isActiveOnSite
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isActiveOnSite ? "Active" : "Apply & Save"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <Sparkles size={14} /> Live Template Preview ({getStatsTemplateById(selectedTemplateForPreview).name})
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  This preview renders using your real stat entries currently in database
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSaveAll(selectedTemplateForPreview)}
                  disabled={isSaving || activeStatsTemplate === selectedTemplateForPreview}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl"
                >
                  Save & Set Active
                </Button>
              </div>
            </div>

            {/* Live Component Render */}
            <div className="rounded-2xl border border-gray-200/90 overflow-hidden bg-gray-50/50 p-2 sm:p-6 shadow-inner">
              <Stats
                siteContent={{
                  stats: JSON.stringify(stats),
                }}
                activeStatsTemplate={selectedTemplateForPreview}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manage Stat Entries (CRUD & Order) */}
      {activeTab === "manage" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-500" /> Stat Entries ({stats.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Add, edit, delete, or reorder your stats. No fixed limit on count.
              </p>
            </div>

            <Button onClick={openAddModal} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl">
              <Plus size={14} className="mr-1" /> Add New Stat Entry
            </Button>
          </div>

          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div
                key={stat.id || index}
                className="p-4 rounded-xl bg-gray-50/90 border border-gray-200/80 flex flex-wrap items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-gray-900">
                        {stat.value}
                        {stat.suffix}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">{stat.label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Icon: {stat.iconKey || "FolderKanban"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => moveStat(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStat(index, "down")}
                      disabled={index === stats.length - 1}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(stat)}
                    className="p-2 hover:bg-purple-50 text-purple-700 rounded-lg border border-gray-200 transition-colors"
                    title="Edit Stat"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteStat(stat.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg border border-gray-200 transition-colors"
                    title="Delete Stat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {stats.length === 0 && (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-2xl">
                <BarChart3 size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-semibold text-gray-700">No Stat Entries Added</p>
                <p className="text-xs text-gray-400 mb-4">Add stat metrics to showcase your experience.</p>
                <Button onClick={openAddModal} size="sm" className="bg-purple-600 text-white rounded-xl text-xs">
                  <Plus size={14} className="mr-1" /> Add Your First Stat
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">
                  {editingStat ? "Edit Stat Entry" : "Add New Stat Entry"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="stat-label">Stat Label *</Label>
                  <Input
                    id="stat-label"
                    type="text"
                    value={modalFormData.label}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. Projects Delivered / Happy Clients"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="stat-value">Value (Number / Infinity) *</Label>
                    <Input
                      id="stat-value"
                      type="text"
                      value={modalFormData.value}
                      onChange={(e) => setModalFormData((prev) => ({ ...prev, value: e.target.value }))}
                      placeholder="e.g. 50 or ∞"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="stat-suffix">Suffix (Optional)</Label>
                    <Input
                      id="stat-suffix"
                      type="text"
                      value={modalFormData.suffix}
                      onChange={(e) => setModalFormData((prev) => ({ ...prev, suffix: e.target.value }))}
                      placeholder="e.g. + or % or hrs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stat-icon">Stat Icon</Label>
                  <select
                    id="stat-icon"
                    value={modalFormData.iconKey}
                    onChange={(e) => setModalFormData((prev) => ({ ...prev, iconKey: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {COMMON_STAT_ICONS.map((ico) => (
                      <option key={ico.key} value={ico.key}>
                        {ico.label} ({ico.key})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} size="sm" className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                    {editingStat ? "Save Stat" : "Add Stat"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
