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
  cleanFilename: string,
  mimeType: string = "application/octet-stream"
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
  } catch (localErr: any) {
    console.warn("Local filesystem write not available (serverless read-only environment), falling back to Data URL:", localErr?.message);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    return {
      url: dataUrl,
      filename: cleanFilename,
      provider: "local",
    };
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
  const { objectPath, cleanFilename } = generateCleanObjectPath(originalFilename, category);

  // 1. Primary Cloud Provider: Supabase Storage
  const supabase = getSupabaseServerClient();
  const bucketName = getStorageBucketName();

  if (supabase) {
    try {
      // Attempt upload directly to Supabase Storage bucket
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

      if (error) {
        console.warn(`Supabase Storage upload returned error for ${objectPath}:`, error.message);
        // If error might be due to missing bucket, attempt auto-creation
        if (error.message?.toLowerCase().includes("bucket not found") || error.message?.toLowerCase().includes("not found")) {
          try {
            await supabase.storage.createBucket(bucketName, { public: true });
            const retryRes = await supabase.storage.from(bucketName).upload(objectPath, buffer, {
              contentType: mimeType,
              upsert: true,
            });
            if (!retryRes.error && retryRes.data) {
              const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
              return {
                url: publicUrlData.publicUrl,
                filename: cleanFilename,
                provider: "supabase" as const,
              };
            }
          } catch (createErr) {
            console.warn("Auto create bucket failed:", createErr);
          }
        }
      }
    } catch (err: any) {
      console.warn("Supabase Storage upload threw exception:", err?.message || err);
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
      console.warn("Vercel Blob upload failed:", err);
    }
  }

  // 3. Fallback: Save to Local Public Uploads directory / Data URL
  return await saveToLocalUploads(buffer, objectPath, cleanFilename, mimeType);
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
