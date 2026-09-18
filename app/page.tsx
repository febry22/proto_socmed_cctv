"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import AccountNetworkDiagram from "@/components/AccountNetworkDiagram";
import AccountDetailPanel from "@/components/AccountDetailPanel";
import LoadingState from "@/components/LoadingState";
import ThemeToggle from "@/components/ThemeToggle";
import NetworkStats from "@/components/NetworkStats";
import AlertPanel from "@/components/AlertPanel";
import { computeNetworkAlerts } from "@/lib/networkAlerts";
import {
  AccountNetworkChunk,
  AccountNode,
  MAX_AUTO_DEPTH,
  PLATFORM_COLORS,
  PLATFORM_LABELS,
  AccountPlatform,
  expandAccount,
  expandLoadMore,
  generateAccountNetworkRoot,
} from "@/lib/accountNetworkData";

const EXAMPLE_QUERIES = ["Demonstrasi", "Kerusuhan", "Pemilu"];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Cari topik",
    desc: "Masukkan kata kunci dan rentang tanggal yang ingin dipantau.",
  },
  {
    step: "02",
    title: "Lihat peta akun",
    desc: "Akun yang live membahas topik tersebut ditampilkan per platform.",
  },
  {
    step: "03",
    title: "Telusuri jaringan",
    desc: `Klik akun untuk memuat following/follower-nya hingga ${MAX_AUTO_DEPTH} level.`,
  },
];

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [{ start: defaultStart, end: defaultEnd }] = useState(defaultDateRange);
  const [keyword, setKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: defaultStart, end: defaultEnd });
  const [network, setNetwork] = useState<AccountNetworkChunk | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<AccountNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [alertBaseline, setAlertBaseline] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  function announceNewAlerts(chunk: AccountNetworkChunk, baseline: number) {
    const alertCount = computeNetworkAlerts(chunk).length;
    if (alertCount > baseline) {
      const delta = alertCount - baseline;
      setToast(`${delta} aktivitas baru terindikasi`);
      setTimeout(() => setToast(null), 5000);
    }
    setAlertBaseline(alertCount);
  }

  async function runSearch(kw: string, startDate: string, endDate: string) {
    setLoading(true);
    setSelectedNode(null);
    await delay(500 + Math.random() * 300);
    const chunk = generateAccountNetworkRoot(kw, startDate, endDate);
    setKeyword(kw);
    setDateRange({ start: startDate, end: endDate });
    setNetwork(chunk);
    setExpandedIds(new Set());
    setAlertBaseline(0);
    announceNewAlerts(chunk, 0);
    setLoading(false);
  }

  function handleExpand(node: AccountNode) {
    if (expandedIds.has(node.id) || !network) return;
    const addition = node.type === "load-more" ? expandLoadMore(keyword, node) : expandAccount(keyword, node);
    const nextChunk: AccountNetworkChunk = {
      nodes: [...network.nodes, ...addition.nodes],
      links: [...network.links, ...addition.links],
    };
    setNetwork(nextChunk);
    setExpandedIds((prev) => new Set(prev).add(node.id));
    announceNewAlerts(nextChunk, alertBaseline);
  }

  const hasResult = network !== null;
  const alerts = network ? computeNetworkAlerts(network) : [];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      {hasResult ? (
        <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-neutral-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:flex-row sm:items-center">
          <h1 className="shrink-0 text-lg font-semibold text-indigo-600">SocMed Radar</h1>
          <SearchBar
            initialKeyword={keyword}
            initialStartDate={dateRange.start}
            initialEndDate={dateRange.end}
            loading={loading}
            onSearch={runSearch}
          />
          <div className="flex shrink-0 items-center gap-2">
            <AlertPanel alerts={alerts} onSelect={setSelectedNode} />
            <ThemeToggle />
          </div>
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
              Prototipe pemetaan jaringan akun
            </span>

            <div className="mb-8 mt-4 text-center">
              <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
                SocMed <span className="text-indigo-600">Radar</span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-neutral-500">
                Cari topik &mdash; telusuri akun yang live membahasnya, lalu jaringan follower/following-nya.
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
              {(Object.keys(PLATFORM_LABELS) as AccountPlatform[]).map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] }} />
                  {PLATFORM_LABELS[platform]}
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
                  <h3 className="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">{item.title}</h3>
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
          {!loading && network && (
            <>
              <NetworkStats data={network} />
              <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-6 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
                <span>Klik lingkaran akun untuk memuat following/follower-nya</span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span>Maksimal {MAX_AUTO_DEPTH} level otomatis, setelah itu pakai &ldquo;Muat lebih&rdquo;</span>
              </div>
              <AccountNetworkDiagram
                data={network}
                onExpand={handleExpand}
                onSelect={setSelectedNode}
                selectedId={selectedNode?.id}
              />
            </>
          )}
          <AccountDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </main>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-xs font-medium text-red-600 shadow-lg dark:border-red-900 dark:bg-neutral-900 dark:text-red-400">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
          {toast}
        </div>
      )}
    </div>
  );
}
