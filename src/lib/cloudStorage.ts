import { put, del } from "@vercel/blob";
import { getSupabaseServerClient, getStorageBucketName } from "./supabaseServer";
import { prisma } from "./prisma";

export interface UploadResult {
  url: string;
  filename: string;
  provider: "supabase" | "vercel-blob";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateCleanObjectPath(
  originalFilename: string,
  category: string
): Promise<{ objectPath: string; cleanFilename: string }> {
  const extIndex = originalFilename.lastIndexOf(".");
  const ext = extIndex !== -1 ? originalFilename.slice(extIndex).toLowerCase() : "";
  const rawBase = extIndex !== -1 ? originalFilename.slice(0, extIndex) : originalFilename;

  const baseSlug = slugify(rawBase) || "file";
  const categorySlug = slugify(category) || "general";

  let cleanFilename = `${baseSlug}${ext}`;
  let objectPath = `uploads/${categorySlug}/${cleanFilename}`;

  // Check if a file with this URL or filename already exists in DB
  try {
    const existing = await prisma.mediaFile.findFirst({
      where: {
        OR: [
          { url: { contains: objectPath } },
          { filename: cleanFilename },
        ],
      },
    });

    if (existing) {
      const suffix = Math.random().toString(36).substring(2, 6);
      cleanFilename = `${baseSlug}-${suffix}${ext}`;
      objectPath = `uploads/${categorySlug}/${cleanFilename}`;
    }
  } catch {
    // If DB check fails, fallback gracefully
  }

  return { objectPath, cleanFilename };
}

/**
 * Uploads a file buffer directly to Cloud Storage (Supabase Storage or Vercel Blob).
 * Throws a clear error if no cloud credentials are provided in .env.
 */
export async function uploadToCloudStorage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  category: string = "General"
): Promise<UploadResult> {
  const { objectPath, cleanFilename } = await generateCleanObjectPath(originalFilename, category);

  // 1. Primary Cloud Provider: Supabase Storage
  const supabase = getSupabaseServerClient();
  const bucketName = getStorageBucketName();

  if (supabase) {
    try {
      // Ensure target bucket exists or auto-create public bucket
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && !buckets.some((b) => b.name === bucketName)) {
          await supabase.storage.createBucket(bucketName, { public: true });
        }
      } catch {
        // Ignore if already exists
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(objectPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(objectPath);

        return {
          url: publicUrlData.publicUrl,
          filename: cleanFilename,
          provider: "supabase",
        };
      }

      // If category subfolder fails, attempt root level object path fallback
      const rootObjectPath = `uploads/${cleanFilename}`;
      const { data: rootData, error: rootError } = await supabase.storage
        .from(bucketName)
        .upload(rootObjectPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!rootError && rootData) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(rootObjectPath);

        return {
          url: publicUrlData.publicUrl,
          filename: cleanFilename,
          provider: "supabase",
        };
      }

      throw new Error(`Supabase upload failed: ${error?.message || rootError?.message}`);
    } catch (err: any) {
      console.error("Supabase Storage upload error:", err);
      throw err;
    }
  }

  // 2. Secondary Cloud Provider: Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(objectPath, buffer, {
        access: "public",
        contentType: mimeType,
      });
      return {
        url: blob.url,
        filename: cleanFilename,
        provider: "vercel-blob",
      };
    } catch (err) {
      console.error("Vercel Blob upload failed:", err);
      throw err;
    }
  }

  // 3. Throw Error if No Cloud Storage credentials configured
  throw new Error(
    "Cloud Storage configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env."
  );
}

/**
 * Deletes a file object directly from Cloud Storage (Supabase Storage or Vercel Blob).
 */
export async function deleteFromCloudStorage(url: string): Promise<boolean> {
  if (!url) return false;

  // 1. Supabase Storage Deletion
  const supabase = getSupabaseServerClient();
  if (supabase && (url.includes("supabase.co") || url.includes("/storage/v1/object/public/"))) {
    try {
      const bucketName = getStorageBucketName();
      const pathSegment = url.split(`/object/public/${bucketName}/`)[1] || url.split("/uploads/").pop();
      if (pathSegment) {
        const objectPath = pathSegment.startsWith("uploads/") ? pathSegment : `uploads/${pathSegment}`;
        const { error } = await supabase.storage.from(bucketName).remove([objectPath, pathSegment]);
        if (!error) return true;
      }
    } catch (err) {
      console.error("Supabase Storage object deletion error:", err);
    }
  }

  // 2. Vercel Blob Deletion
  if (url.includes("vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(url);
      return true;
    } catch (err) {
      console.warn("Vercel Blob deletion failed:", err);
    }
  }

  return false;
}
