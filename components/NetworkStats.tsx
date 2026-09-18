import { AccountNetworkChunk, AccountPlatform, PLATFORM_COLORS, PLATFORM_LABELS } from "@/lib/accountNetworkData";

interface NetworkStatsProps {
  data: AccountNetworkChunk;
}

export default function NetworkStats({ data }: NetworkStatsProps) {
  const accounts = data.nodes.filter((n) => n.type === "account");
  const totalAccounts = accounts.length;

  const countByPlatform = (Object.keys(PLATFORM_LABELS) as AccountPlatform[]).map((platform) => ({
    platform,
    count: accounts.filter((n) => n.platform === platform).length,
  }));

  const topPlatform = countByPlatform.reduce(
    (max, current) => (current.count > max.count ? current : max),
    countByPlatform[0]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-baseline gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{totalAccounts}</span>
        <span className="text-xs text-neutral-500">akun termuat</span>
      </div>

      {countByPlatform.map(({ platform, count }) => (
        <div
          key={platform}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] }} />
          <span className="font-medium text-neutral-800 dark:text-neutral-100">{count}</span>
          <span className="text-neutral-500 dark:text-neutral-400">{PLATFORM_LABELS[platform]}</span>
        </div>
      ))}

      {totalAccounts > 0 && (
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          Terbanyak: {PLATFORM_LABELS[topPlatform.platform]}
        </div>
      )}
    </div>
  );
}
