import { NextResponse } from "next/server";
import { isNotionConfigured, syncNotesToNotion } from "@/lib/data/notion-repository";
import type { Note } from "@/lib/types";

export async function POST(request: Request) {
  if (!isNotionConfigured()) {
    return NextResponse.json({ error: "Notion is not configured" }, { status: 503 });
  }

  try {
    const payload = await request.json();
    if (!payload || !Array.isArray(payload.notes)) {
      return NextResponse.json({ error: "Request must include a notes array" }, { status: 400 });
    }
    const notes = payload.notes as Note[];
    if (notes.some((note) => typeof note?.id !== "string" || typeof note?.title !== "string" || typeof note?.body !== "string")) {
      return NextResponse.json({ error: "Invalid note payload" }, { status: 400 });
    }
    const result = await syncNotesToNotion(notes);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notion note sync failed", error);
    return NextResponse.json({ error: "Unable to sync notes with Notion" }, { status: 502 });
  }
}

export const runtime = "nodejs";
