"use client";

import dynamic from "next/dynamic";
import { Loader2, Code2 } from "lucide-react";
import React from "react";

// Lazy load the giant react-icons/si map so it doesn't block LCP/TTFB
const LazyIconRenderer = dynamic(
  () => import("@/lib/iconStore").then((mod) => mod.IconRenderer),
  {
    ssr: false, // Ensure it doesn't inflate the server render payload
    loading: () => (
      <span className="inline-block opacity-50 shrink-0">
        <Loader2 className="w-4 h-4 animate-spin" />
      </span>
    ),
  }
);

export function DynamicIcon({
  iconKey,
  className,
}: {
  iconKey?: string | null;
  className?: string;
}) {
  if (!iconKey) return <Code2 className={className || "w-6 h-6"} />;
  
  return <LazyIconRenderer iconKey={iconKey} className={className} />;
}
