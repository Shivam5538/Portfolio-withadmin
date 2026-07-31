"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Plus,
  Trash,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Check,
  User,
  MapPin,
  FileText,
  Layout,
  Tag,
  Save,
  Download,
  ExternalLink,
  Award,
  Globe,
  Code,
  Terminal,
  Zap,
  Coffee,
  Heart,
  Shield,
  Layers,
  Cpu,
  Type,
  AlignLeft,
  Quote,
  ListFilter,
  MousePointerClick,
} from "lucide-react";
import Link from "next/link";
import { renderIconByKey } from "@/lib/icons";
import MediaSelectInput from "@/components/admin/MediaSelectInput";

interface FactItem {
  id?: string;
  label: string;
  value: string;
  iconKey: string;
  accentColor: "blue" | "purple" | "coral" | "emerald";
}

const COMMON_FACT_ICONS = [
  { key: "MapPin", label: "Location" },
  { key: "Sparkles", label: "Focus / Sparkles" },
  { key: "Award", label: "Award / Specialty" },
  { key: "CheckCircle", label: "Availability" },
  { key: "Code", label: "Code" },
  { key: "Terminal", label: "Terminal / Open Source" },
  { key: "Globe", label: "Globe / Web" },
  { key: "Layers", label: "Layers" },
  { key: "Cpu", label: "CPU / Tech" },
  { key: "Zap", label: "Zap / Speed" },
  { key: "Coffee", label: "Coffee" },
  { key: "Heart", label: "Heart" },
];

