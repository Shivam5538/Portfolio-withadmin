/**
 * Icon Resolution Regression Check
 * 
 * Run this after ANY performance/bundle optimization changes to verify every
 * Technology entry in the database resolves to a real, distinct icon.
 * 
 * Usage:
 *   cd e:\Portfolio
 *   npx tsx scripts/check-icon-resolution.ts
 */

import { PrismaClient } from "@prisma/client";
import * as SiIcons from "react-icons/si";

const prisma = new PrismaClient();

function slugifyIconName(name: string): string {
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

const ALIAS_MAP: Record<string, string> = {
  js: "sijavascript",
  javascript: "sijavascript",
  ts: "sitypescript",
  typescript: "sitypescript",
  react: "sireact",
  next: "sinextdotjs",
  nextjs: "sinextdotjs",
  node: "sinodedotjs",
  nodejs: "sinodedotjs",
  tailwind: "sitailwindcss",
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
  angular: "siangular",
  aws: "siamazonwebservices",
  firebase: "sifirebase",
  supabase: "sisupabase",
  vercel: "sivercel",
  rust: "sirust",
  go: "sigo",
  golang: "sigolang",
};

// Build slug→key map from all Si icons
const SLUG_TO_KEY = new Map<string, string>();
Object.keys(SiIcons).forEach((key) => {
  if (key.startsWith("Si")) {
    const slug = slugifyIconName(key.substring(2));
    if (slug) SLUG_TO_KEY.set(slug, key);
  }
});

function resolveIcon(iconKey: string | null, name: string): { resolved: boolean; icon: string | null } {
  const candidates = [iconKey, name].filter(Boolean) as string[];
  
  for (const candidate of candidates) {
    const slug = slugifyIconName(candidate);
    
    // Direct key match (e.g., "SiReact")
    if (candidate && (SiIcons as any)[candidate]) {
      return { resolved: true, icon: candidate };
    }
    
    // Alias match
    if (ALIAS_MAP[slug] && (SiIcons as any)[ALIAS_MAP[slug]]) {
      return { resolved: true, icon: ALIAS_MAP[slug] };
    }
    
    // Slug match
    if (SLUG_TO_KEY.has(slug)) {
      return { resolved: true, icon: SLUG_TO_KEY.get(slug)! };
    }
    
    // Partial match
    for (const [s, k] of SLUG_TO_KEY.entries()) {
      if (s === slug || s.startsWith(slug) || slug.startsWith(s)) {
        return { resolved: true, icon: k };
      }
    }
  }
  
  return { resolved: false, icon: null };
}

async function main() {
  console.log("\n🔍 Icon Resolution Regression Check\n");
  console.log("=".repeat(60));
  
  const technologies = await prisma.technology.findMany({
    orderBy: { name: "asc" },
  });
  
  if (technologies.length === 0) {
    console.log("⚠️  No technologies found in database.");
    return;
  }
  
  let passCount = 0;
  let failCount = 0;
  const failures: string[] = [];
  const blankNames: string[] = [];
  
  for (const tech of technologies) {
    if (!tech.name || tech.name.trim() === "") {
      blankNames.push(`ID: ${tech.id} | iconKey: ${tech.iconKey || "(none)"}`);
    }
    
    const { resolved, icon } = resolveIcon(tech.iconKey, tech.name);
    
    if (resolved) {
      passCount++;
      console.log(`  ✅ ${tech.name.padEnd(25)} → ${icon}`);
    } else {
      failCount++;
      failures.push(`${tech.name} (iconKey: ${tech.iconKey || "none"})`);
      console.log(`  ❌ ${tech.name.padEnd(25)} → FALLBACK (no icon found)`);
    }
  }
  
  console.log("\n" + "=".repeat(60));
  console.log(`\nResults: ${passCount} resolved ✅ | ${failCount} fallback ❌ out of ${technologies.length} total`);
  
  if (blankNames.length > 0) {
    console.log("\n⚠️  BLANK NAMES DETECTED (will show empty tile labels):");
    blankNames.forEach((b) => console.log(`   - ${b}`));
    console.log("   → Fix these entries in /admin/skills");
  }
  
  if (failures.length > 0) {
    console.log("\n⚠️  ICON RESOLUTION FAILURES (will show </> fallback):");
    failures.forEach((f) => console.log(`   - ${f}`));
    console.log("   → Update iconKey or name in /admin/skills to match a react-icons/si icon");
    console.log("   → Full icon list: https://react-icons.github.io/react-icons/icons/si/");
  } else {
    console.log("\n🎉 All icons resolve correctly! No regressions detected.");
  }
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
