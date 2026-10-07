import AdminHeroClient from "@/components/admin/AdminHeroClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HeroContentPage() {
  try {
    const [siteContent, technologies] = await Promise.all([
      prisma.siteContent.findFirst().catch(() => null),
      prisma.technology.findMany({
        orderBy: { name: "asc" },
      }).catch(() => []),
    ]);

    const serializedSiteContent = siteContent
      ? {
          ...siteContent,
          createdAt: siteContent.createdAt ? siteContent.createdAt.toISOString() : undefined,
          updatedAt: siteContent.updatedAt ? siteContent.updatedAt.toISOString() : undefined,
        }
      : {};

    const serializedTechnologies = (technologies || []).map((t) => ({
      ...t,
      createdAt: t.createdAt ? t.createdAt.toISOString() : undefined,
      updatedAt: t.updatedAt ? t.updatedAt.toISOString() : undefined,
    }));

    return (
      <AdminHeroClient 
        initialData={serializedSiteContent} 
        masterTechnologies={serializedTechnologies} 
      />
    );
  } catch (err) {
    console.error("Failed to load hero content data:", err);
    return <AdminHeroClient initialData={{}} masterTechnologies={[]} />;
  }
}

