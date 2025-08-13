
export interface TikTokVideo {
  id?: string;
  text?: string;
  diggCount?: number;
  shareCount?: number;
  playCount?: number;
  commentCount?: number;
  webVideoUrl?: string;
  createTime?: number;
  createTimeISO?: string;
  authorMeta?: {
    name?: string;
  };
}
