
import { NewsEvent, ImpactLevel } from "../types";

const CACHE_KEY = 'edgetracker_news_cache';
const CACHE_TIME_KEY = 'edgetracker_news_cache_time';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export interface NewsResponse {
  events: NewsEvent[];
  isCached: boolean;
}

export async function fetchForexNews(): Promise<NewsResponse> {
  const now = Date.now();
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);

  // 1. Check if we have a fresh cache
  if (cachedData && cachedTime && (now - parseInt(cachedTime) < CACHE_DURATION)) {
    return {
      events: JSON.parse(cachedData),
      isCached: true
    };
  }

  try {
    // Attempt to fetch from Forex Factory JSON endpoint
    // Note: In browser apps, direct access to nfs.forexfactory.com is often blocked by CORS.
    // We use a public CORS proxy as a bridge for this request.
    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://nfs.forexfactory.com/ff_calendar_thisweek.json'));
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    const events: NewsEvent[] = data.map((item: any, index: number) => ({
      id: `ff-${index}-${item.date}`,
      name: item.title,
      impact: mapImpact(item.impact),
      currency: item.country,
      time: item.date, // Forex Factory returns ISO strings
      forecast: item.forecast,
      previous: item.previous
    }));

    // Cache the successful result
    localStorage.setItem(CACHE_KEY, JSON.stringify(events));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());

    return {
      events,
      isCached: false
    };
  } catch (error) {
    console.error("Forex Factory fetch failed, using fallback:", error);
    
    // 2. If fetch fails, return previous cache even if expired
    if (cachedData) {
      return {
        events: JSON.parse(cachedData),
        isCached: true
      };
    }

    // 3. Absolute fallback to generated data if nothing else works
    const fallback = getMockNews();
    return {
      events: fallback,
      isCached: true
    };
  }
}

function mapImpact(impact: string): ImpactLevel {
  const low = impact.toLowerCase();
  if (low.includes('high')) return 'high';
  if (low.includes('medium')) return 'medium';
  return 'low';
}

export function getMockNews(): NewsEvent[] {
  const now = new Date();
  const events: NewsEvent[] = [
    {
      id: 'mock-1',
      name: 'Non-Farm Employment Change',
      impact: 'high',
      currency: 'USD',
      time: new Date(now.getTime() + 1000 * 60 * 45).toISOString(),
      forecast: '180K',
      previous: '150K'
    },
    {
      id: 'mock-2',
      name: 'CPI m/m',
      impact: 'high',
      currency: 'EUR',
      time: new Date(now.getTime() + 1000 * 60 * 120).toISOString(),
      forecast: '0.3%',
      previous: '0.2%'
    },
    {
      id: 'mock-3',
      name: 'Unemployment Claims',
      impact: 'medium',
      currency: 'USD',
      time: new Date(now.getTime() + 1000 * 60 * 240).toISOString(),
      forecast: '210K',
      previous: '205K'
    },
    {
      id: 'mock-4',
      name: 'Retail Sales m/m',
      impact: 'medium',
      currency: 'AUD',
      time: new Date(now.getTime() + 1000 * 60 * 15).toISOString(),
      forecast: '0.5%',
      previous: '0.4%'
    }
  ];
  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}
