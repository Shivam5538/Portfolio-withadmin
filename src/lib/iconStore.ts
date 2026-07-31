import * as SiIcons from "react-icons/si";
import React from "react";
import { Code2 } from "lucide-react";
import { TECH_ICON_SLUG_SET } from "@/lib/techIconAllowlist";

export interface IconItem {
  key: string;
  name: string;
  slug: string;
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

const KEY_TO_COMPONENT_MAP = new Map<string, React.ComponentType<{ className?: string }>>();
const SLUG_TO_KEY_MAP = new Map<string, string>();
export const ICON_LIST: IconItem[] = [];

// Populate maps at load time from react-icons/si
Object.entries(SiIcons).forEach(([key, component]) => {
  if (key.startsWith("Si") && (typeof component === "function" || typeof component === "object")) {
    KEY_TO_COMPONENT_MAP.set(key, component as any);

    const rawSlug = slugifyIconName(key.substring(2));
    if (rawSlug) {
      SLUG_TO_KEY_MAP.set(rawSlug, key);
    }

    let cleanName = key.substring(2);
    cleanName = cleanName
      .replace(/dot/g, ".")
      .replace(/plusplus/g, "++")
      .replace(/sharp/g, "#")
      .replace(/([a-z])([A-Z])/g, "$1 $2");

    ICON_LIST.push({
      key,
      name: cleanName,
      slug: rawSlug,
    });
  }
});

const ALIAS_MAP: Record<string, string> = {
  js: "sijavascript",
  javascript: "sijavascript",
  ts: "sitypescript",
  typescript: "sitypescript",
  react: "sireact",
  next: "sinextdotjs",
  nextjs: "sinextdotjs",
  nextdotjs: "sinextdotjs",
  node: "sinodedotjs",
  nodejs: "sinodedotjs",
  nodedotjs: "sinodedotjs",
  tailwind: "sitailwindcss",
  tailwindcss: "sitailwindcss",
  postgres: "sipostgresql",
  postgresql: "sipostgresql",
  mongo: "simongodb",
  mongodb: "simongodb",
  docker: "sidocker",
  figma: "sifigma",
  graphql: "sigraphql",
  prisma: "siprisma",
  git: "sigit",
  python: "sipython",
  vue: "sivuedotjs",
  vuejs: "sivuedotjs",
  vuedotjs: "sivuedotjs",
  angular: "siangular",
  aws: "siamazon",
  amazon: "siamazon",
  firebase: "sifirebase",
  supabase: "sisupabase",
  vercel: "sivercel",
  rust: "sirust",
  go: "sigo",
  golang: "sigolang",
  cpp: "sicplusplus",
  cplusplus: "sicplusplus",
  cs: "sicsharp",
  csharp: "sicsharp",
};

export function findAutoIcon(name: string): { key: string; name: string; isMatch: boolean } {
  if (!name || !name.trim()) {
    return { key: "SiCode", name: "Code", isMatch: false };
  }

  const slug = slugifyIconName(name);

  if (ALIAS_MAP[slug] && KEY_TO_COMPONENT_MAP.has(ALIAS_MAP[slug])) {
    const key = ALIAS_MAP[slug];
    const matchItem = ICON_LIST.find((i) => i.key === key);
    return { key, name: matchItem?.name || name, isMatch: true };
  }

  if (SLUG_TO_KEY_MAP.has(slug)) {
    const key = SLUG_TO_KEY_MAP.get(slug)!;
    const matchItem = ICON_LIST.find((i) => i.key === key);
    return { key, name: matchItem?.name || name, isMatch: true };
  }

  const partial = ICON_LIST.find(
    (item) => item.slug === slug || item.slug.startsWith(slug) || slug.startsWith(item.slug)
  );
  if (partial) {
    return { key: partial.key, name: partial.name, isMatch: true };
  }

  return { key: "SiCode", name: "Code", isMatch: false };
}

export function searchSimpleIcons(query: string, limit = 60): IconItem[] {
  if (!query || query.trim() === "") {
    return ICON_LIST.slice(0, limit);
  }
  const q = query.toLowerCase().trim();
  const slugQ = slugifyIconName(query);

  return ICON_LIST.filter(
    (item) =>
      item.key.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.slug.includes(slugQ)
  ).slice(0, limit);
}

/**
 * Search icons filtered to the curated tech-relevant allowlist.
 * This is the default search function for the icon picker — it keeps results
 * focused on software development tools, languages, and frameworks by only
 * returning icons whose slug appears in TECH_ICON_SLUG_SET.
 *
 * Use searchSimpleIcons() as the "search all" fallback for full catalog access.
 */
export function searchTechIcons(query: string, limit = 60): IconItem[] {
  // Filter ICON_LIST to only tech-relevant icons from the curated allowlist
  const techIcons = ICON_LIST.filter((item) =>
    TECH_ICON_SLUG_SET.has(item.slug)
  );

  // If no query, return first N from the curated list
  if (!query || query.trim() === "") {
    return techIcons.slice(0, limit);
  }

  const q = query.toLowerCase().trim();
  const slugQ = slugifyIconName(query);

  return techIcons
    .filter(
      (item) =>
        item.key.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.slug.includes(slugQ)
    )
    .slice(0, limit);
}

export function IconRenderer({ iconKey, className = "w-6 h-6" }: { iconKey?: string | null, className?: string }) {
  if (!iconKey) {
    return React.createElement(Code2, { className });
  }

  if (KEY_TO_COMPONENT_MAP.has(iconKey)) {
    const Component = KEY_TO_COMPONENT_MAP.get(iconKey)!;
    return React.createElement(Component, { className });
  }

  const auto = findAutoIcon(iconKey);
  if (auto.isMatch && KEY_TO_COMPONENT_MAP.has(auto.key)) {
    const Component = KEY_TO_COMPONENT_MAP.get(auto.key)!;
    return React.createElement(Component, { className });
  }

  return React.createElement(Code2, { className });
}
