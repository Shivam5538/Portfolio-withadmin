"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Save,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Layout,
  FileText,
  Clock,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Plus,
  Trash2,
  Share2,
  Globe,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";

export default function AdminContactClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [customLinks, setCustomLinks] = useState<Array<{ id: string; platform: string; url: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);

      // Parse custom social links if present
      if (initialData.socialLinks) {
        try {
          const parsed = typeof initialData.socialLinks === "string" ? JSON.parse(initialData.socialLinks) : initialData.socialLinks;
          if (Array.isArray(parsed)) {
            setCustomLinks(parsed.map((item: any, i: number) => ({
              id: item.id || `custom-${i}`,
              platform: item.platform || item.label || "",
              url: item.url || item.href || "",
            })));
          }
        } catch {}
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCustomLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, platform: "", url: "" },
    ]);
  };

  const handleCustomLinkChange = (id: string, field: "platform" | "url", value: string) => {
    setCustomLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCustomLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    const filteredCustomLinks = customLinks.filter((item) => item.platform.trim() !== "" && item.url.trim() !== "");
    const payload = {
      ...formData,
      socialLinks: JSON.stringify(filteredCustomLinks),
    };

    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errText = errorData.error || errorData.details || "Failed to save contact content";
        setMessage({ type: "error", text: errText });
        return;
      }

      setMessage({ type: "success", text: "Contact section content & social links saved successfully! Changes are live." });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "An unexpected error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSocialIcon = (platformName: string) => {
    const p = platformName.toLowerCase();
    if (p.includes("github")) return <Github size={14} />;
    if (p.includes("linkedin")) return <Linkedin size={14} />;
    if (p.includes("twitter") || p.includes("x")) return <Twitter size={14} />;
    if (p.includes("mail")) return <Mail size={14} />;
    if (p.includes("insta")) return <Instagram size={14} />;
    if (p.includes("youtube")) return <Youtube size={14} />;
    if (p.includes("discord") || p.includes("telegram")) return <MessageCircle size={14} />;
    return <Globe size={14} />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!formData) return <div className="p-8 text-gray-500">Failed to load contact content.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Sticky Save Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={22} /> Contact Section Editor
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize section headlines, narrative subtext, and social media profile links
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Section 1: Section Header & Headlines */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <Layout size={18} className="text-blue-500" />
              <h2 className="text-base font-bold text-gray-800">1. Section Header & Headlines</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Section Eyebrow Label
                </label>
                <input
                  type="text"
                  name="contactEyebrow"
                  value={formData.contactEyebrow || ""}
                  onChange={handleChange}
                  placeholder="Say Hello"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Headline Line 1 (Dark Text)
                  </label>
                  <input
                    type="text"
                    name="contactHeadlineLine1"
                    value={formData.contactHeadlineLine1 || ""}
                    onChange={handleChange}
                    placeholder="Let's work"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                    Headline Line 2 (Gradient Text)
                  </label>
                  <input
                    type="text"
                    name="contactHeadlineLine2"
                    value={formData.contactHeadlineLine2 || ""}
                    onChange={handleChange}
                    placeholder="together"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Narrative Subtext & Response Time */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" />
              <h2 className="text-base font-bold text-gray-800">2. Narrative Subtext & Response Time</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Contact Subtext Paragraph
                </label>
                <textarea
                  name="contactSubtext"
                  value={formData.contactSubtext || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="I'm currently open to new opportunities. Whether you have a project in mind, want to collaborate, or just want to say hi — my inbox is always open."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-500" /> Response Time Subtext
                </label>
                <input
                  type="text"
                  name="contactResponseTimeText"
                  value={formData.contactResponseTimeText || ""}
                  onChange={handleChange}
                  placeholder="Typical response time: within 24 hours"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Media Profiles & Links Manager */}
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80 space-y-5">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-gray-800">3. Social Media Profiles & Links</h2>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">
                Contact & Footer Sync
              </span>
            </div>

            {/* Primary Social Inputs */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Primary Profiles:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Github size={14} className="text-gray-900" /> GitHub URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Linkedin size={14} className="text-blue-600" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl || ""}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Twitter size={14} className="text-sky-500" /> Twitter / X URL
                  </label>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={formData.twitterUrl || ""}
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourusername"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Mail size={14} className="text-amber-500" /> Contact Email / Mailto
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="zawareshivam18@gmail.com"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Custom Social Platforms List */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Additional Social Media Platforms ({customLinks.length})
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add Instagram, YouTube, Discord, Dribbble, Medium, Website, etc.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleAddCustomLink}
                  size="sm"
                  variant="secondary"
                  className="text-xs font-bold border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Plus size={14} className="mr-1" /> Add Social Site
                </Button>
              </div>

              {customLinks.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  No additional social links added yet. Click "+ Add Social Site" to add Instagram, YouTube, Discord, etc.
                </div>
              ) : (
                <div className="space-y-3">
                  {customLinks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/80"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                        {renderSocialIcon(item.platform)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          value={item.platform}
                          onChange={(e) => handleCustomLinkChange(item.id, "platform", e.target.value)}
                          placeholder="Platform (e.g. Instagram)"
                          className="p-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <input
                          type="url"
                          value={item.url}
                          onChange={(e) => handleCustomLinkChange(item.id, "url", e.target.value)}
                          placeholder="URL (https://...)"
                          className="p-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLink(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Social Site"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Right Column — Live Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-500" /> Live Section Preview
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                Real-time Sync
              </span>
            </div>

            {/* Mini Contact Preview */}
            <div className="p-5 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-4 text-left">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  {formData.contactEyebrow || "Say Hello"}
                </p>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {formData.contactHeadlineLine1 || "Let's work"}{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formData.contactHeadlineLine2 || "together"}
                  </span>
                </h3>
              </div>

              <p className="text-xs text-gray-600 font-light leading-relaxed line-clamp-3">
                {formData.contactSubtext ||
                  "I'm currently open to new opportunities..."}
              </p>

              {/* Social icons preview */}
              <div className="flex items-center gap-2 flex-wrap">
                {formData.githubUrl && (
                  <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-900 shadow-2xs">
                    <Github size={14} />
                  </div>
                )}
                {formData.linkedinUrl && (
                  <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-blue-600 shadow-2xs">
                    <Linkedin size={14} />
                  </div>
                )}
                {formData.twitterUrl && (
                  <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sky-500 shadow-2xs">
                    <Twitter size={14} />
                  </div>
                )}
                {formData.email && (
                  <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-amber-500 shadow-2xs">
                    <Mail size={14} />
                  </div>
                )}
                {customLinks.map((item) => (
                  <div
                    key={item.id}
                    className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-indigo-600 shadow-2xs"
                    title={item.platform}
                  >
                    {renderSocialIcon(item.platform)}
                  </div>
                ))}
              </div>

              {/* Response Time Badge */}
              <div className="p-3 rounded-xl bg-white border border-gray-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{formData.availabilityStatus || "Available for work"}</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  {formData.contactResponseTimeText || "Typical response time: within 24 hours"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
