import { CATEGORY_LABELS, GraphNode } from "@/lib/types";

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const open = node !== null && node.type === "item";

  return (
    <aside
      className={`fixed right-0 top-0 z-20 h-full w-full max-w-sm transform border-l border-neutral-200 bg-white p-6 shadow-xl transition-transform duration-300 ease-out dark:border-neutral-800 dark:bg-neutral-950 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {node && node.type === "item" && (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              {node.category ? CATEGORY_LABELS[node.category] : ""}
            </span>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
              aria-label="Tutup"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h2 className="text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
            {node.label}
          </h2>

          <dl className="space-y-3 text-sm">
            {node.meta?.source && (
              <div>
                <dt className="text-neutral-400">Sumber</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{node.meta.source}</dd>
              </div>
            )}
            {node.meta?.platform && (
              <div>
                <dt className="text-neutral-400">Platform</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{node.meta.platform}</dd>
              </div>
            )}
            {node.meta?.date && (
              <div>
                <dt className="text-neutral-400">Tanggal</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{formatDate(node.meta.date)}</dd>
              </div>
            )}
            {typeof node.meta?.viewers === "number" && (
              <div>
                <dt className="text-neutral-400">Penonton saat ini</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">
                  {node.meta.viewers.toLocaleString("id-ID")} orang
                </dd>
              </div>
            )}
            {node.meta?.snippet && (
              <div>
                <dt className="text-neutral-400">Ringkasan</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{node.meta.snippet}</dd>
              </div>
            )}
          </dl>

          {node.meta?.url && (
            <a
              href={node.meta.url}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Buka Sumber (dummy)
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
