
import { type Article } from '../types';

const API_KEY = '023c3e8c-ac69-45da-b648-54a3a797d7aa';
const BASE_URL = 'https://content.guardianapis.com/search';

export const fetchGuardianNews = async (searchTerm: string, category: string, fromDate?: string, toDate?: string, page: number = 1): Promise<Article[]> => {
  const params = new URLSearchParams();
  params.append('api-key', API_KEY);
  params.append('show-fields', 'bodyText,headline,trailText,byline,firstPublicationDate,thumbnail');
  params.append('page-size', '15');
  params.append('order-by', 'newest');
  params.append('page', page.toString());

  if (searchTerm) {
    params.append('q', searchTerm);
  }

  if (category && category !== 'All') {
    const sectionMap: Record<string, string> = {
        'Politics': 'politics',
        'Technology': 'technology',
        'Finance': 'business',
        'World': 'world',
        'Science': 'science',
        'Environment': 'environment',
        'Culture': 'culture',
        'Music': 'music',
        'Film': 'film'
    };
    
    if (sectionMap[category]) {
        params.append('section', sectionMap[category]);
    }
  }

  if (fromDate) {
      params.append('from-date', fromDate);
  }

  if (toDate) {
      params.append('to-date', toDate);
  }

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!res.ok) {
        throw new Error(`Guardian API Connection Failed: ${res.status} ${res.statusText}`);
    }
    
    const json = await res.json();
    
    if (!json.response || !json.response.results) {
        throw new Error("Invalid response format from Intelligence Feed");
    }

    return json.response.results.map((item: any) => ({
      id: item.id,
      title: item.fields.headline,
      // Remove HTML tags from trailText
      description: (item.fields.trailText || '').replace(/<[^>]+>/g, ''),
      content: item.fields.bodyText || '',
      date: item.webPublicationDate.split('T')[0],
      category: item.sectionName,
      location: 'Global', // Guardian API doesn't consistently provide a simple location field
      url: item.webUrl
    }));

  } catch (error) {
    console.error("News stream interrupted:", error);
    // Directly throw the error to trigger the UI error state. 
    // No mock data fallbacks allowed.
    throw error;
  }
};
