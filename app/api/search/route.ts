import { NextRequest, NextResponse } from "next/server";
import { generateSearchResults } from "@/lib/dummyData";
import { SearchRequest } from "@/lib/types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<SearchRequest>;
  const keyword = body.keyword?.trim();

  if (!keyword) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const startDate = body.startDate || weekAgo;
  const endDate = body.endDate || today;

  // Simulated latency to mimic a real AI/search backend.
  await delay(600 + Math.random() * 300);

  const result = generateSearchResults(keyword, startDate, endDate);
  return NextResponse.json(result);
}
