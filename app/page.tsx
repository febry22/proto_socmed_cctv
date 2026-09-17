"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import SpiderDiagram from "@/components/SpiderDiagram";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import LoadingState from "@/components/LoadingState";
import ThemeToggle from "@/components/ThemeToggle";
import { GraphNode, SearchResponse } from "@/lib/types";

const EXAMPLE_QUERIES = ["Karhutla", "Banjir Jakarta", "Gempa Cianjur", "Pemilu 2029"];

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export default function Home() {
  const [{ start: defaultStart, end: defaultEnd }] = useState(defaultDateRange);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  async function runSearch(keyword: string, startDate: string, endDate: string) {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword, startDate, endDate }),
      });
      if (!res.ok) throw new Error("Pencarian gagal, coba lagi.");
      const data: SearchResponse = await res.json();
      setResult(data);
    } catch {
      setError("Terjadi kesalahan saat mengambil hasil pencarian.");
    } finally {
      setLoading(false);
    }
  }

  const hasResult = result !== null;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      {hasResult ? (
        <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-neutral-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:flex-row sm:items-center">
          <h1 className="shrink-0 text-lg font-semibold text-indigo-600">SocMed Radar</h1>
          <SearchBar
            initialKeyword={result?.keyword}
            initialStartDate={result?.dateRange.start ?? defaultStart}
            initialEndDate={result?.dateRange.end ?? defaultEnd}
            loading={loading}
            onSearch={runSearch}
          />
          <ThemeToggle />
        </header>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="fixed right-4 top-4 z-30">
            <ThemeToggle />
          </div>
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              SocMed <span className="text-indigo-600">Radar</span>
            </h1>
            <p className="mt-2 text-neutral-500">
              Cari topik &mdash; hasilnya divisualisasikan sebagai peta sumber, bukan daftar tautan.
            </p>
          </div>
          <div className="w-full max-w-3xl">
            <SearchBar
              initialStartDate={defaultStart}
              initialEndDate={defaultEnd}
              loading={loading}
              onSearch={runSearch}
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => runSearch(q, defaultStart, defaultEnd)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasResult && (
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {loading && <LoadingState />}
          {error && !loading && (
            <div className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</div>
          )}
          {!loading && !error && result && (
            <SpiderDiagram data={result} onNodeSelect={setSelectedNode} />
          )}
          <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </main>
      )}
    </div>
  );
}
