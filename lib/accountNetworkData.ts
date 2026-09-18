import { SeededRandom } from "./seededRandom";

export type AccountPlatform =
  | "instagram_reels"
  | "instagram_live"
  | "tiktok_live"
  | "bigo_live"
  | "tv_online"
  | "youtube_live";

export type ActivityRisk = "normal" | "provokatif" | "terkoordinasi";

export interface AccountNode {
  id: string;
  type: "topic" | "platform" | "account" | "load-more";
  label: string;
  platform?: AccountPlatform;
  depth: number;
  meta?: {
    handle?: string;
    followers?: number;
    following?: number;
    activityRisk?: ActivityRisk;
    url?: string;
  };
}

export interface AccountLink {
  source: string;
  target: string;
}

export interface AccountNetworkChunk {
  nodes: AccountNode[];
  links: AccountLink[];
}

export const PLATFORM_LABELS: Record<AccountPlatform, string> = {
  instagram_reels: "Instagram Reels",
  instagram_live: "Instagram Live",
  tiktok_live: "TikTok Live",
  bigo_live: "Bigo Live",
  tv_online: "TV Online Streaming",
  youtube_live: "YouTube Live",
};

export const PLATFORM_COLORS: Record<AccountPlatform, string> = {
  instagram_reels: "#c026d3",
  instagram_live: "#db2777",
  tiktok_live: "#f43f5e",
  bigo_live: "#a855f7",
  tv_online: "#0ea5e9",
  youtube_live: "#dc2626",
};

export const MAX_AUTO_DEPTH = 5;

export const RISK_LABELS: Record<ActivityRisk, string> = {
  normal: "Normal",
  provokatif: "Provokatif",
  terkoordinasi: "Pola Terkoordinasi",
};

export const RISK_COLORS: Record<ActivityRisk, string> = {
  normal: "#94a3b8",
  provokatif: "#dc2626",
  terkoordinasi: "#f59e0b",
};

const RISK_POOL: ActivityRisk[] = ["normal", "normal", "normal", "normal", "normal", "normal", "provokatif", "terkoordinasi"];

const PLATFORM_URL_BASE: Record<AccountPlatform, string> = {
  instagram_reels: "https://instagram.com/",
  instagram_live: "https://instagram.com/",
  tiktok_live: "https://tiktok.com/@",
  bigo_live: "https://bigo.tv/",
  tv_online: "https://tv-online.example/",
  youtube_live: "https://youtube.com/@",
};

const NAME_PREFIXES = ["warga", "info", "pantau", "update", "suara", "citizen", "netizen", "lapangan", "berita", "fokus"];
const NAME_SUFFIXES = ["aktif", "id", "kita", "terkini", "viral", "harian", "sekitar", "lokal", "24jam", "update"];

function buildHandle(rnd: SeededRandom, index: number): string {
  return `@${rnd.pick(NAME_PREFIXES)}${rnd.pick(NAME_SUFFIXES)}${index}`;
}

function buildAccountNode(rnd: SeededRandom, id: string, platform: AccountPlatform, depth: number, index: number): AccountNode {
  const handle = buildHandle(rnd, index);
  return {
    id,
    type: "account",
    label: handle,
    platform,
    depth,
    meta: {
      handle,
      followers: rnd.int(80, 60000),
      following: rnd.int(20, 3000),
      activityRisk: rnd.pick(RISK_POOL),
      url: `${PLATFORM_URL_BASE[platform]}${handle.replace("@", "")}`,
    },
  };
}

export function generateAccountNetworkRoot(keyword: string, startDate: string, endDate: string): AccountNetworkChunk {
  const rnd = new SeededRandom(`net|${keyword.toLowerCase().trim()}|${startDate}|${endDate}`);
  const rootId = "root";
  const nodes: AccountNode[] = [{ id: rootId, type: "topic", label: keyword, depth: 0 }];
  const links: AccountLink[] = [];

  (Object.keys(PLATFORM_LABELS) as AccountPlatform[]).forEach((platform) => {
    const platformId = `platform-${platform}`;
    nodes.push({ id: platformId, type: "platform", label: PLATFORM_LABELS[platform], platform, depth: 1 });
    links.push({ source: rootId, target: platformId });

    const accountCount = rnd.int(2, 4);
    for (let i = 0; i < accountCount; i++) {
      const accountId = `${platformId}-acc${i}`;
      nodes.push(buildAccountNode(rnd, accountId, platform, 2, i));
      links.push({ source: platformId, target: accountId });
    }
  });

  return { nodes, links };
}

export function expandAccount(keyword: string, node: AccountNode): AccountNetworkChunk {
  const platform = node.platform!;

  if (node.depth >= MAX_AUTO_DEPTH) {
    const moreId = `${node.id}-more`;
    return {
      nodes: [{ id: moreId, type: "load-more", label: "Muat lebih banyak", platform, depth: node.depth + 1 }],
      links: [{ source: node.id, target: moreId }],
    };
  }

  const rnd = new SeededRandom(`net|${keyword.toLowerCase().trim()}|${node.id}`);
  const childCount = rnd.int(3, 5);
  const nodes: AccountNode[] = [];
  const links: AccountLink[] = [];
  for (let i = 0; i < childCount; i++) {
    const childId = `${node.id}-f${i}`;
    nodes.push(buildAccountNode(rnd, childId, platform, node.depth + 1, i));
    links.push({ source: node.id, target: childId });
  }
  return { nodes, links };
}

export function expandLoadMore(keyword: string, node: AccountNode): AccountNetworkChunk {
  const platform = node.platform!;
  const rnd = new SeededRandom(`net|${keyword.toLowerCase().trim()}|${node.id}`);
  const childCount = rnd.int(2, 4);
  const nodes: AccountNode[] = [];
  const links: AccountLink[] = [];
  for (let i = 0; i < childCount; i++) {
    const childId = `${node.id}-x${i}`;
    nodes.push(buildAccountNode(rnd, childId, platform, MAX_AUTO_DEPTH, i));
    links.push({ source: node.id, target: childId });
  }
  return { nodes, links };
}
