"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Layers,
  Sparkles,
  Check,
  RotateCw,
  AlertTriangle,
  LayoutGrid,
  CheckCircle2,
  Cpu,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError } from "@/components/ui";
import {
  renderIconByKey,
  getBrandColor,
} from "@/lib/icons";
import type { IconItem } from "@/lib/iconStore";
import {
  LAYOUT_TEMPLATES,
  LayoutTemplate,
  SlotDefinition,
  getTemplateById,
} from "@/lib/templates";

const techSchema = z.object({
  name: z.string().min(1, "Technology name is required"),
  category: z.string().min(1, "Category is required"),
  iconKey: z.string().min(1, "Icon key is required"),
});

type TechFormData = z.infer<typeof techSchema>;

interface Technology {
  id: string;
  name: string;
  category: string;
  iconKey: string;
}

interface SlotAssignment {
  id: string;
  templateId: string;
  slotId: string;
  technologyId: string;
  technology: Technology;
}

const CATEGORIES = ["Frontend", "Backend", "Tools", "Design", "Cloud & DevOps", "Other"];

export default function AdminSkillsClient() {
  const [activeTab, setActiveTab] = useState<"templates" | "master">("templates");
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTech, setLoadingTech] = useState(true);

  const [activeTemplateId, setActiveTemplateId] = useState<string>("template_1");
  const [slotAssignments, setSlotAssignments] = useState<Record<string, Technology>>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [showTechModal, setShowTechModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [savingTech, setSavingTech] = useState(false);
  const [deletingTechId, setDeletingTechId] = useState<string | null>(null);

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconQuery, setIconQuery] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState("SiReact");
  const [isAutoDetected, setIsAutoDetected] = useState(true);
  const [iconSearchResults, setIconSearchResults] = useState<IconItem[]>([]);
  const [isSearchingIcons, setIsSearchingIcons] = useState(false);
  const [searchAllIcons, setSearchAllIcons] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedSlotForAssignment, setSelectedSlotForAssignment] = useState<SlotDefinition | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TechFormData>({
    resolver: zodResolver(techSchema),
    defaultValues: { name: "", category: "Frontend", iconKey: "SiReact" },
  });

  const watchName = watch("name");

  const fetchTechnologies = async () => {
    setLoadingTech(true);
    try {
      const res = await fetch("/api/technologies");
      const data = await res.json();
      if (Array.isArray(data)) setTechnologies(data);
    } catch (err) {
      console.error("Failed to fetch technologies:", err);
    } finally {
      setLoadingTech(false);
    }
  };

  const fetchLayoutData = async () => {
    setLoadingSlots(true);
    try {
      const settingRes = await fetch("/api/layout/settings");
      const settingData = await settingRes.json();
      const templateId = settingData.activeTemplateId || "template_1";
      setActiveTemplateId(templateId);

      const slotsRes = await fetch(`/api/layout/slots?templateId=${templateId}`);
      const slotsData: SlotAssignment[] = await slotsRes.json();

      const mapping: Record<string, Technology> = {};
      if (Array.isArray(slotsData)) {
        slotsData.forEach((a) => {
          if (a.technology) mapping[a.slotId] = a.technology;
        });
      }
      setSlotAssignments(mapping);
    } catch (err) {
      console.error("Failed to fetch layout data:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
    fetchLayoutData();
  }, []);

  // Auto-detect Icon when Technology Name changes (~300ms)
  useEffect(() => {
    if (!showTechModal) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      if (watchName && watchName.trim().length > 0) {
        const { findAutoIcon } = await import("@/lib/iconStore");
        const detected = findAutoIcon(watchName);
        if (detected.isMatch) {
          setSelectedIconKey(detected.key);
          setValue("iconKey", detected.key);
          setIsAutoDetected(true);
        } else {
          setSelectedIconKey("SiCode");
          setValue("iconKey", "SiCode");
          setIsAutoDetected(false);
        }
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [watchName, showTechModal, setValue]);

  const triggerAutoDetect = async () => {
    if (watchName && watchName.trim().length > 0) {
      const { findAutoIcon } = await import("@/lib/iconStore");
      const detected = findAutoIcon(watchName);
      if (detected.isMatch) {
        setSelectedIconKey(detected.key);
        setValue("iconKey", detected.key);
        setIsAutoDetected(true);
      } else {
        setSelectedIconKey("SiCode");
        setValue("iconKey", "SiCode");
        setIsAutoDetected(false);
      }
    }
  };

  // Change Active Template
  const handleSelectTemplate = async (templateId: string) => {
    setSavingTemplate(true);
    try {
      setActiveTemplateId(templateId);
      await fetch("/api/layout/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeTemplateId: templateId }),
      });

      // Load slot assignments for newly selected template
      const slotsRes = await fetch(`/api/layout/slots?templateId=${templateId}`);
      const slotsData: SlotAssignment[] = await slotsRes.json();
      const mapping: Record<string, Technology> = {};
      if (Array.isArray(slotsData)) {
        slotsData.forEach((a) => {
          if (a.technology) mapping[a.slotId] = a.technology;
        });
      }
      setSlotAssignments(mapping);
    } catch (err) {
      console.error("Failed to update template setting:", err);
    } finally {
      setSavingTemplate(false);
    }
  };

  // Assign or Unassign Technology to Slot
  const handleAssignTechnologyToSlot = async (slotId: string, tech: Technology | null) => {
    try {
      if (tech === null) {
        // Unassign
        const updated = { ...slotAssignments };
        delete updated[slotId];
        setSlotAssignments(updated);

        await fetch("/api/layout/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: activeTemplateId,
            slotId,
            technologyId: null,
          }),
        });
      } else {
        // Assign
        setSlotAssignments((prev) => ({ ...prev, [slotId]: tech }));

        await fetch("/api/layout/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: activeTemplateId,
            slotId,
            technologyId: tech.id,
          }),
        });
      }
      setSelectedSlotForAssignment(null);
    } catch (err) {
      console.error("Failed to assign technology to slot:", err);
    }
  };

  // Save Master Technology
  const onSubmitTech = async (data: TechFormData) => {
    setSavingTech(true);
    try {
      if (editingTech) {
        await fetch(`/api/technologies/${editingTech.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/technologies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setShowTechModal(false);
      fetchTechnologies();
      fetchLayoutData();
    } catch (err) {
      console.error("Failed to save technology:", err);
    } finally {
      setSavingTech(false);
    }
  };

  const handleDeleteTech = async (tech: Technology) => {
    if (!confirm(`Delete technology "${tech.name}"? It will also be removed from any active grid slots.`)) return;
    setDeletingTechId(tech.id);
    try {
      await fetch(`/api/technologies/${tech.id}`, { method: "DELETE" });
      fetchTechnologies();
      fetchLayoutData();
    } catch (err) {
      console.error("Failed to delete technology:", err);
    } finally {
      setDeletingTechId(null);
    }
  };

  const openCreateTech = () => {
    setEditingTech(null);
    setSelectedIconKey("SiReact");
    setIsAutoDetected(true);
    reset({ name: "", category: "Frontend", iconKey: "SiReact" });
    setShowTechModal(true);
  };

  const openEditTech = (tech: Technology) => {
    setEditingTech(tech);
    setSelectedIconKey(tech.iconKey || "SiCode");
    setIsAutoDetected(true);
    reset({ name: tech.name, category: tech.category, iconKey: tech.iconKey });
    setShowTechModal(true);
  };

  const selectIconInPicker = (icon: IconItem) => {
    setSelectedIconKey(icon.key);
    setValue("iconKey", icon.key);
    setIsAutoDetected(false);
    if (!watch("name")) setValue("name", icon.name);
    setShowIconPicker(false);
    setIconQuery("");
    setSearchAllIcons(false);
  };

  useEffect(() => {
    let isMounted = true;
    setIsSearchingIcons(true);
    
    import("@/lib/iconStore").then((mod) => {
      if (!isMounted) return;
      // Use tech-filtered search by default; fall back to full catalog when user opts in
      const results = searchAllIcons
        ? mod.searchSimpleIcons(iconQuery, 72)
        : mod.searchTechIcons(iconQuery, 72);
      setIconSearchResults(results);
      setIsSearchingIcons(false);
    });

    return () => {
      isMounted = false;
    };
  }, [iconQuery, searchAllIcons]);

  const activeTemplate = getTemplateById(activeTemplateId);

  const groupedTechs = technologies.reduce<Record<string, Technology[]>>((acc, t) => {
    const cat = t.category || "Frontend";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#111111]">Skills Section Admin</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              Mosaic Templates & Master Pool
            </span>
          </div>
          <p className="text-[#6b7280] text-sm mt-1">
            Choose a preset mosaic grid template, assign master technologies to exact slot positions, and auto-detect brand icons.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Section View Tabs */}
          <div className="bg-[#f3f4f6] p-1 rounded-xl flex items-center">
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "templates"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              <LayoutGrid size={14} /> Templates & Slots
            </button>
            <button
              onClick={() => setActiveTab("master")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "master"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              <Cpu size={14} /> Master Technology Pool ({technologies.length})
            </button>
          </div>
          <Button onClick={openCreateTech} id="admin-add-tech-btn" className="gap-2 shadow-sm">
            <Plus size={16} /> Add Technology
          </Button>
        </div>
      </div>

      {activeTab === "templates" ? (
        <>
          {/* SECTION A: GRID LAYOUT TEMPLATES GALLERY */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500" /> A. Preset Mosaic Layout Templates
                </h2>
                <p className="text-xs text-[#6b7280]">
                  Select one of the 6 fixed mosaic layout gallery presets to format the public Skills section.
                </p>
              </div>
              {savingTemplate && (
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Saving layout...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {LAYOUT_TEMPLATES.map((tmpl) => {
                const isActive = activeTemplateId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                      isActive
                        ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md"
                        : "border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.18)] hover:shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                          {tmpl.name}
                        </span>
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white flex items-center gap-1">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#9ca3af]">
                            {tmpl.slots.length} Slots
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b7280] leading-relaxed mb-3">{tmpl.description}</p>
                    </div>

                    <div className="p-3 bg-[#fafafa] rounded-2xl border border-[rgba(0,0,0,0.06)]">
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: "repeat(6, 1fr)",
                          gridAutoRows: "18px",
                          gap: "3px",
                        }}
                      >
                        {tmpl.slots.map((s) => (
                          <div
                            key={s.slotId}
                            style={{
                              gridColumn: `span ${s.colSpan}`,
                              gridRow: `span ${s.rowSpan}`,
                            }}
                            className={`rounded-md transition-colors ${
                              s.colSpan === 2 && s.rowSpan === 2
                                ? "bg-blue-500"
                                : s.colSpan === 2
                                ? "bg-indigo-400"
                                : s.rowSpan === 2
                                ? "bg-purple-400"
                                : "bg-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: INTERACTIVE SLOT ASSIGNMENT GRID */}
          <div className="bg-white p-6 rounded-3xl border border-[rgba(0,0,0,0.07)] shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
                  <BookmarkCheck size={18} className="text-blue-500" /> B. Slot Assignments for &ldquo;{activeTemplate.name}&rdquo;
                </h2>
                <p className="text-xs text-[#6b7280]">
                  Click any slot tile below to choose which technology from your master pool occupies that position.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                {activeTemplate.slots.length} Slots
              </span>
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
              </div>
            ) : (
              <div
                className="grid max-w-4xl mx-auto p-4 bg-[#fafafa] rounded-2xl border border-[rgba(0,0,0,0.06)]"
                style={{
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gridAutoRows: "96px",
                  gridAutoFlow: "dense",
                  gap: "8px",
                }}
              >
                {activeTemplate.slots.map((slot) => {
                  const assignedTech = slotAssignments[slot.slotId];
                  const brandColor = assignedTech ? getBrandColor(assignedTech.name) : "#9ca3af";

                  return (
                    <div
                      key={slot.slotId}
                      style={{
                        gridColumn: `span ${slot.colSpan}`,
                        gridRow: `span ${slot.rowSpan}`,
                      }}
                      onClick={() => setSelectedSlotForAssignment(slot)}
                      className={`group relative rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center p-3 select-none ${
                        assignedTech
                          ? "border-white/80 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400"
                          : "border-dashed border-[rgba(0,0,0,0.2)] bg-white/70 hover:bg-blue-50/50 hover:border-blue-400"
                      }`}
                    >
                      {assignedTech ? (
                        <>
                          <div className="absolute inset-0" style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(12px)" }} />
                          <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: `radial-gradient(circle at 50% 100%, ${brandColor}40 0%, transparent 70%)` }} />
                          <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <div style={{ color: brandColor }}>
                              {renderIconByKey(assignedTech.iconKey || assignedTech.name, "w-8 h-8")}
                            </div>
                            <span className="text-xs font-bold text-[#111111] mt-1 line-clamp-1">{assignedTech.name}</span>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/5 text-[#374151] mt-0.5">{slot.colSpan}x{slot.rowSpan}</span>
                          </div>

                          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col items-center justify-center p-2 text-center text-white">
                            <span className="text-xs font-bold">Change Technology</span>
                            <span className="text-[10px] text-slate-300 mt-0.5">Click to reassign</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2 text-[#9ca3af] group-hover:text-blue-600">
                          <Plus size={20} className="mb-1" />
                          <span className="text-xs font-bold">{slot.label}</span>
                          <span className="text-[10px] font-semibold text-blue-500 mt-0.5">+ Click to assign</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* SECTION C: MASTER TECHNOLOGY POOL */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-[rgba(0,0,0,0.07)]">
            <div>
              <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
                <Cpu size={18} className="text-blue-500" /> Master Technology Pool
              </h2>
              <p className="text-xs text-[#6b7280]">
                All technologies created here can be assigned to grid template slots above.
              </p>
            </div>
            <Button onClick={openCreateTech} className="gap-2 text-xs">
              <Plus size={14} /> Add Technology
            </Button>
          </div>

          {loadingTech ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-[rgba(0,0,0,0.07)]">
              <Loader2 size={28} className="animate-spin text-[#9ca3af]" />
            </div>
          ) : technologies.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[rgba(0,0,0,0.15)] p-8">
              <Sparkles size={32} className="text-blue-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#111111]">No master technologies added</h3>
              <p className="text-xs text-[#6b7280] mt-1 mb-4">
                Add technologies to your pool so you can place them into mosaic grid slots.
              </p>
              <Button onClick={openCreateTech} className="gap-2">
                <Plus size={16} /> Add First Technology
              </Button>
            </div>
          ) : (
            Object.entries(groupedTechs).map(([category, catTechs]) => (
              <div key={category} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-[#f9f9fb] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#374151] uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-blue-500" /> {category}
                  </h3>
                  <span className="text-xs font-medium text-[#9ca3af]">{catTechs.length} items</span>
                </div>
                <div className="divide-y divide-[rgba(0,0,0,0.04)]">
                  {catTechs.map((tech) => {
                    const brandColor = getBrandColor(tech.name || tech.iconKey);
                    return (
                      <div key={tech.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#f9f9fb] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/80 shadow-sm" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                            {renderIconByKey(tech.iconKey, "w-6 h-6")}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#111111] block">{tech.name}</span>
                            <span className="text-xs text-[#9ca3af] font-mono">{tech.iconKey}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditTech(tech)} className="p-2 rounded-xl hover:bg-[rgba(0,0,0,0.05)] text-[#6b7280] hover:text-[#111111] transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => handleDeleteTech(tech)} disabled={deletingTechId === tech.id} className="p-2 rounded-xl hover:bg-red-50 text-[#6b7280] hover:text-red-500 transition-colors">
                            {deletingTechId === tech.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SLOT ASSIGNMENT PICKER MODAL */}
      <AnimatePresence>
        {selectedSlotForAssignment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelectedSlotForAssignment(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111111]">Assign Technology to {selectedSlotForAssignment.label}</h3>
                  <p className="text-xs text-[#6b7280] mt-0.5">Select a technology from your master pool to occupy this {selectedSlotForAssignment.colSpan}x{selectedSlotForAssignment.rowSpan} slot.</p>
                </div>
                <button onClick={() => setSelectedSlotForAssignment(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={18} /></button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-3">
                {slotAssignments[selectedSlotForAssignment.slotId] && (
                  <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-700">Currently assigned: {slotAssignments[selectedSlotForAssignment.slotId].name}</span>
                    <button onClick={() => handleAssignTechnologyToSlot(selectedSlotForAssignment.slotId, null)} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all">Unassign Slot</button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {technologies.map((tech) => {
                    const brandColor = getBrandColor(tech.name);
                    const isAssignedToThisSlot = slotAssignments[selectedSlotForAssignment.slotId]?.id === tech.id;

                    return (
                      <button key={tech.id} onClick={() => handleAssignTechnologyToSlot(selectedSlotForAssignment.slotId, tech)} className={`p-3.5 rounded-2xl border transition-all text-left flex items-center gap-3 group ${isAssignedToThisSlot ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 shadow-sm" : "border-[rgba(0,0,0,0.08)] bg-white hover:border-blue-300 hover:bg-slate-50"}`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/80 shrink-0" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                          {renderIconByKey(tech.iconKey, "w-5 h-5")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#111111] truncate">{tech.name}</p>
                          <p className="text-[10px] text-[#9ca3af]">{tech.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT MASTER TECH MODAL */}
      <AnimatePresence>
        {showTechModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setShowTechModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
              <div className="flex items-center justify-between p-6 border-b border-[rgba(0,0,0,0.07)]">
                <h3 className="text-lg font-bold text-[#111111]">{editingTech ? "Edit Master Technology" : "New Master Technology"}</h3>
                <button onClick={() => setShowTechModal(false)} className="p-2 rounded-xl hover:bg-[rgba(0,0,0,0.05)] text-[#6b7280]"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit(onSubmitTech)} className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tech-name">Technology Name *</Label>
                    <button type="button" onClick={triggerAutoDetect} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"><RotateCw size={12} /> Auto-detect Icon</button>
                  </div>
                  <Input id="tech-name" placeholder="e.g. React, Next.js, Docker, PostgreSQL, Rust..." {...register("name")} />
                  <FormError message={errors.name?.message} />
                </div>

                <div>
                  <Label>Brand Icon (Auto-Detected)</Label>
                  <div className="flex items-center gap-3 mt-1.5 p-3 rounded-2xl bg-[#fafafa] border border-[rgba(0,0,0,0.08)]">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/80 shadow-sm shrink-0" style={{ backgroundColor: `${getBrandColor(watchName || selectedIconKey)}15`, color: getBrandColor(watchName || selectedIconKey) }}>
                      {renderIconByKey(selectedIconKey, "w-7 h-7")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111111] font-mono">{selectedIconKey}</span>
                        {isAutoDetected ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">Auto-detected</span>
                        ) : selectedIconKey === "SiCode" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1"><AlertTriangle size={10} /> No icon match</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">Custom Selected</span>
                        )}
                      </div>
                      {!isAutoDetected && selectedIconKey === "SiCode" && (
                        <p className="text-[11px] text-amber-700 mt-0.5">No icon match found — please select one manually.</p>
                      )}
                    </div>
                    <Button type="button" variant="secondary" onClick={() => setShowIconPicker(true)} className="text-xs gap-1.5 h-9"><Search size={14} /> Change Icon</Button>
                  </div>
                  <input type="hidden" {...register("iconKey")} value={selectedIconKey} />
                </div>

                <div>
                  <Label htmlFor="tech-category">Category *</Label>
                  <select id="tech-category" {...register("category")} className="w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(0,0,0,0.07)]">
                  <Button type="button" variant="secondary" onClick={() => setShowTechModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={savingTech}>{savingTech ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editingTech ? "Save Changes" : "Create Technology"}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIconPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { setShowIconPicker(false); setIconQuery(""); setSearchAllIcons(false); } }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-2xl h-[560px] flex flex-col shadow-2xl overflow-hidden">
              {/* Header: Search + Close */}
              <div className="p-5 border-b border-[rgba(0,0,0,0.07)] flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="text"
                    value={iconQuery}
                    onChange={(e) => setIconQuery(e.target.value)}
                    placeholder={searchAllIcons ? "Search all 3,000+ Simple Icons..." : "Search dev icons (React, Docker, Python, AWS…)"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    autoFocus
                  />
                </div>
                <button onClick={() => { setShowIconPicker(false); setIconQuery(""); setSearchAllIcons(false); }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={20} /></button>
              </div>

              {/* Scope toggle */}
              <div className="px-5 pt-2.5 pb-1 flex items-center justify-between">
                <p className="text-[11px] text-[#9ca3af] font-medium">
                  {searchAllIcons
                    ? `Showing all ${iconSearchResults.length} results from the full Simple Icons catalog`
                    : `Showing ${iconSearchResults.length} dev-relevant icons`}
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchAllIcons((v) => !v); setIconQuery(""); }}
                  className={`text-[11px] font-semibold transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                    searchAllIcons
                      ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {searchAllIcons ? (
                    <><BookmarkCheck size={11} /> Dev icons only</>
                  ) : (
                    <><Layers size={11} /> Search all icons</>
                  )}
                </button>
              </div>

              {/* Results grid */}
              <div className="flex-1 overflow-y-auto p-5 pt-2">
                {isSearchingIcons ? (
                  <div className="flex items-center justify-center h-full text-[#9ca3af]">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                ) : iconSearchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <span className="text-3xl">🔍</span>
                    <p className="text-sm font-semibold text-[#374151]">No matching icons</p>
                    {!searchAllIcons && (
                      <button
                        type="button"
                        onClick={() => { setSearchAllIcons(true); }}
                        className="text-xs text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-800"
                      >
                        Try searching all 3,000+ icons instead
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {iconSearchResults.map((icon) => {
                      const isSelected = selectedIconKey === icon.key;
                      const brandColor = getBrandColor(icon.name);
                      return (
                        <button key={icon.key} type="button" onClick={() => selectIconInPicker(icon)} className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group border ${isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20" : "border-[rgba(0,0,0,0.06)] hover:border-blue-300 hover:bg-slate-50"}`}>
                          <div style={{ color: brandColor }} className="transition-transform group-hover:scale-110">
                            {renderIconByKey(icon.key, "w-7 h-7")}
                          </div>
                          <span className="text-[10px] font-semibold text-[#374151] line-clamp-1 w-full leading-tight">{icon.name}</span>
                          {isSelected && <div className="w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center mt-0.5"><Check size={10} /></div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
