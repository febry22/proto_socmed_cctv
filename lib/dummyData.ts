import { SeededRandom } from "./seededRandom";
import { CATEGORY_LABELS, GraphLink, GraphNode, SearchResponse, SourceCategory } from "./types";

const NEWS_SOURCES = [
  "Kompas.com",
  "Detik.com",
  "Antara News",
  "CNN Indonesia",
  "Tempo.co",
  "Liputan6.com",
  "Republika.co.id",
  "Tribunnews.com",
];

const NEWS_TEMPLATES = [
  "{kw}: Situasi Terkini di Lapangan",
  "Pemerintah Tanggapi Isu {kw}",
  "Update {kw}: Ini Fakta yang Perlu Diketahui",
  "BNPB Kerahkan Tim Tangani {kw}",
  "Analisis: Dampak {kw} bagi Masyarakat Sekitar",
  "Wawancara Eksklusif Terkait {kw}",
  "{kw} Jadi Sorotan Media Nasional",
  "Kronologi Lengkap Peristiwa {kw}",
];

const SOCIAL_PLATFORMS = ["Twitter/X", "Instagram", "Facebook", "Threads"];

const SOCIAL_HANDLES = [
  "@warganet_aktif",
  "@infoterkini.id",
  "@pantauindonesia",
  "@suarawarga",
  "@updatenews.id",
  "@citizenreport",
  "@viral.hariini",
  "@mediarakyat",
];

const SOCIAL_TEMPLATES = [
  "Astaga, kondisi {kw} makin parah nih di daerah saya 😭",
  "Thread: apa yang sebenarnya terjadi soal {kw}? 🧵",
  "Foto-foto terbaru terkait {kw}, mohon doanya semua 🙏",
  "Kok belum ada tindakan konkret soal {kw} ya?",
  "Update dari lapangan soal {kw}, semoga cepat teratasi",
  "Repost: info penting soal {kw} untuk warga sekitar",
];

const TIKTOK_STREAMERS = [
  "@lapangan_live",
  "@citizenjournalist",
  "@pantauan_langsung",
  "@infolive.id",
  "@warganet_live",
  "@breakingnow",
];

const TIKTOK_TEMPLATES = [
  "LIVE: Pantauan {kw} Langsung dari Lokasi",
  "🔴 LIVE update {kw} detik ini",
  "Siaran langsung kondisi terkini {kw}",
  "LIVE: Tanya jawab soal {kw} bareng warga",
];

const WEB_DOMAINS = [
  "forum-diskusi.id",
  "blogwarga.net",
  "infodaerah.co.id",
  "komunitaspeduli.org",
  "beritawarga.net",
  "arsipnasional.go.id",
];

const WEB_TEMPLATES = [
  "Diskusi Forum: {kw} dan Dampaknya",
  "Arsip Dokumen Terkait {kw}",
  "Laporan Komunitas Soal {kw}",
  "Kumpulan Data Historis {kw}",
  "Blog: Refleksi Warga atas {kw}",
];

function fill(template: string, keyword: string): string {
  return template.replace(/\{kw\}/g, keyword);
}

function buildNewsItem(rnd: SeededRandom, keyword: string, index: number, start: string, end: string): GraphNode {
  return {
    id: `news-${index}`,
    label: fill(rnd.pick(NEWS_TEMPLATES), keyword),
    type: "item",
    category: "news",
    meta: {
      source: rnd.pick(NEWS_SOURCES),
      date: rnd.dateBetween(start, end),
      url: `https://${rnd.pick(NEWS_SOURCES).toLowerCase()}/artikel/${index}`,
      snippet: `Ringkasan berita terkait "${keyword}" dari sumber media nasional. Konten ini adalah data dummy untuk keperluan prototipe.`,
    },
  };
}

function buildSocialItem(rnd: SeededRandom, keyword: string, index: number, start: string, end: string): GraphNode {
  const platform = rnd.pick(SOCIAL_PLATFORMS);
  return {
    id: `social-${index}`,
    label: fill(rnd.pick(SOCIAL_TEMPLATES), keyword),
    type: "item",
    category: "social",
    meta: {
      source: rnd.pick(SOCIAL_HANDLES),
      platform,
      date: rnd.dateBetween(start, end),
      url: `https://example-social.test/post/${index}`,
      snippet: `Postingan warganet di ${platform} yang menyebut kata kunci "${keyword}". Data dummy untuk prototipe.`,
    },
  };
}

function buildTiktokItem(rnd: SeededRandom, keyword: string, index: number): GraphNode {
  return {
    id: `tiktok-${index}`,
    label: fill(rnd.pick(TIKTOK_TEMPLATES), keyword),
    type: "item",
    category: "tiktok_live",
    meta: {
      source: rnd.pick(TIKTOK_STREAMERS),
      platform: "TikTok",
      date: new Date().toISOString(),
      url: `https://tiktok.com/live/${index}`,
      viewers: rnd.int(120, 15000),
      snippet: `Siaran langsung TikTok yang sedang berlangsung terkait "${keyword}". Data dummy untuk prototipe.`,
    },
  };
}

function buildWebItem(rnd: SeededRandom, keyword: string, index: number, start: string, end: string): GraphNode {
  const domain = rnd.pick(WEB_DOMAINS);
  return {
    id: `web-${index}`,
    label: fill(rnd.pick(WEB_TEMPLATES), keyword),
    type: "item",
    category: "web",
    meta: {
      source: domain,
      date: rnd.dateBetween(start, end),
      url: `https://${domain}/page/${index}`,
      snippet: `Halaman web hasil scraping yang membahas "${keyword}". Data dummy untuk prototipe.`,
    },
  };
}

const BUILDERS: Record<
  SourceCategory,
  (rnd: SeededRandom, keyword: string, index: number, start: string, end: string) => GraphNode
> = {
  news: buildNewsItem,
  social: buildSocialItem,
  tiktok_live: (rnd, keyword, index) => buildTiktokItem(rnd, keyword, index),
  web: buildWebItem,
};

const CATEGORY_COUNT_RANGE: Record<SourceCategory, [number, number]> = {
  news: [3, 7],
  social: [4, 8],
  tiktok_live: [1, 5],
  web: [3, 6],
};

export function generateSearchResults(keyword: string, startDate: string, endDate: string): SearchResponse {
  const rnd = new SeededRandom(`${keyword.toLowerCase().trim()}|${startDate}|${endDate}`);

  const rootId = "root";
  const nodes: GraphNode[] = [
    {
      id: rootId,
      label: keyword,
      type: "root",
    },
  ];
  const links: GraphLink[] = [];

  (Object.keys(CATEGORY_LABELS) as SourceCategory[]).forEach((category) => {
    const categoryId = `category-${category}`;
    const [min, max] = CATEGORY_COUNT_RANGE[category];
    const count = rnd.int(min, max);

    nodes.push({
      id: categoryId,
      label: `${CATEGORY_LABELS[category]} (${count})`,
      type: "category",
      category,
    });
    links.push({ source: rootId, target: categoryId });

    for (let i = 0; i < count; i++) {
      const item = BUILDERS[category](rnd, keyword, i, startDate, endDate);
      nodes.push(item);
      links.push({ source: categoryId, target: item.id });
    }
  });

  return {
    keyword,
    dateRange: { start: startDate, end: endDate },
    nodes,
    links,
  };
}