export default function AdminAboutClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [facts, setFacts] = useState<FactItem[]>([]);
  const [roleTags, setRoleTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Two-Way Interactive Field-to-Preview Highlighting state
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      // Parse role tags
      try {
        const parsedRoles = JSON.parse(initialData.aboutRoleTags || "[]");
        if (Array.isArray(parsedRoles) && parsedRoles.length > 0) {
          setRoleTags(parsedRoles);
        } else {
          setRoleTags(["Full-Stack Developer", "UI/UX Engineer"]);
        }
      } catch {
        setRoleTags(["Full-Stack Developer", "UI/UX Engineer"]);
      }

      // Parse facts repeater
      try {
        const parsedFacts = JSON.parse(initialData.aboutFacts || "[]");
        if (Array.isArray(parsedFacts) && parsedFacts.length > 0) {
          setFacts(parsedFacts);
        } else {
          // Seed default 4 fact cards if facts array is empty
          setFacts([
            {
              id: "1",
              label: "Location",
              value: initialData.aboutLocation || "Pune, India",
              iconKey: "MapPin",
              accentColor: "blue",
            },
            {
              id: "2",
              label: "Focus",
              value: initialData.aboutFocus || "Full-Stack Apps",
              iconKey: "Sparkles",
              accentColor: "purple",
            },
            {
              id: "3",
              label: "Experience",
              value: initialData.aboutExperience || "5+ Years",
              iconKey: "Award",
              accentColor: "coral",
            },
            {
              id: "4",
              label: "Open Source",
              value: initialData.aboutStat || "100+ Contributions",
              iconKey: "Terminal",
              accentColor: "emerald",
            },
          ]);
        }
      } catch {
        setFacts([]);
      }
    }
    setIsLoading(false);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Facts Repeater logic
  const handleFactChange = (index: number, field: keyof FactItem, value: any) => {
    const updated = [...facts];
    updated[index] = { ...updated[index], [field]: value };
    setFacts(updated);
  };

  const addFact = () => {
    setFacts((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        label: "",
        value: "",
        iconKey: "Sparkles",
        accentColor: "blue",
      },
    ]);
  };

  const removeFact = (index: number) => {
    setFacts((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFact = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === facts.length - 1)
    ) {
      return;
    }
    const updated = [...facts];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFacts(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const headline =
      formData.aboutHeadline ||
      (formData.aboutHeadlineLine1 && formData.aboutHeadlineLine2
        ? `${formData.aboutHeadlineLine1} ${formData.aboutHeadlineLine2}`
        : "Building interfaces for the agent-first era — still by hand.");

    const payload = {
      ...formData,
      aboutHeadline: headline,
      aboutHeadlineLine1: headline,
      aboutHeadlineLine2: "",
      aboutRoleTags: JSON.stringify(roleTags),
      aboutFacts: JSON.stringify(
        facts.filter((f) => f.label.trim() && f.value.trim())
      ),
    };

    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errText =
          errorData.error || errorData.details || "Failed to save about content";
        setMessage({ type: "error", text: errText });
        return;
      }

      setMessage({
        type: "success",
        text: "About Me section saved successfully! Changes are live.",
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!formData)
    return <div className="p-8 text-gray-500">Failed to load about content.</div>;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Sticky Header & Navigation Anchors */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="text-purple-600" size={22} /> About Me Section Editor
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize background initials, headline, bio pull-quote, inline facts, avatar byline, and CTAs
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
              onClick={handleSave}
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
                  <Save className="mr-1.5" size={14} /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Section Jump Links Strip (Exact Reading Order) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Jump to:
          </span>
          {[
            { id: "sec-initials", label: "1. Initials", icon: Type },
            { id: "sec-eyebrow", label: "2. Eyebrow", icon: AlignLeft },
            { id: "sec-headline", label: "3. Headline", icon: Layout },
            { id: "sec-bio", label: "4. Bio Quote", icon: Quote },
            { id: "sec-facts", label: "5. Inline Facts", icon: ListFilter },
            { id: "sec-avatar", label: "6. Avatar", icon: User },
            { id: "sec-ctas", label: "7. CTAs", icon: MousePointerClick },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-purple-50 hover:text-purple-700 text-gray-700 font-medium text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
              >
                <Icon size={12} /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form (7 cols), Sticky Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (Organized in exact visual reading order) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section 1: Background Numeral & Initials */}
          <div
            id="sec-initials"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Type size={18} className="text-purple-500" /> 1. Background Initials & Numeral
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enormous decorative background typography (e.g. SZ or 01) bleeding off-center behind the section
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Display Name (Generates Background Initials e.g. SZ)
              </label>
              <input
                type="text"
                name="heroName"
                value={formData.heroName || ""}
                onChange={handleChange}
                onFocus={() => setActiveField("initials")}
                onBlur={() => setActiveField(null)}
                placeholder="Shivam Zaware"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Eyebrow & Status Pill */}
          <div
            id="sec-eyebrow"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <AlignLeft size={18} className="text-blue-500" /> 2. Eyebrow & Availability Status Pill
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Top-left section label and single canonical work availability status pill
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Eyebrow Label Text
                </label>
                <input
                  type="text"
                  name="aboutEyebrow"
                  value={formData.aboutEyebrow || ""}
                  onChange={handleChange}
                  onFocus={() => setActiveField("eyebrow")}
                  onBlur={() => setActiveField(null)}
                  placeholder="ABOUT ME"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Availability Status Pill Text
                </label>
                <input
                  type="text"
                  name="availabilityStatus"
                  value={formData.availabilityStatus || ""}
                  onChange={handleChange}
                  onFocus={() => setActiveField("eyebrow")}
                  onBlur={() => setActiveField(null)}
                  placeholder="Available for work"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Headline */}
          <div
            id="sec-headline"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Layout size={18} className="text-indigo-500" /> 3. Headline (Typewriter Gradient Reveal)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Primary flowing sentence rendered with gradient text-clip typewriter reveal
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Headline Sentence
              </label>
              <input
                type="text"
                name="aboutHeadline"
                value={
                  formData.aboutHeadline ||
                  (formData.aboutHeadlineLine1 && formData.aboutHeadlineLine2
                    ? `${formData.aboutHeadlineLine1} ${formData.aboutHeadlineLine2}`
                    : "")
                }
                onChange={handleChange}
                onFocus={() => setActiveField("headline")}
                onBlur={() => setActiveField(null)}
                placeholder="Building interfaces for the agent-first era — still by hand."
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />

              {/* Inline Micro-Preview */}
              <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/60">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Inline Live Micro-Preview:
                </span>
                <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  {formData.aboutHeadline || "Building interfaces for the agent-first era..."}
                  <span className="inline-block w-1 h-3 bg-blue-500 ml-1 animate-pulse" />
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Pull-Quote Bio Narrative */}
          <div
            id="sec-bio"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Quote size={18} className="text-orange-500" /> 4. Pull-Quote Bio Narrative
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Featured personal statement rendered as a large pull-quote with vertical accent gradient rule
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Bio Statement
              </label>
              <textarea
                name="aboutBio"
                value={formData.aboutBio || ""}
                onChange={handleChange}
                onFocus={() => setActiveField("bio")}
                onBlur={() => setActiveField(null)}
                rows={4}
                placeholder="I'm a passionate full-stack developer crafting clean, performant, and intuitive digital interfaces for modern web applications."
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />

              {/* Inline Micro-Preview */}
              <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/60 flex items-stretch gap-2.5">
                <div className="w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 rounded-full shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                    Pull-Quote Micro-Preview:
                  </span>
                  <p className="text-xs text-gray-800 italic font-light leading-relaxed">
                    "{formData.aboutBio || "Passionate full-stack developer narrative..."}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Inline Facts List Repeater */}
          <div
            id="sec-facts"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <ListFilter size={18} className="text-emerald-500" /> 5. Inline Facts List Items
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Shown as an inline horizontal divided list below your bio — e.g. location, focus, experience
                </p>
              </div>
              <Button type="button" onClick={addFact} variant="secondary" size="sm" className="rounded-xl text-xs">
                <Plus size={13} className="mr-1" /> Add Fact Item
              </Button>
            </div>

            <div className="space-y-4 pt-2">
              {facts.map((fact, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-3 relative group"
                  onFocus={() => setActiveField("facts")}
                  onBlur={() => setActiveField(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Fact #{index + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFact(index, "up")}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFact(index, "down")}
                        disabled={index === facts.length - 1}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFact(index)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded ml-1"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                        Label (e.g. Location)
                      </label>
                      <input
                        type="text"
                        value={fact.label}
                        onChange={(e) => handleFactChange(index, "label", e.target.value)}
                        placeholder="Location / Focus / Experience"
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                        Value (e.g. Pune, India)
                      </label>
                      <input
                        type="text"
                        value={fact.value}
                        onChange={(e) => handleFactChange(index, "value", e.target.value)}
                        placeholder="Pune, India"
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Avatar Photo & Author Byline */}
          <div
            id="sec-avatar"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <User size={18} className="text-purple-500" /> 6. Avatar Photo & Author Byline
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Understated circular author photo and role title badge (magazine byline style)
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Author Avatar Photo
                </label>
                <MediaSelectInput
                  value={formData.aboutAvatarUrl || ""}
                  onChange={(url) => setFormData((prev: any) => ({ ...prev, aboutAvatarUrl: url }))}
                  placeholder="Select or upload custom avatar image"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Role Title Badge
                  </label>
                  <input
                    type="text"
                    name="aboutAvatarBadge"
                    value={formData.aboutAvatarBadge || ""}
                    onChange={handleChange}
                    onFocus={() => setActiveField("avatar")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Full-Stack Developer"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Location (City, Country)
                  </label>
                  <input
                    type="text"
                    name="aboutLocation"
                    value={formData.aboutLocation || ""}
                    onChange={handleChange}
                    onFocus={() => setActiveField("avatar")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Pune, India"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Call-To-Action Buttons */}
          <div
            id="sec-ctas"
            className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-4 scroll-mt-36"
          >
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <MousePointerClick size={18} className="text-teal-500" /> 7. Call-To-Action (CTA) Buttons
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Primary and secondary magnetic CTA buttons
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Primary CTA Button Label
                  </label>
                  <input
                    type="text"
                    name="aboutPrimaryCtaLabel"
                    value={formData.aboutPrimaryCtaLabel || ""}
                    onChange={handleChange}
                    onFocus={() => setActiveField("ctas")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Download résumé"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Secondary CTA Button Label
                  </label>
                  <input
                    type="text"
                    name="aboutSecondaryCtaLabel"
                    value={formData.aboutSecondaryCtaLabel || ""}
                    onChange={handleChange}
                    onFocus={() => setActiveField("ctas")}
                    onBlur={() => setActiveField(null)}
                    placeholder="View projects"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Secondary CTA Link URL / Anchor
                </label>
                <input
                  type="text"
                  name="aboutSecondaryCtaLink"
                  value={formData.aboutSecondaryCtaLink || ""}
                  onChange={handleChange}
                  onFocus={() => setActiveField("ctas")}
                  onBlur={() => setActiveField(null)}
                  placeholder="#projects"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Resume Document PDF URL
                </label>
                <MediaSelectInput
                  value={formData.resumeUrl || ""}
                  onChange={(url) => setFormData((prev: any) => ({ ...prev, resumeUrl: url }))}
                  placeholder="https://supabase.co/storage/v1/object/public/uploads/resume.pdf"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Right Column — Sticky Live Preview Panel with Two-Way Field Highlighting */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-500" /> Live Preview
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Real-time Sync
              </span>
            </div>

            {/* Editorial Magazine Live Preview Card */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/90 border border-gray-200/90 text-left shadow-md space-y-3.5 overflow-hidden transition-all duration-200">
              {/* Background Initials Typography Anchor */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none text-[90px] font-black tracking-tighter transition-all duration-300 ${
                  activeField === "initials"
                    ? "opacity-30 text-purple-600 scale-110"
                    : "opacity-[0.07] text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-orange-500"
                }`}
              >
                {(formData.heroName || "Shivam Zaware")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>

              {/* Eyebrow & Status Pill Preview */}
              <div
                className={`flex items-center justify-between text-[9px] font-bold tracking-wider uppercase transition-all duration-200 rounded p-1 ${
                  activeField === "eyebrow"
                    ? "ring-2 ring-purple-500 bg-purple-100/70"
                    : ""
                }`}
              >
                <span className="text-purple-600">— {formData.aboutEyebrow || "ABOUT ME"}</span>
                <span className="text-emerald-600">● {formData.availabilityStatus || "Available for work"}</span>
              </div>

              {/* Headline Preview */}
              <div
                className={`transition-all duration-200 rounded p-1 ${
                  activeField === "headline"
                    ? "ring-2 ring-purple-500 bg-purple-100/70"
                    : ""
                }`}
              >
                <h3 className="text-xs font-semibold text-gray-900 leading-snug max-w-[90%]">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                    {formData.aboutHeadline ||
                      (formData.aboutHeadlineLine1 && formData.aboutHeadlineLine2
                        ? `${formData.aboutHeadlineLine1} ${formData.aboutHeadlineLine2}`
                        : "Building interfaces for the agent-first era — still by hand.")}
                  </span>
                </h3>
              </div>

              {/* Pull-Quote Bio Preview */}
              <div
                className={`flex items-stretch gap-2 transition-all duration-200 rounded p-1.5 ${
                  activeField === "bio"
                    ? "ring-2 ring-purple-500 bg-purple-100/70"
                    : ""
                }`}
              >
                <div className="w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 rounded-full shrink-0" />
                <p className="text-[11px] text-gray-700 italic font-light leading-relaxed line-clamp-3">
                  "{formData.aboutBio || "Full-stack developer narrative..."}"
                </p>
              </div>

              {/* Author Byline Preview */}
              <div
                className={`flex items-center gap-2 pt-1 border-t border-gray-200/60 transition-all duration-200 rounded p-1 ${
                  activeField === "avatar"
                    ? "ring-2 ring-purple-500 bg-purple-100/70"
                    : ""
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white overflow-hidden border border-gray-200 shrink-0">
                  {formData.aboutAvatarUrl ? (
                    <img src={formData.aboutAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} className="text-gray-400 m-auto mt-1" />
                  )}
                </div>
                <div className="text-[9px]">
                  <span className="font-semibold text-gray-900 block">{formData.heroName || "Shivam Zaware"}</span>
                  <span className="text-purple-600 font-medium block">{formData.aboutAvatarBadge || "Full-Stack Developer"}</span>
                </div>
              </div>

              {/* Inline Facts List Preview */}
              <div
                className={`text-[9px] text-gray-500 pt-1 flex flex-wrap items-center gap-1 border-t border-gray-200/60 transition-all duration-200 rounded p-1 ${
                  activeField === "facts"
                    ? "ring-2 ring-purple-500 bg-purple-100/70"
                    : ""
                }`}
              >
                {facts.slice(0, 3).map((f, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="font-bold text-gray-700">{f.value || f.label}</span>
                    {idx < facts.slice(0, 3).length - 1 && <span className="text-gray-300">|</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons Preview */}
            <div
              className={`flex items-center gap-2 pt-1 transition-all duration-200 rounded p-1 ${
                activeField === "ctas"
                  ? "ring-2 ring-purple-500 bg-purple-100/70"
                  : ""
              }`}
            >
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white font-semibold text-[9px] flex items-center gap-1">
                <Download size={10} /> {formData.aboutPrimaryCtaLabel || "Download résumé"}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-900 font-semibold text-[9px] flex items-center gap-1">
                {formData.aboutSecondaryCtaLabel || "View projects"} <ExternalLink size={9} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
