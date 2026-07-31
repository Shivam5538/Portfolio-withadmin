import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const allLayouts = await prisma.layoutSetting.findMany();
  console.log("All LayoutSetting rows:", allLayouts);

  const byId = await prisma.layoutSetting.findUnique({ where: { id: "default" } });
  console.log("LayoutSetting by id default:", byId);

  const first = await prisma.layoutSetting.findFirst();
  console.log("LayoutSetting findFirst:", first);

  await prisma.$disconnect();
}

run();
