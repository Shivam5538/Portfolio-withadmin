import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const start = Date.now();
  const results: {
    postgres: string;
    supabaseRest?: string;
    latencyMs: number;
    timestamp: string;
  } = {
    postgres: "unknown",
    latencyMs: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    // 1. Keep PostgreSQL DB connection alive via Prisma
    await prisma.$queryRaw`SELECT 1`;
    results.postgres = "connected";

    // 2. Touch Supabase client/storage if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from("_prisma_migrations").select("id").limit(1);
      results.supabaseRest = error ? `pinged (${error.code || error.message})` : "connected";
    }

    results.latencyMs = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      message: "Supabase & Database keep-alive ping successful",
      ...results,
    });
  } catch (error) {
    results.latencyMs = Date.now() - start;
    console.error("Keep-alive health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to query database",
        error: error instanceof Error ? error.message : "Unknown error",
        ...results,
      },
      { status: 500 }
    );
  }
}
