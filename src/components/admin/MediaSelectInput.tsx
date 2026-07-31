"use client";

import { useState, useRef } from "react";
import { Upload, FolderOpen, Loader2, X, Eye, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import MediaLibraryModal from "./MediaLibraryModal";

interface MediaSelectInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  category?: string; // e.g. "Resume", "Profile", "Project Images", "General"
  accept?: string;
  id?: string;
}

export default function MediaSelectInput({
  value,
  onChange,
  label,
  placeholder = "/uploads/...",
  category = "General",
  accept = "*",
  id,
}: MediaSelectInputProps) {
  const [uploading, setUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
        }
      } else {
        alert("Failed to upload file");
      }
    } catch (err) {
      console.error("Inline upload error:", err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isImage = value && (value.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || value.includes("image"));
  const isPdf = value && value.endsWith(".pdf");

  return (
    <div className="space-y-2">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Main input container */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 flex items-center">
          <Input
            id={id}
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-8 text-xs font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            title="Upload new file directly"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload New
          </button>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
            title="Choose from Media Library"
          >
            <FolderOpen size={14} />
            Choose from Library
          </button>
        </div>
      </div>

      {/* Preview Pill if value is present */}
      {value && (
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200/80 w-fit text-xs">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-8 h-8 object-cover rounded-lg border border-white shrink-0" />
          ) : isPdf ? (
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
              <ImageIcon size={16} />
            </div>
          )}
          <div className="min-w-0 pr-2">
            <span className="font-mono text-[11px] text-gray-700 block truncate max-w-xs">{value}</span>
            <span className="text-[9px] text-gray-400 uppercase font-semibold">Active Selection</span>
          </div>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline p-1 shrink-0"
            title="Preview file in new tab"
          >
            <Eye size={14} />
          </a>
        </div>
      )}

      {/* Media Library Selection Modal */}
      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(url) => onChange(url)}
        currentValue={value}
        categoryFilter={category === "General" ? "All" : category}
      />
    </div>
  );
}
