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
  Sparkles,
  Upload,
  Image as ImageIcon,
  Search,
  Check,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Star,
  Target,
  Lightbulb,
  FolderOpen,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FormError } from "@/components/ui";
import { slugify } from "@/lib/utils";
import { renderIconByKey, getBrandColor } from "@/lib/icons";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";


interface Technology {
  id: string;
  name: string;
  category: string;
  iconKey: string;
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  longDesc: z.string().optional(),
  liveUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  result: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface Project {
  id: string;
  title: string;
  slug: string;
  category?: string;
  description: string;
  longDesc?: string | null;
  coverImageUrl?: string | null;
  images?: string[];
  techStack: string[];
  technologies?: Technology[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  challenge?: string | null;
  solution?: string | null;
  result?: string | null;
  featured: boolean;
  order: number;
}

const PRESET_CATEGORIES = ["Full-Stack", "Frontend", "Backend", "Mobile", "Open Source"];

export default function AdminProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [masterTechnologies, setMasterTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Gallery images & cover image state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isProjectLibraryOpen, setIsProjectLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Master technology picker state
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [techSearchQuery, setTechSearchQuery] = useState("");

  // Case study collapse state
  const [showCaseStudyFields, setShowCaseStudyFields] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const titleValue = watch("title", "");

  // Auto-generate slug from title (only on create)
  useEffect(() => {
    if (!editing && titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, editing, setValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, techRes] = await Promise.all([
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/technologies").then((r) => r.json()),
      ]);

      setProjects(Array.isArray(projRes) ? projRes : []);
      setMasterTechnologies(Array.isArray(techRes) ? techRes : []);
    } catch (err) {
      console.error("Failed to load projects data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setGalleryImages([]);
    setCoverImageUrl("");
    setSelectedTechIds([]);
    setImageUrlInput("");
    setTechSearchQuery("");
    setShowCaseStudyFields(false);
    reset({
      title: "",
      slug: "",
      category: "Full-Stack",
      description: "",
      longDesc: "",
      liveUrl: "",
      githubUrl: "",
      challenge: "",
      solution: "",
      result: "",
      featured: false,
      order: 0,
    });
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setTechSearchQuery("");
    setImageUrlInput("");

    // Set gallery & cover image
    const gallery = Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : (project.coverImageUrl ? [project.coverImageUrl] : []);
    setGalleryImages(gallery);
    setCoverImageUrl(project.coverImageUrl || gallery[0] || "");

    // Set selected tech IDs / names
    if (project.technologies && project.technologies.length > 0) {
      setSelectedTechIds(project.technologies.map((t) => t.id));
    } else if (Array.isArray(project.techStack)) {
      const masterIds = new Set(masterTechnologies.map((t) => t.id));
      const masterNames = new Map(masterTechnologies.map((t) => [t.name.toLowerCase().trim(), t.id]));
      const ids: string[] = [];

      project.techStack.forEach((tag) => {
        if (masterIds.has(tag)) ids.push(tag);
        else if (masterNames.has(tag.toLowerCase().trim())) ids.push(masterNames.get(tag.toLowerCase().trim())!);
        else ids.push(tag);
      });
      setSelectedTechIds(ids);
    } else {
      setSelectedTechIds([]);
    }

    const hasCaseStudy = Boolean(project.challenge || project.solution || project.result);
    setShowCaseStudyFields(hasCaseStudy);

    reset({
      title: project.title,
      slug: project.slug,
      category: project.category || "Full-Stack",
      description: project.description,
      longDesc: project.longDesc ?? "",
      liveUrl: project.liveUrl ?? "",
      githubUrl: project.githubUrl ?? "",
      challenge: project.challenge ?? "",
      solution: project.solution ?? "",
      result: project.result ?? "",
      featured: project.featured,
      order: project.order,
    });
    setShowModal(true);
  };

  // Image Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setGalleryImages((prev) => [...prev, data.url]);
        if (!coverImageUrl) {
          setCoverImageUrl(data.url);
        }
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setGalleryImages((prev) => [...prev, url]);
    if (!coverImageUrl) {
      setCoverImageUrl(url);
    }
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    const removedUrl = galleryImages[index];
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (coverImageUrl === removedUrl) {
      setCoverImageUrl(updated[0] || "");
    }
  };

  const handleSetAsCover = (url: string) => {
    setCoverImageUrl(url);
  };

  // Tech Selector Handlers
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

  // Submit Handler
  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const payload = {
      ...data,
      techStack: selectedTechIds,
      images: galleryImages,
      coverImageUrl: coverImageUrl || galleryImages[0] || null,
      liveUrl: data.liveUrl || null,
      githubUrl: data.githubUrl || null,
      longDesc: data.longDesc || null,
      challenge: data.challenge || null,
      solution: data.solution || null,
      result: data.result || null,
    };

    try {
      if (editing) {
        await fetch(`/api/projects/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  };

  // Reorder Handlers
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newProjects = [...projects];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newProjects.length) return;

    // Swap items
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIdx];
    newProjects[targetIdx] = temp;

    // Reassign order indices
    const updatedWithOrder = newProjects.map((p, i) => ({ ...p, order: i }));
    setProjects(updatedWithOrder);

    // Save to API
    try {
      await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedWithOrder.map((p) => ({ id: p.id, order: p.order })),
        }),
      });
    } catch (err) {
      console.error("Failed to save reorder:", err);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Failed to delete project:", err);
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
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Projects</h1>
          <p className="text-[#9ca3af] text-sm mt-1">{projects.length} showcase projects</p>
        </div>
        <Button onClick={openCreate} id="admin-add-project-btn">
          <Plus size={16} /> Add Project
        </Button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center text-[#9ca3af] text-sm">
            No projects added yet. Click &quot;Add Project&quot; to build your portfolio.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#f9f9fb]">
                <th className="w-10 px-3 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Project & Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hidden sm:table-cell">
                  Tech Stack
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hidden md:table-cell">
                  Gallery
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af] hidden md:table-cell">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => {
                const gallery = Array.isArray(project.images) && project.images.length > 0
                  ? project.images
                  : (project.coverImageUrl ? [project.coverImageUrl] : []);

                return (
                  <tr
                    key={project.id}
                    className={`border-b border-[rgba(0,0,0,0.04)] hover:bg-[#f9f9fb] transition-colors ${
                      idx === projects.length - 1 ? "border-0" : ""
                    }`}
                  >
                    {/* Reorder Buttons */}
                    <td className="px-3 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5 text-gray-400">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, "up")}
                          className="hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          disabled={idx === projects.length - 1}
                          onClick={() => handleMoveOrder(idx, "down")}
                          className="hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Title & Category */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {project.coverImageUrl || gallery[0] ? (
                            <img
                              src={project.coverImageUrl || gallery[0]}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#111111] text-sm flex items-center gap-1.5">
                            {project.title}
                            {project.featured && (
                              <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-0.5">
                            {project.category || "Full-Stack"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tech Stack */}
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="text-xs text-slate-400 font-medium">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gallery Count */}
                    <td className="px-4 py-4 text-xs text-gray-500 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                        <ImageIcon size={12} /> {gallery.length} image{gallery.length === 1 ? "" : "s"}
                      </span>
                    </td>

                    {/* Status Badges */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      {project.featured ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] text-gray-500 bg-gray-100">
                          Standard
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(project)}
                          className="p-1.5 rounded-lg hover:bg-[rgba(0,0,0,0.05)] text-[#6b7280] hover:text-[#111111] transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={deleting === project.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#6b7280] hover:text-red-500 transition-colors"
                          aria-label="Delete"
                        >
                          {deleting === project.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
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
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-[rgba(0,0,0,0.07)]">
                <h2 className="text-lg font-bold text-[#111111]">
                  {editing ? "Edit Project" : "New Project"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-[rgba(0,0,0,0.05)] text-[#6b7280]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proj-title">Project Title *</Label>
                    <Input id="proj-title" placeholder="E-Commerce Platform" {...register("title")} />
                    <FormError message={errors.title?.message} />
                  </div>
                  <div>
                    <Label htmlFor="proj-slug">URL Slug *</Label>
                    <Input id="proj-slug" placeholder="e-commerce-platform" {...register("slug")} />
                    <FormError message={errors.slug?.message} />
                  </div>
                </div>

                {/* Category & Featured */}
                <div className="grid sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="proj-category">Category *</Label>
                    <Input
                      id="proj-category"
                      placeholder="Full-Stack, Frontend, Open Source..."
                      list="categories-list"
                      {...register("category")}
                    />
                    <datalist id="categories-list">
                      {PRESET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <FormError message={errors.category?.message} />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                    <input
                      type="checkbox"
                      id="proj-featured"
                      {...register("featured")}
                      className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="proj-featured" className="text-sm font-semibold text-gray-800 cursor-pointer flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      Featured Project (Spans 2 Columns in Grid)
                    </label>
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <Label htmlFor="proj-desc">Short Description *</Label>
                  <Textarea
                    id="proj-desc"
                    rows={2}
                    placeholder="Concise overview shown on project card..."
                    {...register("description")}
                  />
                  <FormError message={errors.description?.message} />
                </div>

                <div>
                  <Label htmlFor="proj-long">Full Overview (Shown in Modal / Dedicated Page)</Label>
                  <Textarea
                    id="proj-long"
                    rows={4}
                    placeholder="Comprehensive explanation of features, architecture, and tech decisions..."
                    {...register("longDesc")}
                  />
                </div>

                {/* Links */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proj-live">Live Demo URL</Label>
                    <Input id="proj-live" placeholder="https://myproject.com" {...register("liveUrl")} />
                    <FormError message={errors.liveUrl?.message} />
                  </div>
                  <div>
                    <Label htmlFor="proj-github">GitHub Repository URL</Label>
                    <Input id="proj-github" placeholder="https://github.com/user/repo" {...register("githubUrl")} />
                    <FormError message={errors.githubUrl?.message} />
                  </div>
                </div>

                {/* MULTIPLE IMAGE UPLOAD / GALLERY MANAGER */}
                <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-bold text-gray-800">
                        Project Gallery & Screenshots ({galleryImages.length})
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Upload screenshots or paste image URLs. First image or selected image will be used as thumbnail cover.
                      </p>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="text-xs"
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={handleAddImageUrl}>
                        Add URL
                      </Button>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="image-file-input"
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingImage ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        Upload Local File
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsProjectLibraryOpen(true)}
                        className="flex items-center gap-1.5"
                      >
                        <FolderOpen size={14} />
                        Choose from Library
                      </Button>
                    </div>

                  </div>

                  {/* Gallery Thumbnails List */}
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {galleryImages.map((url, idx) => {
                        const isCover = coverImageUrl === url || (idx === 0 && !coverImageUrl);
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden border-2 bg-white shadow-xs group ${
                              isCover ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-200"
                            }`}
                          >
                            <div className="h-24 w-full bg-slate-100 overflow-hidden">
                              <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            </div>

                            {/* Cover Badge */}
                            {isCover && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white shadow-xs">
                                Cover Image
                              </span>
                            )}

                            {/* Actions overlay */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(url)}
                                  className="px-2 py-1 text-[10px] font-bold bg-white text-gray-900 rounded shadow-xs hover:bg-blue-50"
                                >
                                  Set Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 text-white bg-red-600 rounded hover:bg-red-700"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400">
                      No images uploaded yet. Upload screenshots or add image URLs above.
                    </div>
                  )}
                </div>

                {/* MASTER TECHNOLOGY PICKER */}
                <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-bold text-gray-800">
                        Tech Stack Used{" "}
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Shared Technology Master List
                        </span>
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select technologies from your master Skills pool so icons match branding across the site.
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

                  {/* Selected Tech Chips */}
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
                            className={`p-2 rounded-xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
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

                {/* OPTIONAL CASE STUDY FIELDS */}
                <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCaseStudyFields(!showCaseStudyFields)}>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        Optional Case Study Breakdown
                        <span className="text-[10px] text-gray-400 font-normal">(Challenge, Solution, Result)</span>
                      </h3>
                    </div>
                    <Button type="button" variant="ghost" size="sm">
                      {showCaseStudyFields ? "Hide Fields" : "Show Fields"}
                    </Button>
                  </div>

                  {showCaseStudyFields && (
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <div>
                        <Label htmlFor="proj-challenge" className="flex items-center gap-1.5 text-amber-700">
                          <Target size={14} /> Challenge / Problem Statement
                        </Label>
                        <Textarea id="proj-challenge" rows={2} placeholder="What core problem did this project solve?" {...register("challenge")} />
                      </div>
                      <div>
                        <Label htmlFor="proj-solution" className="flex items-center gap-1.5 text-blue-700">
                          <Lightbulb size={14} /> Solution & Technical Strategy
                        </Label>
                        <Textarea id="proj-solution" rows={2} placeholder="How was the technical architecture designed?" {...register("solution")} />
                      </div>
                      <div>
                        <Label htmlFor="proj-result" className="flex items-center gap-1.5 text-emerald-700">
                          <Trophy size={14} /> Result & Business Impact
                        </Label>
                        <Textarea id="proj-result" rows={2} placeholder="What metrics or outcomes were achieved?" {...register("result")} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Order Sequence */}
                <div>
                  <Label htmlFor="proj-order">Display Sequence Order</Label>
                  <Input id="proj-order" type="number" placeholder="0" {...register("order")} />
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
                      "Create Project"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MediaLibraryModal
        isOpen={isProjectLibraryOpen}
        onClose={() => setIsProjectLibraryOpen(false)}
        onSelect={(url) => {
          setGalleryImages((prev) => [...prev, url]);
          if (!coverImageUrl) {
            setCoverImageUrl(url);
          }
        }}
        categoryFilter="Project Images"
      />
    </div>
  );
}

