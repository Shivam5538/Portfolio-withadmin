import { put, del } from "@vercel/blob";
import { getSupabaseServerClient, getStorageBucketName } from "./supabaseServer";
import fs from "fs/promises";
import path from "path";
import dns from "dns/promises";

export interface UploadResult {
  url: string;
  filename: string;
  provider: "supabase" | "vercel-blob" | "local";
}

import https from "https";
import http from "http";

function checkUrlReachable(urlStr: string, timeoutMs = 800): Promise<boolean> {
  if (process.env.STORAGE_PROVIDER === "local") return Promise.resolve(false);
  return new Promise((resolve) => {
    let settled = false;
    let req: any = null;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        if (req) {
          try {
            req.destroy();
          } catch {}
        }
        resolve(false);
      }
    }, timeoutMs);

    try {
      const parsed = new URL(urlStr);
      const reqModule = parsed.protocol === "https:" ? https : http;
      req = reqModule.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
          path: "/auth/v1/health",
          method: "GET",
        },
        (res) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(Boolean(res.statusCode && res.statusCode < 500));
          }
        }
      );

      req.on("error", () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(false);
        }
      });

      req.end();
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    }
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateCleanObjectPath(
  originalFilename: string,
  category: string
): { objectPath: string; cleanFilename: string } {
  const extIndex = originalFilename.lastIndexOf(".");
  const ext = extIndex !== -1 ? originalFilename.slice(extIndex).toLowerCase() : "";
  const rawBase = extIndex !== -1 ? originalFilename.slice(0, extIndex) : originalFilename;

  const baseSlug = slugify(rawBase) || "file";
  const categorySlug = slugify(category) || "general";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const cleanFilename = `${baseSlug}-${uniqueSuffix}${ext}`;
  const objectPath = `uploads/${categorySlug}/${cleanFilename}`;

  return { objectPath, cleanFilename };
}

async function saveToLocalUploads(
  buffer: Buffer,
  objectPath: string,
  cleanFilename: string
): Promise<UploadResult> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const fullPath = path.join(publicDir, objectPath);
    const dirPath = path.dirname(fullPath);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    return {
      url: `/${objectPath.replace(/\\/g, "/")}`,
      filename: cleanFilename,
      provider: "local",
    };
  } catch (localErr) {
    console.error("Local filesystem upload fallback error:", localErr);
    throw localErr;
  }
}

/**
 * Uploads a file buffer directly to Cloud Storage (Supabase Storage, Vercel Blob, or local fallback).
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  if (supabase && supabaseUrl && (await checkUrlReachable(supabaseUrl))) {
    try {
      const uploadSupabase = async () => {
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
            provider: "supabase" as const,
          };
        }

        // Fallback to root object path if category folder upload fails
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
            provider: "supabase" as const,
          };
        }

        throw new Error(`Supabase upload error: ${error?.message || rootError?.message}`);
      };

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Supabase Storage upload timed out")), 2000);
      });

      return await Promise.race([uploadSupabase(), timeoutPromise]);
    } catch (err: any) {
      console.warn("Supabase Storage unreachable or timed out, falling back to local storage:", err?.message || err);
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
      console.warn("Vercel Blob upload failed, falling back to local storage:", err);
    }
  }

  // 3. Fallback: Save to Local Public Uploads directory
  return await saveToLocalUploads(buffer, objectPath, cleanFilename);
}

/**
 * Deletes a file object directly from Cloud Storage (Supabase Storage, Vercel Blob, or local filesystem).
 */
export async function deleteFromCloudStorage(url: string): Promise<boolean> {
  if (!url) return false;

  // 1. Local filesystem deletion
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    try {
      const cleanPath = url.startsWith("/") ? url.slice(1) : url;
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      // Ignore if file doesn't exist
    }
  }

  // 2. Supabase Storage Deletion
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

  // 3. Vercel Blob Deletion
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
