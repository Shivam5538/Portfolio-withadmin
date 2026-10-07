import AdminContactClient from "@/components/admin/AdminContactClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactContentPage() {
  try {
    const siteContent = await prisma.siteContent.findFirst();

    const serialized = siteContent
      ? {
          ...siteContent,
          createdAt: siteContent.createdAt ? siteContent.createdAt.toISOString() : undefined,
          updatedAt: siteContent.updatedAt ? siteContent.updatedAt.toISOString() : undefined,
        }
      : {};

    return <AdminContactClient initialData={serialized} />;
  } catch (err) {
    console.error("Failed to load contact content data:", err);
    return <AdminContactClient initialData={{}} />;
  }
}

