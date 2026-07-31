import AdminHeroClient from "@/components/admin/AdminHeroClient";
import { prisma } from "@/lib/prisma";

export default async function HeroContentPage() {
  const [siteContent, technologies] = await Promise.all([
    prisma.siteContent.findFirst(),
    prisma.technology.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminHeroClient 
      initialData={siteContent || {}} 
      masterTechnologies={technologies || []} 
    />
  );
}
