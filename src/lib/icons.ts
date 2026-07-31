/**
 * icons.ts — lightweight icon utility for the public site and client components.
 *
 * ⚠️ PERFORMANCE RULE — DO NOT CHANGE THIS WITHOUT READING:
 *   The actual react-icons/si bundle (3000+ SVG components, ~1.5MB) lives in
 *   `@/lib/iconStore.ts` and is loaded lazily via `DynamicIcon.tsx` (next/dynamic, ssr:false).
 *   `renderIconByKey` MUST remain a plain function wrapping <DynamicIcon /> with the
 *   positional (iconKey, className) call convention used throughout the codebase.
 *
 *   Do NOT replace it with `export { DynamicIcon as renderIconByKey }`.
 *   DynamicIcon is a React component that expects { iconKey, className } as a props object —
 *   calling it with positional args silently passes undefined for iconKey, which causes
 *   every tile to render the generic </> fallback icon. This is the exact regression
 *   that was introduced during the performance cleanup and has now been fixed twice.
 *
 *   If you need to optimize this file, add a comment explaining why the function wrapper
 *   is intentional and necessary, and test the Skills mosaic visually before shipping.
 */

import React from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

/**
 * Render a brand icon by its iconKey (e.g. "SiReact") or name (e.g. "react").
 * Falls back to a generic code icon if no match is found.
 *
 * Call convention: renderIconByKey(iconKey, className) — positional args.
 * This wraps <DynamicIcon /> which uses the { iconKey, className } props convention.
 */
export function renderIconByKey(iconKey: string | null | undefined, className?: string): React.ReactElement {
  return React.createElement(DynamicIcon, { iconKey, className });
}

export function slugifyIconName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/&/g, "and")
    .replace(/\./g, "dot")
    .replace(/[^a-z0-9]/g, "");
}

export function getBrandColor(nameOrKey: string): string {
  const n = (nameOrKey || "").toLowerCase();

  if (n.includes("react")) return "#61DAFB";
  if (n.includes("next")) return "#000000";
  if (n.includes("typescript") || n.includes("sitypescript") || n === "ts") return "#3178C6";
  if (n.includes("javascript") || n.includes("sijavascript") || n === "js") return "#EAB308";
  if (n.includes("tailwind")) return "#38BDF8";
  if (n.includes("node")) return "#22C55E";
  if (n.includes("postgre") || n.includes("sql")) return "#336791";
  if (n.includes("mongo")) return "#10B981";
  if (n.includes("docker")) return "#2496ED";
  if (n.includes("figma")) return "#F24E1E";
  if (n.includes("graphql")) return "#E10098";
  if (n.includes("prisma")) return "#6366F1";
  if (n.includes("git")) return "#F05032";
  if (n.includes("python")) return "#3776AB";
  if (n.includes("vue")) return "#4FC08D";
  if (n.includes("angular")) return "#DD0031";
  if (n.includes("aws") || n.includes("amazon")) return "#FF9900";
  if (n.includes("firebase")) return "#FFCA28";
  if (n.includes("supabase")) return "#3FCF8E";
  if (n.includes("vercel")) return "#000000";
  if (n.includes("express")) return "#000000";
  if (n.includes("github")) return "#000000";
  if (n.includes("rust")) return "#DEA584";
  if (n.includes("golang") || n.includes("go")) return "#00ADD8";
  if (n.includes("cplusplus") || n.includes("c++")) return "#00599C";
  if (n.includes("csharp") || n.includes("c#")) return "#239120";

  return "#3b82f6";
}
