export type SourceCategory = "news" | "social" | "tiktok_live" | "web";

export type Sentiment = "positive" | "negative" | "neutral";

export interface GraphNode {
  id: string;
  label: string;
  type: "root" | "category" | "item";
  category?: SourceCategory;
  meta?: {
    source?: string;
    platform?: string;
    date?: string;
    url?: string;
    snippet?: string;
    viewers?: number;
    sentiment?: Sentiment;
  };
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface SearchResponse {
  keyword: string;
  dateRange: { start: string; end: string };
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface SearchRequest {
  keyword: string;
  startDate: string;
  endDate: string;
}

export const CATEGORY_LABELS: Record<SourceCategory, string> = {
  news: "Berita",
  social: "Media Sosial",
  tiktok_live: "TikTok Live",
  web: "Web Lainnya",
};

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: "Positif",
  negative: "Negatif",
  neutral: "Netral",
};
