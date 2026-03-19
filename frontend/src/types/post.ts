export interface Post {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string;
  createdAt?: string;
}
