import AdminFooterClient from "@/components/admin/AdminFooterClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FooterContentPage() {
  try {
    const siteContent = await prisma.siteContent.findFirst();

    const serialized = siteContent
      ? {
          ...siteContent,
          createdAt: siteContent.createdAt ? siteContent.createdAt.toISOString() : undefined,
          updatedAt: siteContent.updatedAt ? siteContent.updatedAt.toISOString() : undefined,
        }
      : {};

    return <AdminFooterClient initialData={serialized} />;
  } catch (err) {
    console.error("Failed to load footer content data:", err);
    return <AdminFooterClient initialData={{}} />;
  }
}

