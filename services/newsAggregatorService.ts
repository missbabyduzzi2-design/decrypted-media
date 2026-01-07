
import { fetchGuardianNews } from './guardianService';
import { searchGlobalNews } from './geminiService';
import { type Article } from '../types';

// Utility to normalize titles for comparison
const normalizeTitle = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Utility to deduplicate articles based on URL and Title similarity
const deduplicateArticles = (articles: Article[]): Article[] => {
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const uniqueArticles: Article[] = [];

    for (const article of articles) {
        if (!article.url || !article.title) continue;

        const normalizedTitle = normalizeTitle(article.title);
        
        // Check for duplicate URL
        if (seenUrls.has(article.url)) continue;
        
        // Check for duplicate Title (fuzzy match via normalization)
        if (seenTitles.has(normalizedTitle)) continue;

        seenUrls.add(article.url);
        seenTitles.add(normalizedTitle);
        uniqueArticles.push(article);
    }

    return uniqueArticles;
};

export const fetchAggregatedNews = async (
    searchTerm: string, 
    category: string, 
    fromDate?: string, 
    toDate?: string, 
    page: number = 1
): Promise<Article[]> => {
    const promises: Promise<Article[]>[] = [];

    // 1. Always fetch from Guardian (High reliability, structured)
    promises.push(
        fetchGuardianNews(searchTerm, category, fromDate, toDate, page)
            .catch(err => {
                console.warn("Guardian API failed in aggregator:", err);
                return [];
            })
    );

    // 2. Fetch from Gemini Global Search (Broader sources)
    // Only fetch from search on first page to avoid drift, or if search term is specific
    // We limit this to page 1 primarily because 'searchGlobalNews' doesn't support pagination natively in the same way
    if (page === 1) {
        promises.push(
            searchGlobalNews(searchTerm, category)
                .catch(err => {
                    console.warn("Gemini Search failed in aggregator:", err);
                    return [];
                })
        );
    }

    const results = await Promise.all(promises);
    const combined = results.flat();

    // 3. Deduplicate and Sort
    const uniqueArticles = deduplicateArticles(combined);

    // Sort by Date (Desc)
    return uniqueArticles.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
};
