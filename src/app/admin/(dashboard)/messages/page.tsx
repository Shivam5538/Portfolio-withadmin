import { prisma } from "@/lib/prisma";
import AdminMessagesClient from "@/components/admin/AdminMessagesClient";

async function getMessages() {
  try {
    return await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  // Convert Date objects to ISO strings for client component compatibility
  const formattedMessages = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return <AdminMessagesClient initialMessages={formattedMessages} />;
}
