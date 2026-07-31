"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2, Check, FileText, Image as ImageIcon, File } from "lucide-react";
import { Input, Badge } from "@/components/ui";

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  category: string;
  createdAt: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, file?: MediaFile) => void;
  currentValue?: string;
  categoryFilter?: string;
}

const CATEGORIES = ["All", "Resume", "Project Images", "Profile", "General"];

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  categoryFilter = "All",
}: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/files")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setFiles(data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredFiles = files.filter((f) => {
    const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
    const matchesSearch = f.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Choose from Media Library</h3>
            <p className="text-xs text-gray-500">Select an existing uploaded file to use</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 py-1.5 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Files Grid Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ImageIcon size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-gray-600">No files found</p>
              <p className="text-xs text-gray-400 mt-1">Try another category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = currentValue === file.url;
                const isImage =
                  file.mimeType.startsWith("image/") ||
                  [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].some((ext) =>
                    file.filename.toLowerCase().endsWith(ext)
                  );

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => {
                      onSelect(file.url, file);
                      onClose();
                    }}
                    className={`relative text-left rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-100">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="p-3 text-gray-400">
                          {file.mimeType.includes("pdf") ? <FileText size={28} className="text-red-500" /> : <File size={28} />}
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                          <Check size={12} />
                        </div>
                      )}

                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                        {file.category}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-2.5">
                      <p title={file.filename} className="text-xs font-semibold text-gray-900 truncate">
                        {file.filename}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end bg-gray-50/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
