"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  UploadCloud,
  Search,
  Copy,
  Check,
  Trash2,
  FileText,
  FileCode,
  FileArchive,
  File,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
  ExternalLink,
  X,
  Eye,
  RefreshCw,
  HardDrive,
  Database,
  Globe,
  Settings2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Info,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: string;
}

interface FileReference {
  type: string;
  name: string;
  field: string;
}

interface StorageStats {
  dbSizeBytes: number;
  dbQuotaBytes: number;
  freeDbBytes: number;
  dbPercentageUsed: number;
  dbStatusColor: "blue" | "amber" | "red";

  fileSizeBytes: number;
  fileQuotaBytes: number;
  freeFileBytes: number;
  filePercentageUsed: number;
  fileStatusColor: "blue" | "amber" | "red";
  storageQuotaGB: number;

  egressLimitGB: number;
  supabaseDashboardUrl: string;
  isLowStorage: boolean;
  categories: Record<string, number>;
  totalFiles: number;
}

const CATEGORIES = ["All", "Resume", "Project Images", "Profile", "General"];
const PAGE_SIZE = 12;

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc" | "size_desc" | "size_asc";

export default function AdminFilesClient() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Storage Stats State
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [inputQuotaGB, setInputQuotaGB] = useState<string>("1.0");
  const [updatingQuota, setUpdatingQuota] = useState(false);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("General");
  const [isDragging, setIsDragging] = useState(false);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // File Detail Modal
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null);
  const [checkingDetailUsage, setCheckingDetailUsage] = useState(false);
  const [detailReferences, setDetailReferences] = useState<FileReference[]>([]);

  // Delete Safety Modal State
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [checkingDeleteUsage, setCheckingDeleteUsage] = useState(false);
  const [inUse, setInUse] = useState(false);
  const [deleteReferences, setDeleteReferences] = useState<FileReference[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch storage stats
  const fetchStorageStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/files/storage-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setInputQuotaGB(String(data.storageQuotaGB || 1.0));
      }
    } catch (err) {
      console.error("Failed to fetch storage stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchStorageStats();
  }, []);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Format File Size
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Calculate live category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: files.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== "All") counts[cat] = 0;
    });
    files.forEach((f) => {
      const cat = f.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [files]);

  // Filtered & Sorted files
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((f) => {
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return a.filename.localeCompare(b.filename);
      if (sortBy === "name_desc") return b.filename.localeCompare(a.filename);
      if (sortBy === "size_desc") return (b.size || 0) - (a.size || 0);
      if (sortBy === "size_asc") return (a.size || 0) - (b.size || 0);
      return 0;
    });

    return result;
  }, [files, selectedCategory, searchQuery, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredAndSortedFiles.length / PAGE_SIZE) || 1;
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedFiles.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedFiles, currentPage]);

  // Quota Update Handler
  const handleSaveQuota = async (quotaValue: number) => {
    setUpdatingQuota(true);
    try {
      const res = await fetch("/api/files/storage-stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotaGB: quotaValue }),
      });
      if (res.ok) {
        await fetchStorageStats();
        setShowQuotaModal(false);
      } else {
        alert("Failed to update storage quota");
      }
    } catch (err) {
      console.error("Failed to save quota:", err);
      alert("An error occurred while updating quota");
    } finally {
      setUpdatingQuota(false);
    }
  };

  // Upload Logic
  const handleUploadFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("category", uploadCategory);
    Array.from(fileList).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await Promise.all([fetchFiles(), fetchStorageStats()]);
        setShowUploadModal(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to upload file(s).");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Error uploading file(s).");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and Drop Handlers for Upload Modal
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Copy Link Handler
  const handleCopyLink = (file: MediaFile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let rawUrl = file.url || "";

    while (rawUrl.match(/^https?:\/\/[^\/]+https?:\/\//i)) {
      rawUrl = rawUrl.replace(/^https?:\/\/[^\/]+(?=https?:\/\/)/i, "");
    }

    const fullUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : window.location.origin + (rawUrl.startsWith("/") ? rawUrl : "/" + rawUrl);

    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open File Details Modal
  const openDetailModal = async (file: MediaFile) => {
    setDetailFile(file);
    setCheckingDetailUsage(true);
    setDetailReferences([]);
    try {
      const res = await fetch(`/api/files/usage?url=${encodeURIComponent(file.url)}`);
      if (res.ok) {
        const data = await res.json();
        setDetailReferences(data.references || []);
      }
    } catch (err) {
      console.error("Detail usage check failed:", err);
    } finally {
      setCheckingDetailUsage(false);
    }
  };

  // Trigger Delete Confirmation Modal & Check Usage Safety
  const initiateDelete = async (file: MediaFile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(file);
    setCheckingDeleteUsage(true);
    setInUse(false);
    setDeleteReferences([]);

    try {
      const res = await fetch(`/api/files/usage?url=${encodeURIComponent(file.url)}`);
      if (res.ok) {
        const data = await res.json();
        setInUse(data.inUse);
        setDeleteReferences(data.references || []);
      }
    } catch (err) {
      console.error("Usage check failed:", err);
    } finally {
      setCheckingDeleteUsage(false);
    }
  };

  // Perform Delete
  const confirmDelete = async (force: boolean = false) => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/files?id=${deleteTarget.id}&force=${force}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        await fetchStorageStats();
        setDeleteTarget(null);
        if (detailFile?.id === deleteTarget.id) {
          setDetailFile(null);
        }
      } else {
        const errData = await res.json();
        if (errData.inUse) {
          setInUse(true);
          setDeleteReferences(errData.references || []);
        } else {
          alert(errData.error || "Failed to delete file");
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting file");
    } finally {
      setDeleting(false);
    }
  };

  // Render File Icon
  const renderFileIcon = (file: MediaFile, size: number = 32) => {
    const mime = file.mimeType.toLowerCase();
    const ext = file.filename.split(".").pop()?.toLowerCase() || "";

    if (mime.includes("pdf") || ext === "pdf") {
      return (
        <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <FileText size={size} />
        </div>
      );
    }
    if (mime.includes("zip") || mime.includes("tar") || ["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
      return (
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <FileArchive size={size} />
        </div>
      );
    }
    if (mime.includes("json") || mime.includes("javascript") || ["js", "ts", "json", "html", "css"].includes(ext)) {
      return (
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <FileCode size={size} />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
        <File size={size} />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Low-Storage Warning Banner */}
      {stats && stats.isLowStorage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <p className="text-xs font-semibold text-red-950">
              Supabase Storage or Database capacity is above 90% limit.
            </p>
          </div>
          <a
            href={stats.supabaseDashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0"
          >
            Supabase Dashboard <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* 2. Compact Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Files & Media Library</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your Supabase Cloud files, project images, and resumes in one place.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={16} />
            Upload File
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loadingStats}
            onClick={() => {
              fetchFiles();
              fetchStorageStats();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-xl bg-white border border-gray-200 shadow-xs hover:bg-gray-50"
          >
            <RefreshCw size={14} className={loadingStats ? "animate-spin text-blue-500" : "text-gray-500"} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowQuotaModal(true)}
            className="p-2 text-xs rounded-xl bg-white border border-gray-200 shadow-xs hover:bg-gray-50 text-gray-600"
            title="Edit Storage Quota"
          >
            <Settings2 size={15} />
          </Button>
        </div>
      </div>

      {/* 3. Sticky Compact Capacity Strip */}
      {stats && (
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-3 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* DB Strip */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
            <Database size={16} className="text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[11px] font-bold text-gray-800">
                <span className="truncate">Database</span>
                <span>{formatFileSize(stats.dbSizeBytes)} / 500MB</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${stats.dbStatusColor === "red" ? "bg-red-500" : stats.dbStatusColor === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.max(2, Math.min(100, stats.dbPercentageUsed))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Storage Strip */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
            <HardDrive size={16} className="text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[11px] font-bold text-gray-800">
                <span className="truncate">File Storage</span>
                <span>{formatFileSize(stats.fileSizeBytes)} / {stats.storageQuotaGB}GB</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${stats.fileStatusColor === "red" ? "bg-red-500" : stats.fileStatusColor === "amber" ? "bg-amber-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.max(2, Math.min(100, stats.filePercentageUsed))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Egress Strip */}
          <a
            href={stats.supabaseDashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 text-xs font-semibold text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe size={16} className="text-purple-600 shrink-0" />
              <span className="truncate">Egress: 5 GB / Month</span>
            </div>
            <ExternalLink size={13} className="text-gray-400 shrink-0 ml-1" />
          </a>
        </div>
      )}

      {/* 4. Controls: Category Tabs, Search & Sorting */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box & Sort Selector */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 py-1.5 text-xs rounded-xl border-gray-200"
              />
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 border-none rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Size (Largest)</option>
                <option value="size_asc">Size (Smallest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Showing <strong>{filteredAndSortedFiles.length}</strong> file{filteredAndSortedFiles.length === 1 ? "" : "s"}
            {selectedCategory !== "All" && <span> in <strong>{selectedCategory}</strong></span>}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </span>
          {totalPages > 1 && (
            <span className="font-medium text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* 5. File Grid / Skeleton Loading / Empty States */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-3 space-y-3 animate-pulse">
              <div className="aspect-video bg-gray-100 rounded-xl" />
              <div className="h-3 bg-gray-100 rounded-md w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedFiles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 max-w-lg mx-auto my-8">
          <ImageIcon size={44} className="mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-bold text-gray-800">No files found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery || selectedCategory !== "All"
              ? "No files match your current category filter or search keywords."
              : "No files uploaded yet. Click '+ Upload File' to add your first file."}
          </p>
          <Button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-xs rounded-xl px-4 py-2 bg-blue-600 text-white font-bold"
          >
            <Plus size={14} className="mr-1" /> Upload New File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginatedFiles.map((file) => {
            const isImage = file.mimeType.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].some((ext) => file.filename.toLowerCase().endsWith(ext));

            return (
              <div
                key={file.id}
                onClick={() => openDetailModal(file)}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Header Area */}
                <div className="relative aspect-video bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                  {isImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    renderFileIcon(file, 28)
                  )}

                  {/* Hover Overlay with Quick Action Icon Buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-xs">
                    <button
                      onClick={(e) => handleCopyLink(file, e)}
                      className={`p-2 rounded-xl text-white transition-transform hover:scale-110 ${
                        copiedId === file.id ? "bg-green-600" : "bg-white/20 hover:bg-white/30"
                      }`}
                      title="Copy Link"
                    >
                      {copiedId === file.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(file);
                      }}
                      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-transform hover:scale-110"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => initiateDelete(file, e)}
                      className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-transform hover:scale-110"
                      title="Delete File"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Category Pill */}
                  <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {file.category}
                  </span>
                </div>

                {/* Card Details */}
                <div className="p-3">
                  <h4
                    title={file.filename}
                    className="text-xs font-bold text-gray-900 truncate mb-1"
                  >
                    {file.filename}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200/80 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 text-xs rounded-xl"
          >
            <ChevronLeft size={14} /> Previous
          </Button>
          <span className="text-xs font-semibold text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="flex items-center gap-1 text-xs rounded-xl"
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* 7. Modal: Upload File (Drag & Drop Zone) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud size={20} className="text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Upload to Supabase Storage</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                {uploading ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
              </div>
              <p className="text-xs font-semibold text-gray-700">
                {uploading ? "Uploading..." : "Drag and drop files here"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Supports PDF, PNG, JPG, WEBP, ZIP</p>

              {/* Category Dropdown */}
              <div className="mt-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500">Category:</span>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="text-xs font-bold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="Resume">Resume</option>
                  <option value="Project Images">Project Images</option>
                  <option value="Profile">Profile</option>
                </select>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
              />

              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 text-xs rounded-xl px-5 py-2"
              >
                {uploading ? "Processing..." : "Select Files"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Rich File Details */}
      {detailFile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row">
            {/* Left Preview Pane */}
            <div className="md:w-1/2 bg-slate-900 p-6 flex items-center justify-center min-h-[220px]">
              {detailFile.mimeType.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].some((ext) => detailFile.filename.toLowerCase().endsWith(ext)) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={detailFile.url} alt={detailFile.filename} className="max-h-[50vh] object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="text-center text-white space-y-2">
                  {renderFileIcon(detailFile, 48)}
                  <p className="text-xs font-semibold text-slate-300">{detailFile.filename}</p>
                </div>
              )}
            </div>

            {/* Right Meta Pane */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {detailFile.category}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 mt-1 break-all">{detailFile.filename}</h3>
                  </div>
                  <button onClick={() => setDetailFile(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-gray-600 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Size:</span>
                    <strong className="text-gray-900">{formatFileSize(detailFile.size)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Upload Date:</span>
                    <strong className="text-gray-900">{new Date(detailFile.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MIME Type:</span>
                    <strong className="text-gray-900 font-mono text-[11px] truncate max-w-[140px]">{detailFile.mimeType}</strong>
                  </div>
                </div>

                {/* Usage Reference Check */}
                <div className="pt-3 border-t space-y-2">
                  <span className="text-[11px] font-bold text-gray-700 block flex items-center gap-1">
                    <Layers size={13} className="text-blue-500" /> Active Usage References:
                  </span>
                  {checkingDetailUsage ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Loader2 size={12} className="animate-spin" /> Checking references...
                    </div>
                  ) : detailReferences.length > 0 ? (
                    <div className="space-y-1 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                      {detailReferences.map((ref, idx) => (
                        <p key={idx} className="text-[11px] text-amber-900 font-medium">
                          • <strong>{ref.type}:</strong> {ref.name}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400">Not actively referenced by any project or profile field.</p>
                  )}
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <Button
                  onClick={(e) => handleCopyLink(detailFile, e)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs rounded-xl"
                >
                  {copiedId === detailFile.id ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                  {copiedId === detailFile.id ? "Copied Link!" : "Copy Link"}
                </Button>
                <Button
                  onClick={(e) => initiateDelete(detailFile, e)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Configure Storage Quota */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Settings2 size={20} className="text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Configure Storage Quota</h3>
              </div>
              <button onClick={() => setShowQuotaModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Set your Supabase plan file storage quota (e.g. Supabase Free Tier is 1 GB).
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Quick Presets</span>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5, 10].map((gb) => (
                  <button
                    key={gb}
                    type="button"
                    onClick={() => setInputQuotaGB(String(gb))}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      Number(inputQuotaGB) === gb
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {gb} GB
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Custom Quota Limit (in GB):</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={inputQuotaGB}
                onChange={(e) => setInputQuotaGB(e.target.value)}
                placeholder="1.0"
                className="text-sm font-bold"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t">
              <Button variant="secondary" onClick={() => setShowQuotaModal(false)} disabled={updatingQuota}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const val = parseFloat(inputQuotaGB);
                  if (val && val > 0) handleSaveQuota(val);
                }}
                disabled={updatingQuota}
                className="px-6"
              >
                {updatingQuota ? <Loader2 className="animate-spin mr-1" size={14} /> : null}
                Save Quota
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Delete Safety Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            {checkingDeleteUsage ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-sm text-gray-600 font-medium">Checking file usage in database...</p>
              </div>
            ) : inUse ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">File is Currently in Use</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Deleting <span className="font-semibold text-gray-900">"{deleteTarget.filename}"</span> will break active references on your website.
                  </p>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                    Active References ({deleteReferences.length}):
                  </span>
                  <ul className="space-y-1 text-xs text-amber-900 font-medium">
                    {deleteReferences.map((ref, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>
                          <strong className="text-amber-950">{ref.type}:</strong> {ref.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => confirmDelete(true)}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? <Loader2 className="animate-spin mr-1" size={14} /> : null}
                    Delete Anyway (Force)
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirm File Deletion</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteTarget.filename}"</span>? This will permanently remove the file from your Supabase Storage bucket.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => confirmDelete(false)}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? <Loader2 className="animate-spin mr-1" size={14} /> : null}
                    Delete File
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
