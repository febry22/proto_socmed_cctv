import { CATEGORY_COLORS } from "@/components/SpiderDiagram";
import { CATEGORY_LABELS, SearchResponse, SourceCategory } from "@/lib/types";

interface SearchStatsProps {
  data: SearchResponse;
}

export default function SearchStats({ data }: SearchStatsProps) {
  const items = data.nodes.filter((n) => n.type === "item");
  const totalMentions = items.length;

  const countByCategory = (Object.keys(CATEGORY_LABELS) as SourceCategory[]).map((category) => ({
    category,
    count: items.filter((n) => n.category === category).length,
  }));

  const topCategory = countByCategory.reduce(
    (max, current) => (current.count > max.count ? current : max),
    countByCategory[0]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-baseline gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{totalMentions}</span>
        <span className="text-xs text-neutral-500">total mentions</span>
      </div>

      {countByCategory.map(({ category, count }) => (
        <div
          key={category}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
          <span className="font-medium text-neutral-800 dark:text-neutral-100">{count}</span>
          <span className="text-neutral-500 dark:text-neutral-400">{CATEGORY_LABELS[category]}</span>
        </div>
      ))}

      {totalMentions > 0 && (
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          Terbanyak: {CATEGORY_LABELS[topCategory.category]}
        </div>
      )}
    </div>
  );
}
