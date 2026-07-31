import AdminAboutClient from "@/components/admin/AdminAboutClient";
import { prisma } from "@/lib/prisma";

export default async function AboutContentPage() {
  const siteContent = await prisma.siteContent.findFirst();

  return <AdminAboutClient initialData={siteContent || {}} />;
}
