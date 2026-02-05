export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
  author: string | null;
  imageUrl: string | null;
  guid: string | null;
}

export interface ParsedFeed {
  title: string;
  items: FeedItem[];
  feedType: "rss" | "atom";
}
