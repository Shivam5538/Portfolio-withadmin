import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient, getStorageBucketName } from "@/lib/supabaseServer";

/**
 * Recursively traverses all folders and paginates through all items in a Supabase Storage bucket
 * to calculate the exact aggregate byte size of all stored files.
 */
async function calculateBucketTotalBytes(
  supabase: any,
  bucketName: string,
  folderPath: string = ""
): Promise<number> {
  let totalBytes = 0;
  let offset = 0;
  const limit = 100; // Supabase page size limit

  while (true) {
    try {
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

      if (error || !items || items.length === 0) {
        break;
      }

      for (const item of items) {
        // Check if item is a directory (directories don't have id or metadata size)
        const isFolder = !item.id || (!item.metadata && !(item as any).size);

        if (isFolder) {
          const subfolderPath = folderPath ? `${folderPath}/${item.name}` : item.name;
          const subfolderBytes = await calculateBucketTotalBytes(supabase, bucketName, subfolderPath);
          totalBytes += subfolderBytes;
        } else {
          const size = item.metadata?.size || (item as any).size || 0;
          totalBytes += size;
        }
      }

      if (items.length < limit) {
        break; // Reached end of folder items
      }
      offset += limit; // Move to next page
    } catch (err) {
      console.warn(`Error scanning folder "${folderPath}":`, err);
      break;
    }
  }

  return totalBytes;
}

export async function GET() {
  try {
    // 1. Live Supabase PostgreSQL Database Size via pg_database_size()
    let dbSizeBytes = 0;
    try {
      const result: Array<{ size: bigint | number }> = await prisma.$queryRaw`SELECT pg_database_size(current_database()) as size`;
      if (result && result.length > 0 && result[0].size) {
        dbSizeBytes = Number(result[0].size);
      }
    } catch (e) {
      console.warn("Could not query pg_database_size:", e);
    }

    const dbQuotaBytes = 500 * 1024 * 1024; // 500 MB Supabase Free Tier Limit
    const freeDbBytes = Math.max(0, dbQuotaBytes - dbSizeBytes);
    const dbPercentageUsed = parseFloat(((dbSizeBytes / dbQuotaBytes) * 100).toFixed(1));

    // 2. Live Supabase Storage Bucket Size (Paginated & Recursive)
    const supabase = getSupabaseServerClient();
    const bucketName = getStorageBucketName();

    let fileSizeBytes = 0;
    if (supabase) {
      try {
        fileSizeBytes = await calculateBucketTotalBytes(supabase, bucketName, "");
      } catch (err) {
        console.warn("Could not calculate Supabase bucket total size:", err);
      }
    }

    // MediaFile records for category breakdown and fallback
    const mediaFiles = await prisma.mediaFile.findMany();
    const dbFileSum = mediaFiles.reduce((sum, f) => sum + (f.size || 0), 0);

    // If bucket list returned 0 or fewer bytes than DB records sum, use DB file sum
    if (fileSizeBytes === 0 || dbFileSum > fileSizeBytes) {
      fileSizeBytes = dbFileSum;
    }

    const categories: Record<string, number> = {
      Resume: 0,
      "Project Images": 0,
      Profile: 0,
      General: 0,
    };

    mediaFiles.forEach((file) => {
      const cat = file.category || "General";
      categories[cat] = (categories[cat] || 0) + (file.size || 0);
    });

    // File Storage Quota (Default: 1 GB Supabase Free Tier = 1,073,741,824 bytes)
    const siteContent = await prisma.siteContent.findFirst();
    const quotaGB = (siteContent as any)?.storageQuotaGB ?? 1.0;
    const fileQuotaBytes = Math.round(quotaGB * 1024 * 1024 * 1024);

    const freeFileBytes = Math.max(0, fileQuotaBytes - fileSizeBytes);
    const filePercentageUsed = parseFloat(((fileSizeBytes / fileQuotaBytes) * 100).toFixed(1));

    const isLowStorage = filePercentageUsed >= 90 || dbPercentageUsed >= 90;

    let fileStatusColor: "blue" | "amber" | "red" = "blue";
    if (filePercentageUsed >= 90) fileStatusColor = "red";
    else if (filePercentageUsed >= 70) fileStatusColor = "amber";

    let dbStatusColor: "blue" | "amber" | "red" = "blue";
    if (dbPercentageUsed >= 90) dbStatusColor = "red";
    else if (dbPercentageUsed >= 70) dbStatusColor = "amber";

    // Supabase Egress Info
    const supabaseProjectRef = "jkrocowptkrmrntwhsau";
    const supabaseDashboardUrl = `https://supabase.com/dashboard/project/${supabaseProjectRef}/settings/usage`;

    const responseData = {
      // Database Metrics
      dbSizeBytes,
      dbQuotaBytes,
      freeDbBytes,
      dbPercentageUsed,
      dbStatusColor,

      // File Storage Metrics
      fileSizeBytes,
      fileQuotaBytes,
      freeFileBytes,
      filePercentageUsed,
      fileStatusColor,
      storageQuotaGB: quotaGB,

      // Egress & Status
      egressLimitGB: 5,
      supabaseDashboardUrl,
      isLowStorage,
      categories,
      totalFiles: mediaFiles.length,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("GET /api/files/storage-stats error:", err);
    return NextResponse.json({ error: "Failed to calculate storage stats" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { quotaGB } = body;

    if (!quotaGB || typeof quotaGB !== "number" || quotaGB <= 0) {
      return NextResponse.json({ error: "Invalid quota value" }, { status: 400 });
    }

    const siteContent = await prisma.siteContent.findFirst();

    if (siteContent) {
      await prisma.siteContent.update({
        where: { id: siteContent.id },
        data: {
          storageQuotaGB: quotaGB,
        } as any,
      });
    } else {
      await prisma.siteContent.create({
        data: {
          storageQuotaGB: quotaGB,
        } as any,
      });
    }

    return NextResponse.json({ success: true, storageQuotaGB: quotaGB });
  } catch (err) {
    console.error("PUT /api/files/storage-stats error:", err);
    return NextResponse.json({ error: "Failed to update storage quota" }, { status: 500 });
  }
}
