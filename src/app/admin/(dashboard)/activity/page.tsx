import { prisma } from "@/lib/prisma";
import AdminActivityClient from "@/components/admin/AdminActivityClient";

export const dynamic = "force-dynamic";

async function getInitialActivityLogs() {
  try {
    const limit = 25;
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.activityLog.count(),
    ]);

    const serializedLogs = logs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      oldValue: typeof log.oldValue === "string" ? JSON.parse(log.oldValue) : log.oldValue,
      newValue: typeof log.newValue === "string" ? JSON.parse(log.newValue) : log.newValue,
    }));

    return {
      initialLogs: serializedLogs,
      initialTotal: total,
      initialTotalPages: Math.ceil(total / limit) || 1,
    };
  } catch (err) {
    console.error("Failed to load activity logs:", err);
    return {
      initialLogs: [],
      initialTotal: 0,
      initialTotalPages: 1,
    };
  }
}

export default async function ActivityLogPage() {
  const { initialLogs, initialTotal, initialTotalPages } = await getInitialActivityLogs();

  return (
    <AdminActivityClient
      initialLogs={initialLogs}
      initialTotal={initialTotal}
      initialTotalPages={initialTotalPages}
    />
  );
}
