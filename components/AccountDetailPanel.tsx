import { AccountNode, PLATFORM_LABELS, RISK_COLORS, RISK_LABELS } from "@/lib/accountNetworkData";

interface AccountDetailPanelProps {
  node: AccountNode | null;
  onClose: () => void;
}

export default function AccountDetailPanel({ node, onClose }: AccountDetailPanelProps) {
  const open = node !== null && node.type === "account";

  return (
    <aside
      className={`fixed right-0 top-0 z-20 h-full w-full max-w-sm transform border-l border-neutral-200 bg-white p-6 shadow-xl transition-transform duration-300 ease-out dark:border-neutral-800 dark:bg-neutral-950 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {node && node.type === "account" && (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {node.platform ? PLATFORM_LABELS[node.platform] : ""}
              </span>
              {node.meta?.activityRisk && node.meta.activityRisk !== "normal" && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `${RISK_COLORS[node.meta.activityRisk]}1A`,
                    color: RISK_COLORS[node.meta.activityRisk],
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RISK_COLORS[node.meta.activityRisk] }} />
                  {RISK_LABELS[node.meta.activityRisk]}
                </span>
              )}
            </div>
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

          <h2 className="text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-100">{node.label}</h2>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-neutral-400">Level jaringan</dt>
              <dd className="text-neutral-700 dark:text-neutral-300">
                {node.depth === 2 ? "Akun teratas (membahas topik)" : `Follower/Following level ${node.depth}`}
              </dd>
            </div>
            {typeof node.meta?.followers === "number" && (
              <div>
                <dt className="text-neutral-400">Followers</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{node.meta.followers.toLocaleString("id-ID")}</dd>
              </div>
            )}
            {typeof node.meta?.following === "number" && (
              <div>
                <dt className="text-neutral-400">Following</dt>
                <dd className="text-neutral-700 dark:text-neutral-300">{node.meta.following.toLocaleString("id-ID")}</dd>
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
              Buka Profil (dummy)
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
