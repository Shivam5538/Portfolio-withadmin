import { PrismaClient } from "@prisma/client";
import { findAutoIcon } from "../src/lib/iconStore";
import { LAYOUT_TEMPLATES } from "../src/lib/templates";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Technologies & Slot Assignments...");

  const techData = [
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "TypeScript", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Docker", category: "Tools" },
    { name: "Figma", category: "Design" },
    { name: "Prisma", category: "Backend" },
    { name: "PostgreSQL", category: "Backend" },
    { name: "Git", category: "Tools" },
    { name: "MongoDB", category: "Backend" },
    { name: "JavaScript", category: "Frontend" },
    { name: "GraphQL", category: "Backend" },
    { name: "Python", category: "Backend" },
    { name: "Vue.js", category: "Frontend" },
    { name: "Go", category: "Backend" },
  ];

  const techMap = new Map<string, string>();

  for (const t of techData) {
    const auto = findAutoIcon(t.name);
    const existing = await prisma.technology.findFirst({ where: { name: t.name } });

    if (existing) {
      techMap.set(t.name.toLowerCase(), existing.id);
    } else {
      const created = await prisma.technology.create({
        data: {
          name: t.name,
          category: t.category,
          iconKey: auto.key,
        },
      });
      techMap.set(t.name.toLowerCase(), created.id);
    }
  }

  // Ensure LayoutSetting default
  await prisma.layoutSetting.upsert({
    where: { id: "default" },
    update: { activeTemplateId: "template_1" },
    create: { id: "default", activeTemplateId: "template_1" },
  });

  // Seed Slot Assignments for Template 1
  const t1 = LAYOUT_TEMPLATES[0];
  for (const slot of t1.slots) {
    if (slot.defaultTechName) {
      const techId = techMap.get(slot.defaultTechName.toLowerCase());
      if (techId) {
        await prisma.slotAssignment.upsert({
          where: {
            templateId_slotId: {
              templateId: t1.id,
              slotId: slot.slotId,
            },
          },
          update: { technologyId: techId },
          create: {
            templateId: t1.id,
            slotId: slot.slotId,
            technologyId: techId,
          },
        });
      }
    }
  }

  console.log("✅ Seeding technologies & slot assignments completed!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
