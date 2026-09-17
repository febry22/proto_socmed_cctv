"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import SpiderDiagram, { CATEGORY_COLORS } from "@/components/SpiderDiagram";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import LoadingState from "@/components/LoadingState";
import ThemeToggle from "@/components/ThemeToggle";
import SearchStats from "@/components/SearchStats";
import { CATEGORY_LABELS, GraphNode, SearchResponse, SourceCategory } from "@/lib/types";

const EXAMPLE_QUERIES = ["Karhutla", "Banjir Jakarta", "Gempa Cianjur", "Pemilu 2029"];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Cari topik",
    desc: "Masukkan kata kunci dan rentang tanggal yang ingin dipantau.",
  },
  {
    step: "02",
    title: "Lihat peta sumber",
    desc: "Hasil ditampilkan sebagai diagram interaktif per kategori sumber.",
  },
  {
    step: "03",
    title: "Telusuri detail",
    desc: "Klik salah satu node untuk melihat ringkasan, sumber, dan tautannya.",
  },
];

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
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/20" />
            <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/10" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-100/40 blur-3xl dark:bg-rose-900/10" />
          </div>

          <header className="relative flex items-center justify-between px-6 py-5">
            <span className="text-sm font-semibold text-indigo-600">SocMed Radar</span>
            <ThemeToggle />
          </header>

          <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
              Prototipe pemantauan lintas sumber
            </span>

            <div className="mb-8 mt-4 text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
                SocMed <span className="text-indigo-600">Radar</span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-neutral-500">
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

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-neutral-400">Dipantau dari:</span>
              {(Object.keys(CATEGORY_LABELS) as SourceCategory[]).map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  {CATEGORY_LABELS[category]}
                </span>
              ))}
            </div>

            <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-neutral-200 bg-white/60 p-4 text-left backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  <span className="text-xs font-semibold text-indigo-600">{item.step}</span>
                  <h3 className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <footer className="relative px-6 pb-6 text-center text-xs text-neutral-400">
            Data pada prototipe ini bersifat simulasi, bukan hasil pemantauan langsung.
          </footer>
        </div>
      )}

      {hasResult && (
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {loading && <LoadingState />}
          {error && !loading && (
            <div className="flex flex-1 items-center justify-center text-sm text-red-500">{error}</div>
          )}
          {!loading && !error && result && (
            <>
              <SearchStats data={result} />
              <SpiderDiagram data={result} onNodeSelect={setSelectedNode} />
            </>
          )}
          <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </main>
      )}
    </div>
  );
}
