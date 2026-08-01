"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import {
  Loader2,
  Sparkles,
  User,
  Layout,
  MousePointer,
  Code2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Eye,
  FileText,
  Briefcase,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Search,
  Check,
  Cpu,
} from "lucide-react";
import MediaSelectInput from "@/components/admin/MediaSelectInput";
import { renderIconByKey, getBrandColor } from "@/lib/icons";

interface Technology {
  id: string;
  name: string;
  category: string;
  iconKey: string;
}

export default function AdminHeroClient({
  initialData,
  masterTechnologies = [],
}: {
  initialData: any;
  masterTechnologies: Technology[];
}) {
  const defaultSubtext = "Full-stack developer passionate about crafting clean, performant, and beautiful web applications. Turning complex problems into elegant solutions.";

  const [formData, setFormData] = useState<any>(() => {
    const data = {
      heroGreeting: "Hi, I'm",
      heroName: "Shivam Zaware",
      heroHeadlineLine1: "I build",
      heroHeadlineLine2: "digital experiences.",
      headlineSize: "md",
      heroSubtext: defaultSubtext,
      subtextSize: "md",
      availabilityStatus: "Available for new opportunities",
      isAvailable: true,
      primaryCtaLabel: "View My Work",
      primaryCtaLink: "#projects",
      secondaryCtaLabel: "Get in Touch",
      secondaryCtaLink: "#contact",
      heroResumeLabel: "Download CV",
      ...(initialData || {}),
    };
    if (!data.heroSubtext?.trim()) data.heroSubtext = defaultSubtext;
    if (!data.heroGreeting?.trim()) data.heroGreeting = "Hi, I'm";
    if (!data.heroName?.trim()) data.heroName = "Shivam Zaware";
    if (!data.heroHeadlineLine1?.trim()) data.heroHeadlineLine1 = "I build";
    if (!data.heroHeadlineLine2?.trim()) data.heroHeadlineLine2 = "digital experiences.";
    return data;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Tech stack marquee chip repeater state (4-6 items curated teaser)
  const [techTags, setTechTags] = useState<any[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  // Use the masterTechnologies passed as props
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Parse tech marquee JSON
    if (initialData?.heroTechMarquee) {
      try {
        const parsed =
          typeof initialData.heroTechMarquee === "string"
            ? JSON.parse(initialData.heroTechMarquee)
            : initialData.heroTechMarquee;
        if (Array.isArray(parsed)) setTechTags(parsed);
      } catch {
        setTechTags(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"]);
      }
    } else {
      setTechTags(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "GraphQL"]);
    }
  }, [initialData]);

  const moveTechTag = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= techTags.length) return;
    const updated = [...techTags];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTechTags(updated);
    setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
  };

  const toggleMasterTechSelection = (tech: Technology) => {
    const existsIndex = techTags.findIndex((t) => {
      if (typeof t === "object" && t !== null) return t.id === tech.id || t.name === tech.name;
      return t === tech.name;
    });

    let updated: any[];
    if (existsIndex >= 0) {
      updated = techTags.filter((_, i) => i !== existsIndex);
    } else {
      if (techTags.length >= 6) {
        setMessage({ type: "error", text: "Hero teaser is limited to a small 4–6 item subset." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        return;
      }
      updated = [...techTags, tech];
    }
    setTechTags(updated);
    setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev: any) => ({ ...prev, [e.target.name]: value }));
  };

  // Add new tech tag to marquee
  const handleAddTechTag = () => {
    if (!newTagInput.trim()) return;
    const updated = [...techTags, newTagInput.trim()];
    setTechTags(updated);
    setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
    setNewTagInput("");
  };

  // Remove tech tag from marquee
  const handleRemoveTechTag = (index: number) => {
    const updated = techTags.filter((_, i) => i !== index);
    setTechTags(updated);
    setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const payload = {
      ...formData,
      heroTechMarquee: JSON.stringify(techTags),
    };

    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errText = errorData.error || errorData.details || "Failed to save hero content";
        setMessage({ type: "error", text: errText });
        return;
      }

      setMessage({ type: "success", text: "Hero section saved successfully! Changes are now live on your portfolio." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (err: any) {
      console.error("Save error:", err);
      setMessage({ type: "error", text: err?.message || "An error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!formData) return <div className="p-8 text-gray-500">Failed to load hero section content.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Sticky Header with Title & Quick Save */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pb-4 pt-2 border-b border-gray-200 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hero Section Editor</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize your homepage headline, availability status, CTA buttons, and tech stack marquee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {message.text && (
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message.text}
            </span>
          )}
          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin mr-1.5" size={14} /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Main Split-Screen Layout: Form vs Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Organized Form Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Availability Status Badge */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b pb-3">
                <Sparkles size={18} className="text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">1. Availability Badge</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Status Badge Text:</label>
                  <Input
                    type="text"
                    name="availabilityStatus"
                    value={formData.availabilityStatus || ""}
                    onChange={handleChange}
                    placeholder="Available for new opportunities"
                    className="text-xs rounded-xl"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Displays as a glassy pill badge above your headline.</p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable ?? true}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isAvailable" className="text-xs font-semibold text-gray-700 cursor-pointer">
                    Enable Pulsing Green Dot (Signal Active Availability)
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Greeting & Personal Name */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b pb-3">
                <User size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">2. Greeting & Name</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Greeting Text:</label>
                  <Input
                    type="text"
                    name="heroGreeting"
                    value={formData.heroGreeting || ""}
                    onChange={handleChange}
                    placeholder="Hi, I'm"
                    className="text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Your Full Name:</label>
                  <Input
                    type="text"
                    name="heroName"
                    value={formData.heroName || ""}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Headline & Subtext */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b pb-3">
                <Layout size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900">3. Headline & Subtext</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Headline Line 1:</label>
                    <Input
                      type="text"
                      name="heroHeadlineLine1"
                      value={formData.heroHeadlineLine1 || ""}
                      onChange={handleChange}
                      placeholder="I build"
                      className="text-xs rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Headline Line 2 (Gradient):</label>
                    <Input
                      type="text"
                      name="heroHeadlineLine2"
                      value={formData.heroHeadlineLine2 || ""}
                      onChange={handleChange}
                      placeholder="digital experiences."
                      className="text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">Subtext Description:</label>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {(formData.heroSubtext || "").length} chars
                    </span>
                  </div>
                  <textarea
                    name="heroSubtext"
                    value={formData.heroSubtext || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Full-stack developer passionate about crafting clean, performant, and beautiful web applications..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 mb-4">Recommended: 120 - 180 characters for optimal readability.</p>
                </div>

                {/* Font Size Preset Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-200">
                  {/* Headline Size Control */}
                  <div>
                    <label className="text-xs font-bold text-gray-800 block mb-1 flex items-center justify-between">
                      <span>Headline Size:</span>
                      <span className="text-[10px] text-[#8B5CF6] font-mono uppercase font-extrabold">
                        {formData.headlineSize || "md"}
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-2xs">
                      {[
                        { key: "sm", label: "S" },
                        { key: "md", label: "M" },
                        { key: "lg", label: "L" },
                        { key: "xl", label: "XL" },
                      ].map((opt) => {
                        const active = (formData.headlineSize || "md") === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setFormData((prev: any) => ({ ...prev, headlineSize: opt.key }))}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              active
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subtext Size Control */}
                  <div>
                    <label className="text-xs font-bold text-gray-800 block mb-1 flex items-center justify-between">
                      <span>Subtext Size:</span>
                      <span className="text-[10px] text-[#8B5CF6] font-mono uppercase font-extrabold">
                        {formData.subtextSize || "md"}
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-2xs">
                      {[
                        { key: "sm", label: "S" },
                        { key: "md", label: "M" },
                        { key: "lg", label: "L" },
                      ].map((opt) => {
                        const active = (formData.subtextSize || "md") === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setFormData((prev: any) => ({ ...prev, subtextSize: opt.key }))}
                            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              active
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xs"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="sm:col-span-2 text-[11px] text-gray-500 font-light mt-1">
                    💡 <em>Adjust if longer text feels cramped, or shorter text feels too small. Uses responsive clamp() scaling.</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Call-to-Action Buttons & Resume */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b pb-3">
                <MousePointer size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">4. Call-to-Action Buttons & Resume</h3>
              </div>

              <div className="space-y-4">
                {/* Primary CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Primary CTA Label:</label>
                    <Input
                      type="text"
                      name="primaryCtaLabel"
                      value={formData.primaryCtaLabel || ""}
                      onChange={handleChange}
                      placeholder="View My Work"
                      className="text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Primary CTA Link:</label>
                    <Input
                      type="text"
                      name="primaryCtaLink"
                      value={formData.primaryCtaLink || ""}
                      onChange={handleChange}
                      placeholder="#projects"
                      className="text-xs rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Secondary CTA Label:</label>
                    <Input
                      type="text"
                      name="secondaryCtaLabel"
                      value={formData.secondaryCtaLabel || ""}
                      onChange={handleChange}
                      placeholder="Get in Touch"
                      className="text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Secondary CTA Link:</label>
                    <Input
                      type="text"
                      name="secondaryCtaLink"
                      value={formData.secondaryCtaLink || ""}
                      onChange={handleChange}
                      placeholder="#contact"
                      className="text-xs rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Resume Picker */}
                <div className="pt-2 border-t">
                  <MediaSelectInput
                    label="Attached Resume PDF Document"
                    value={formData.resumeUrl || ""}
                    onChange={(url) => setFormData((prev: any) => ({ ...prev, resumeUrl: url }))}
                    category="Resume"
                    accept=".pdf,application/pdf"
                    placeholder="/uploads/resume.pdf"
                  />
                </div>
              </div>
            </div>            {/* Section 5: Curated Tech Teaser List (4-6 Items Max) */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <Cpu size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">5. Hero Curated Tech Teaser</h3>
                </div>
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  techTags.length >= 4 && techTags.length <= 6
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {techTags.length}/6 items (4–6 recommended)
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Select 4–6 key technologies to serve as a quick visual flourish in the Hero banner. The full technology stack is showcased in detail in the Skills section.
              </p>

              {/* Selected Teaser Items */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Selected Hero Teaser Items (Ordered):</label>
                {techTags.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 border border-dashed border-gray-200">
                    No teaser technologies selected yet. Pick from the pool below or add a custom item.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {techTags.map((tech, idx) => {
                      const name = typeof tech === "string" ? tech : tech.name || "";
                      const iconKey = typeof tech === "object" ? tech.iconKey : null;
                      const brandColor = getBrandColor(name || iconKey || "");

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl text-xs shadow-2xs group hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[10px] text-gray-400 w-4">{idx + 1}.</span>
                            <span style={{ color: brandColor }}>
                              {renderIconByKey(iconKey || name, "w-4 h-4")}
                            </span>
                            <span className="font-semibold text-gray-800">{name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveTechTag(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-md"
                              title="Move up"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTechTag(idx, "down")}
                              disabled={idx === techTags.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-md"
                              title="Move down"
                            >
                              <ChevronDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = techTags.filter((_, i) => i !== idx);
                                setTechTags(updated);
                                setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md ml-1"
                              title="Remove item"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Pick from Master Pool */}
              {masterTechnologies.length > 0 && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">Pick from Master Technology Pool:</label>
                    <div className="relative w-44">
                      <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search pool..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-[11px] pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                    {masterTechnologies
                      .filter(
                        (t) =>
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((tech) => {
                        const isSelected = techTags.some((t) =>
                          typeof t === "object" && t !== null ? t.id === tech.id || t.name === tech.name : t === tech.name
                        );
                        const brandColor = getBrandColor(tech.name || tech.iconKey);

                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => toggleMasterTechSelection(tech)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span style={{ color: isSelected ? "#ffffff" : brandColor }}>
                              {renderIconByKey(tech.iconKey || tech.name, "w-3.5 h-3.5")}
                            </span>
                            <span>{tech.name}</span>
                            {isSelected && <Check size={12} className="ml-0.5" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Add Custom Tag Controls */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Input
                  type="text"
                  placeholder="Or add custom technology (e.g. Docker, GraphQL)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!newTagInput.trim()) return;
                      if (techTags.length >= 6) {
                        setMessage({ type: "error", text: "Hero teaser is limited to a small 4–6 item subset." });
                        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                        return;
                      }
                      const updated = [...techTags, newTagInput.trim()];
                      setTechTags(updated);
                      setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
                      setNewTagInput("");
                    }
                  }}
                  className="text-xs rounded-xl flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (!newTagInput.trim()) return;
                    if (techTags.length >= 6) {
                      setMessage({ type: "error", text: "Hero teaser is limited to a small 4–6 item subset." });
                      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
                      return;
                    }
                    const updated = [...techTags, newTagInput.trim()];
                    setTechTags(updated);
                    setFormData((prev: any) => ({ ...prev, heroTechMarquee: JSON.stringify(updated) }));
                    setNewTagInput("");
                  }}
                  className="text-xs rounded-xl px-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Live Preview Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Eye size={14} className="text-blue-500" /> Live Hero Preview
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Real-time Sync
              </span>
            </div>

            {/* Live Rendered Mini Card */}
            <div className="bg-[#fafafa] rounded-3xl border border-gray-200 p-6 shadow-md relative overflow-hidden space-y-5">
              {/* Background gradient blob mockup */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Availability Badge */}
              <div className="inline-flex">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/80 text-[11px] font-semibold text-gray-700 shadow-2xs">
                  {formData.isAvailable && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                  {formData.availabilityStatus || "Available for work"}
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {formData.heroGreeting || "Hi, I'm"} {formData.heroName || "Alex Morgan"}
                </span>
                <h2
                  className={`font-black text-gray-900 leading-tight transition-all ${
                    (formData.headlineSize || "md") === "sm"
                      ? "text-lg sm:text-xl"
                      : (formData.headlineSize || "md") === "lg"
                      ? "text-2xl sm:text-3xl"
                      : (formData.headlineSize || "md") === "xl"
                      ? "text-3xl sm:text-4xl"
                      : "text-xl sm:text-2xl"
                  }`}
                >
                  {formData.heroHeadlineLine1 || "I build"}{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
                    {formData.heroHeadlineLine2 || "digital experiences."}
                  </span>
                </h2>
              </div>

              {/* Subtext */}
              <p
                className={`text-gray-500 leading-relaxed font-light line-clamp-3 transition-all ${
                  (formData.subtextSize || "md") === "sm"
                    ? "text-[11px]"
                    : (formData.subtextSize || "md") === "lg"
                    ? "text-sm sm:text-base"
                    : "text-xs sm:text-sm"
                }`}
              >
                {formData.heroSubtext || "Full-stack developer passionate about crafting clean applications."}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5">
                  <Briefcase size={12} />
                  <span>{formData.primaryCtaLabel || "View My Work"}</span>
                </div>
                <div className="px-3.5 py-1.5 bg-white text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-500" />
                  <span>{formData.secondaryCtaLabel || "Get in Touch"}</span>
                </div>
              </div>

              {/* Tech Marquee Chips Mockup */}
              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Hero Curated Tech Teaser (4–6 items)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {techTags.slice(0, 6).map((techItem, i) => {
                    const name = typeof techItem === "string" ? techItem : techItem.name || "";
                    const iconKey = typeof techItem === "object" ? techItem.iconKey : null;
                    const brandColor = getBrandColor(name || iconKey || "");

                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white text-gray-700 border border-gray-200 rounded-lg text-[11px] font-medium shadow-2xs"
                      >
                        <span style={{ color: brandColor }}>
                          {renderIconByKey(iconKey || name, "w-3.5 h-3.5")}
                        </span>
                        <span>{name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
