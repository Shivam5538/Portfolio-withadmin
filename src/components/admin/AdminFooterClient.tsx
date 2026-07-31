"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Save,
  Check,
  X,
  Globe,
  ArrowUp,
  Sparkles,
  Shield,
  Calendar,
  Compass,
  Plus,
  Trash,
} from "lucide-react";

export default function AdminFooterClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [navLinks, setNavLinks] = useState<{ label: string; href: string }[]>([]);
  const [newNavLabel, setNewNavLabel] = useState("");
  const [newNavHref, setNewNavHref] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (initialData) {
      // Parse nav links
      try {
        const parsed = typeof initialData.footerNavLinks === "string" ? JSON.parse(initialData.footerNavLinks) : initialData.footerNavLinks;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((item: any) => {
            if (typeof item === "string") {
              const clean = item.trim();
              return { label: clean, href: clean.toLowerCase().startsWith("#") ? clean.toLowerCase() : `#${clean.toLowerCase()}` };
            }
            return { label: item.label || "", href: item.href || "#" };
          });
          setNavLinks(formatted);
        } else {
          setNavLinks([
            { label: "About", href: "#about" },
            { label: "Projects", href: "#projects" },
            { label: "Experience", href: "#experience" },
            { label: "Contact", href: "#contact" },
          ]);
        }
      } catch {
        setNavLinks([
          { label: "About", href: "#about" },
          { label: "Projects", href: "#projects" },
          { label: "Experience", href: "#experience" },
          { label: "Contact", href: "#contact" },
        ]);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addNavLink = () => {
    if (!newNavLabel.trim()) return;
    const href = newNavHref.trim() || `#${newNavLabel.trim().toLowerCase()}`;
    setNavLinks((prev) => [...prev, { label: newNavLabel.trim(), href }]);
    setNewNavLabel("");
    setNewNavHref("");
  };

  const removeNavLink = (index: number) => {
    setNavLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const payload = {
      ...formData,
      footerNavLinks: JSON.stringify(navLinks),
    };

    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errText = errorData.error || errorData.details || "Failed to save footer content";
        setMessage({ type: "error", text: errText });
        return;
      }

      setMessage({ type: "success", text: "Footer content saved successfully! Changes are live." });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "An unexpected error occurred while saving." });
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

  if (!formData) return <div className="p-8 text-gray-500">Failed to load footer content.</div>;

  // Calculate live preview copyright year range
  const currentYear = new Date().getFullYear();
  let previewYear = String(currentYear);
  if (formData.footerLaunchYear) {
    const yr = parseInt(String(formData.footerLaunchYear).trim(), 10);
    if (!isNaN(yr) && yr > 1990 && yr < currentYear) {
      previewYear = `${yr} – ${currentYear}`;
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Sticky Save Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="text-blue-600" size={22} /> Footer Section Editor
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize copyright text, site launch year, navigation links, and back-to-top button
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
            className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-xs"
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

      {/* Main Grid: Left Form (7 cols), Right Sticky Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section 1: Copyright, Year & Branding */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Shield size={18} className="text-blue-500" />
              <h2 className="text-base font-bold text-gray-800">1. Copyright & Year Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Copyright Owner Name
                </label>
                <input
                  type="text"
                  name="footerText"
                  value={formData.footerText || ""}
                  onChange={handleChange}
                  placeholder="Alex Morgan"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Rights Reserved Suffix Text
                </label>
                <input
                  type="text"
                  name="footerCopyright"
                  value={formData.footerCopyright || ""}
                  onChange={handleChange}
                  placeholder="All rights reserved."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-purple-500" /> Site Launch Year (Optional Range Start)
                </label>
                <input
                  type="text"
                  name="footerLaunchYear"
                  value={formData.footerLaunchYear || ""}
                  onChange={handleChange}
                  placeholder="2024"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Current year ({currentYear}) is <strong>auto-computed dynamically</strong>. If launch year is set (e.g. 2024), displays as <strong>© 2024 – {currentYear}</strong>. If left empty, displays <strong>© {currentYear}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Navigation Links & Back to Top */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Compass size={18} className="text-emerald-500" />
              <h2 className="text-base font-bold text-gray-800">2. Navigation & Button Labels</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  "Back to Top" Button Label
                </label>
                <input
                  type="text"
                  name="footerBackToTop"
                  value={formData.footerBackToTop || ""}
                  onChange={handleChange}
                  placeholder="Back to top"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Nav Links Repeater */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
                  Footer Navigation Quick Links
                </label>

                <div className="space-y-2 mb-3">
                  {navLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 border border-gray-200 bg-gray-50/60 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{link.label}</span>
                        <span className="text-gray-400 font-mono text-[10px]">{link.href}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNavLink(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={newNavLabel}
                    onChange={(e) => setNewNavLabel(e.target.value)}
                    placeholder="Link Label (e.g. About)"
                    className="p-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newNavHref}
                    onChange={(e) => setNewNavHref(e.target.value)}
                    placeholder="Anchor/URL (e.g. #about)"
                    className="p-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <Button type="button" onClick={addNavLink} variant="secondary" size="sm" className="rounded-xl text-xs">
                  <Plus size={13} className="mr-1" /> Add Footer Link
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column — Sticky Live Preview Card */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-500" /> Live Footer Preview
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Clean Layout
              </span>
            </div>

            {/* Mini Footer Strip Preview */}
            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 text-left space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {/* Copyright */}
                <div className="text-gray-500 text-[11px] text-center sm:text-left">
                  © <strong className="text-gray-800 font-semibold">{previewYear}</strong>{" "}
                  <span className="text-gray-800 font-medium">{formData.footerText || "Alex Morgan"}</span>.{" "}
                  {formData.footerCopyright || "All rights reserved."}
                </div>

                {/* Nav Links */}
                {navLinks.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {navLinks.map((l, i) => (
                      <span key={i} className="text-[10px] font-medium text-gray-600">
                        {l.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Back to top */}
                <div className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0">
                  <ArrowUp size={12} />
                  <span>{formData.footerBackToTop || "Back to top"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
