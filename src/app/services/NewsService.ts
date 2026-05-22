// NewsService.ts - Fetches real news from NewsAPI.org
// API Key: d019fcc3203e4f48a678e136a369dc09

const API_KEY = 'd019fcc3203e4f48a678e136a369dc09';
const BASE_URL = 'https://newsapi.org/v2';

export type Article = {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { id: string | null; name: string };
  author: string | null;
  category: string;
};

export type NewsCategory = 'trending' | 'technology' | 'sports' | 'business' | 'health' | 'science' | 'entertainment';

const CATEGORY_MAP: Record<string, string> = {
  trending: 'general',
  technology: 'technology',
  sports: 'sports',
  business: 'business',
  health: 'health',
  science: 'science',
  entertainment: 'entertainment',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapCategory(category: string): string {
  const map: Record<string, string> = {
    general: 'TRENDING',
    technology: 'TECHNOLOGY',
    sports: 'SPORTS',
    business: 'BUSINESS',
    health: 'HEALTH',
    science: 'SCIENCE',
    entertainment: 'ENTERTAINMENT',
  };
  return map[category] || 'NEWS';
}

export async function fetchTopHeadlines(
  category: NewsCategory = 'trending',
  country: string = 'us',
  pageSize: number = 20
): Promise<Article[]> {
  const apiCategory = CATEGORY_MAP[category] || 'general';
  const url = `${BASE_URL}/top-headlines?country=${country}&category=${apiCategory}&pageSize=${pageSize}&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    return (data.articles || [])
      .filter((a: any) => a.title && a.title !== '[Removed]')
      .map((article: any, index: number) => ({
        id: `${index}-${Date.now()}`,
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        url: article.url || '',
        urlToImage: article.urlToImage || null,
        publishedAt: timeAgo(article.publishedAt),
        source: article.source || { id: null, name: 'Unknown' },
        author: article.author || null,
        category: mapCategory(apiCategory),
      }));
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

export async function fetchEverything(
  query: string,
  pageSize: number = 20
): Promise<Article[]> {
  const url = `${BASE_URL}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=publishedAt&language=en&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

    return (data.articles || [])
      .filter((a: any) => a.title && a.title !== '[Removed]')
      .map((article: any, index: number) => ({
        id: `${index}-${Date.now()}`,
        title: article.title || '',
        description: article.description || '',
        content: article.content || '',
        url: article.url || '',
        urlToImage: article.urlToImage || null,
        publishedAt: timeAgo(article.publishedAt),
        source: article.source || { id: null, name: 'Unknown' },
        author: article.author || null,
        category: 'NEWS',
      }));
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
}

export async function fetchTrendingTopics(): Promise<
  Array<{ rank: number; title: string; category: string; time: string }>
> {
  // Fetch general trending and extract top 5
  const articles = await fetchTopHeadlines('trending', 'us', 5);
  return articles.slice(0, 5).map((a, i) => ({
    rank: i + 1,
    title: a.title,
    category: a.category,
    time: a.publishedAt,
  }));
}