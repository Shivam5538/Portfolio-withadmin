import AdminFooterClient from "@/components/admin/AdminFooterClient";
import { prisma } from "@/lib/prisma";

export default async function FooterContentPage() {
  const siteContent = await prisma.siteContent.findFirst();

  return <AdminFooterClient initialData={siteContent || {}} />;
}
