import { prisma } from "@/lib/prisma";

export interface LogActivityParams {
  section: string;
  entityId?: string | null;
  entityLabel: string;
  action: "create" | "update" | "delete";
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
}

/**
 * Safely creates an ActivityLog record.
 * Any errors encountered during logging are caught and printed to console
 * so that main operational API logic is never broken by log insertion failures.
 */
export async function logActivity({
  section,
  entityId = null,
  entityLabel,
  action,
  oldValue = null,
  newValue = null,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        section,
        entityId,
        entityLabel,
        action,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      },
    });
  } catch (err) {
    console.error("[ActivityLog Error] Failed to record activity log:", err);
  }
}
