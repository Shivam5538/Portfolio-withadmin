import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { findAutoIcon } from "@/lib/iconStore";

function safeParseJSON(str: string | null | undefined, fallback: any = []) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

async function resolveAndMigrateTechTags(rawTechTags?: string | null) {
  const rawList = safeParseJSON(rawTechTags, []);
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return { ids: [], technologies: [], needsMigration: false };
  }

  const allTechs = await prisma.technology.findMany();
  const techMapById = new Map(allTechs.map((t) => [t.id, t]));
  const techMapByName = new Map(allTechs.map((t) => [t.name.toLowerCase().trim(), t]));

  const resolvedIds: string[] = [];
  const resolvedTechs: Array<{ id: string; name: string; category: string; iconKey: string }> = [];
  let needsMigration = false;

  for (const item of rawList) {
    if (!item) continue;
    const itemStr = typeof item === "string" ? item.trim() : String(item.id || item.name || "").trim();
    if (!itemStr) continue;

    // 1. Existing technology ID
    if (techMapById.has(itemStr)) {
      resolvedIds.push(itemStr);
      resolvedTechs.push(techMapById.get(itemStr)!);
      continue;
    }

    // 2. Matching technology by name
    const lowerName = itemStr.toLowerCase();
    if (techMapByName.has(lowerName)) {
      const existingTech = techMapByName.get(lowerName)!;
      resolvedIds.push(existingTech.id);
      resolvedTechs.push(existingTech);
      needsMigration = true;
      continue;
    }

    // 3. Create missing technology in master pool using findAutoIcon
    const auto = findAutoIcon(itemStr);
    try {
      const newTech = await prisma.technology.create({
        data: {
          name: itemStr,
          category: "Frontend",
          iconKey: auto.key,
        },
      });
      techMapById.set(newTech.id, newTech);
      techMapByName.set(newTech.name.toLowerCase().trim(), newTech);
      resolvedIds.push(newTech.id);
      resolvedTechs.push(newTech);
      needsMigration = true;
    } catch (err) {
      console.error("Failed to auto-create technology for experience techTags:", itemStr, err);
    }
  }

  return { ids: resolvedIds, technologies: resolvedTechs, needsMigration };
}

export async function GET() {
  try {
    const experience = await prisma.experience.findMany({
      orderBy: [{ order: "asc" }, { startDate: "desc" }],
    });

    const formattedExperience = await Promise.all(
      experience.map(async (exp) => {
        const { ids, technologies, needsMigration } = await resolveAndMigrateTechTags(exp.techTags);
        if (needsMigration) {
          await prisma.experience.update({
            where: { id: exp.id },
            data: { techTags: JSON.stringify(ids) },
          });
        }
        return {
          ...exp,
          techTags: ids,
          technologies,
        };
      })
    );

    return NextResponse.json(formattedExperience);
  } catch (err) {
    console.error("GET /api/experience error:", err);
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const dataToSave = {
      ...body,
      techTags: JSON.stringify(body.techTags || []),
    };

    const exp = await prisma.experience.create({ data: dataToSave });
    revalidatePath("/");

    const { ids, technologies } = await resolveAndMigrateTechTags(exp.techTags);

    return NextResponse.json(
      {
        ...exp,
        techTags: ids,
        technologies,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/experience error:", err);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
