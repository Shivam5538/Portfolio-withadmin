"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, X, Loader2, Sparkles, Search, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FormError } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { renderIconByKey, getBrandColor } from "@/lib/icons";

interface Technology {
  id: string;
  name: string;
  category: string;
  iconKey: string;
}

const schema = z.object({
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  order: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  techTags: string[];
  technologies?: Technology[];
  order: number;
}

export default function AdminExperienceClient() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [masterTechnologies, setMasterTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form modal state for technologies selection & current role
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [techSearchQuery, setTechSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, techRes] = await Promise.all([
        fetch("/api/experience").then((r) => r.json()),
        fetch("/api/technologies").then((r) => r.json()),
      ]);

      setExperience(Array.isArray(expRes) ? expRes : []);
      setMasterTechnologies(Array.isArray(techRes) ? techRes : []);
    } catch (err) {
      console.error("Failed to load experience or technology data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toDateInput = (d?: string | null) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const openCreate = () => {
    setEditing(null);
    setSelectedTechIds([]);
    setIsCurrentlyWorking(false);
    setTechSearchQuery("");
    reset({ role: "", company: "", startDate: "", endDate: "", description: "", order: 0 });
    setShowModal(true);
  };

  const openEdit = (exp: Experience) => {
    setEditing(exp);
    setIsCurrentlyWorking(!exp.endDate);
    setTechSearchQuery("");

    // Extract selected tech IDs (either from exp.technologies or exp.techTags)
    if (exp.technologies && exp.technologies.length > 0) {
      setSelectedTechIds(exp.technologies.map((t) => t.id));
    } else if (Array.isArray(exp.techTags)) {
      const masterIds = new Set(masterTechnologies.map((t) => t.id));
      const masterNames = new Map(masterTechnologies.map((t) => [t.name.toLowerCase().trim(), t.id]));
      const ids: string[] = [];

      exp.techTags.forEach((tag) => {
        if (masterIds.has(tag)) ids.push(tag);
        else if (masterNames.has(tag.toLowerCase().trim())) ids.push(masterNames.get(tag.toLowerCase().trim())!);
      });
      setSelectedTechIds(ids);
    } else {
      setSelectedTechIds([]);
    }

    reset({
      role: exp.role,
      company: exp.company,
      startDate: toDateInput(exp.startDate),
      endDate: toDateInput(exp.endDate),
      description: exp.description,
      order: exp.order || 0,
    });
    setShowModal(true);
  };

  const toggleTechSelection = (techId: string) => {
    if (selectedTechIds.includes(techId)) {
      setSelectedTechIds((prev) => prev.filter((id) => id !== techId));
    } else {
      setSelectedTechIds((prev) => [...prev, techId]);
    }
  };

  const removeSelectedTech = (techId: string) => {
    setSelectedTechIds((prev) => prev.filter((id) => id !== techId));
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: isCurrentlyWorking || !data.endDate ? null : new Date(data.endDate).toISOString(),
      techTags: selectedTechIds,
    };

    try {
      if (editing) {
        await fetch(`/api/experience/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save experience:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience entry?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/experience/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Failed to delete experience:", err);
    } finally {
      setDeleting(null);
    }
  };

  const masterTechMap = new Map(masterTechnologies.map((t) => [t.id, t]));
  const selectedTechObjects = selectedTechIds
    .map((id) => masterTechMap.get(id))
    .filter((t): t is Technology => Boolean(t));

  const filteredMasterPool = masterTechnologies.filter(
    (t) =>
      t.name.toLowerCase().includes(techSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(techSearchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Experience</h1>
          <p className="text-[#9ca3af] text-sm mt-1">{experience.length} positions</p>
        </div>
        <Button onClick={openCreate} id="admin-add-exp-btn">
          <Plus size={16} /> Add Experience
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
          </div>
        ) : experience.length === 0 ? (
          <div className="py-16 text-center text-[#9ca3af] text-sm">
            No experience entries yet. Add your first role.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#f9f9fb]">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Role & Company
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hidden sm:table-cell">
                  Duration
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hidden md:table-cell">
                  Tech Stack
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {experience.map((exp, idx) => {
                const isCurrent = !exp.endDate;
                const techList = exp.technologies && exp.technologies.length > 0 ? exp.technologies : [];

                return (
                  <tr
                    key={exp.id}
                    className={`border-b border-[rgba(0,0,0,0.04)] hover:bg-[#f9f9fb] transition-colors ${
                      idx === experience.length - 1 ? "border-0" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#111111] text-sm">{exp.role}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9ca3af] mt-0.5">{exp.company}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#6b7280] hidden sm:table-cell">
                      {formatDate(exp.startDate)} —{" "}
                      {exp.endDate ? (
                        formatDate(exp.endDate)
                      ) : (
                        <span className="text-green-600 font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Present
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {techList.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700"
                          >
                            <span style={{ color: getBrandColor(t.name) }}>
                              {renderIconByKey(t.iconKey, "w-3 h-3")}
                            </span>
                            {t.name}
                          </span>
                        ))}
                        {techList.length > 3 && (
                          <span className="text-xs text-slate-400 font-medium">+{techList.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(exp)}
                          className="p-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.05)] text-[#6b7280] hover:text-[#111111] transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          disabled={deleting === exp.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#6b7280] hover:text-red-500 transition-colors"
                          aria-label="Delete"
                        >
                          {deleting === exp.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-[rgba(0,0,0,0.07)]">
                <h2 className="text-lg font-bold text-[#111111]">
                  {editing ? "Edit Work Experience" : "New Work Experience"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-[rgba(0,0,0,0.05)] text-[#6b7280]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exp-role">Role / Job Title *</Label>
                    <Input id="exp-role" placeholder="Senior Full-Stack Engineer" {...register("role")} />
                    <FormError message={errors.role?.message} />
                  </div>
                  <div>
                    <Label htmlFor="exp-company">Company Name *</Label>
                    <Input id="exp-company" placeholder="Acme Inc." {...register("company")} />
                    <FormError message={errors.company?.message} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exp-start">Start Date *</Label>
                    <Input id="exp-start" type="date" {...register("startDate")} />
                    <FormError message={errors.startDate?.message} />
                  </div>
                  <div>
                    <Label htmlFor="exp-end">End Date</Label>
                    <Input
                      id="exp-end"
                      type="date"
                      disabled={isCurrentlyWorking}
                      {...register("endDate")}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="exp-is-current"
                        checked={isCurrentlyWorking}
                        onChange={(e) => setIsCurrentlyWorking(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                      <label
                        htmlFor="exp-is-current"
                        className="text-xs font-semibold text-gray-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        I currently work in this role (Present)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="exp-desc">Description & Achievements *</Label>
                  <Textarea
                    id="exp-desc"
                    rows={4}
                    placeholder="Describe your role, accomplishments, technologies utilized, and team leadership..."
                    {...register("description")}
                  />
                  <FormError message={errors.description?.message} />
                </div>

                {/* Unified Master Technology Selector */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-bold text-gray-800">
                        Tech Stack Used{" "}
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Master Technology Pool
                        </span>
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select technologies from your master Skills pool to show on this experience entry.
                      </p>
                    </div>
                    <Link
                      href="/admin/skills"
                      target="_blank"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Sparkles size={12} /> Manage Skills <ExternalLink size={10} />
                    </Link>
                  </div>

                  {/* Selected Tech Tags */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Selected Tech Stack ({selectedTechObjects.length})
                    </h4>
                    {selectedTechObjects.length === 0 ? (
                      <div className="text-xs text-gray-400 italic">No technologies selected yet.</div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTechObjects.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-800 shadow-xs"
                          >
                            <span style={{ color: getBrandColor(t.name) }}>
                              {renderIconByKey(t.iconKey, "w-3.5 h-3.5")}
                            </span>
                            {t.name}
                            <button
                              type="button"
                              onClick={() => removeSelectedTech(t.id)}
                              className="text-gray-400 hover:text-red-500 ml-0.5 font-bold"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Master Pool Selector Grid */}
                  <div className="pt-2 border-t border-gray-200/60">
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={techSearchQuery}
                        onChange={(e) => setTechSearchQuery(e.target.value)}
                        placeholder="Search master technologies..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {filteredMasterPool.map((tech) => {
                        const isSelected = selectedTechIds.includes(tech.id);
                        const brandColor = getBrandColor(tech.name);

                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => toggleTechSelection(tech.id)}
                            className={`p-2 rounded-xl border transition-all text-left flex items-center justify-between group ${
                              isSelected
                                ? "border-blue-500 bg-blue-50/80 ring-1 ring-blue-500/20"
                                : "border-gray-200 bg-white hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center border border-white shrink-0"
                                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                              >
                                {renderIconByKey(tech.iconKey, "w-3 h-3")}
                              </div>
                              <span className="text-xs font-semibold text-gray-800 truncate">
                                {tech.name}
                              </span>
                            </div>
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-gray-300 group-hover:border-blue-400 bg-white"
                              }`}
                            >
                              {isSelected && <Check size={10} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="exp-order">Display Order Sequence</Label>
                  <Input id="exp-order" type="number" placeholder="0" {...register("order")} />
                  <p className="text-[11px] text-gray-400 mt-1">Lower numbers appear higher on the timeline.</p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving...
                      </>
                    ) : editing ? (
                      "Save Changes"
                    ) : (
                      "Create Experience"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
