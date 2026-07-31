import AdminContactClient from "@/components/admin/AdminContactClient";
import { prisma } from "@/lib/prisma";

export default async function ContactContentPage() {
  const siteContent = await prisma.siteContent.findFirst();

  return <AdminContactClient initialData={siteContent || {}} />;
}
