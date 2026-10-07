import AdminAboutClient from "@/components/admin/AdminAboutClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AboutContentPage() {
  try {
    const siteContent = await prisma.siteContent.findFirst();

    const serialized = siteContent
      ? {
          ...siteContent,
          createdAt: siteContent.createdAt ? siteContent.createdAt.toISOString() : undefined,
          updatedAt: siteContent.updatedAt ? siteContent.updatedAt.toISOString() : undefined,
        }
      : {};

    return <AdminAboutClient initialData={serialized} />;
  } catch (err) {
    console.error("Failed to load about content data:", err);
    return <AdminAboutClient initialData={{}} />;
  }
}

