import { cacheService } from './cacheService';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Cache durations
const CACHE_DURATIONS = {
  SEARCH: 5 * 60 * 1000, // 5 minutes
  VIDEO_DETAILS: 30 * 60 * 1000, // 30 minutes
};

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

// Debug log for API key
console.log('YouTube API Key loaded:', YOUTUBE_API_KEY ? 'Yes' : 'No');

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      maxres?: {
        url: string;
      };
      high: {
        url: string;
      };
    };
    publishedAt: string;
  };
}

export interface SearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

interface RequestOptions {
  bypassCache?: boolean;
  pageToken?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
};

export const searchMLBVideos = async (
  query: string,
  maxResults: number = 10,
  options: RequestOptions = {}
): Promise<SearchResponse> => {
  const cacheKey = `youtube_search_${query}_${maxResults}_${options.pageToken || ''}`;
  
  if (!options.bypassCache) {
    const cachedResult = cacheService.get<SearchResponse>(cacheKey);
    if (cachedResult) {
      console.log('Returning cached search results');
      return cachedResult;
    }
  }

  try {
    await throttleRequest();

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured');
    }

    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: maxResults.toString(),
      q: `${query} MLB official`,
      type: 'video',
      channelId: 'UCoLrcjPV5PbUrUyXq5mjc_A', // MLB's official channel ID
      key: YOUTUBE_API_KEY,
      ...(options.pageToken && { pageToken: options.pageToken }),
    });

    const requestUrl = `${YOUTUBE_API_URL}/search?${params}`;
    console.log('Making YouTube API request to:', requestUrl.replace(YOUTUBE_API_KEY, '[REDACTED]'));

    const response = await fetch(requestUrl);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 && data.error?.message?.includes('quota')) {
        throw new Error('YouTube API quota exceeded. Please try again later.');
      }
      throw new Error(data.error?.message || 'Failed to fetch videos');
    }

    const result: SearchResponse = {
      items: data.items || [],
      nextPageToken: data.nextPageToken,
    };

    // Cache the results
    cacheService.set(cacheKey, result, CACHE_DURATIONS.SEARCH);

    return result;
  } catch (error) {
    console.error('Error fetching MLB videos:', error);
    throw error;
  }
};

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo> => {
  const cacheKey = `youtube_video_${videoId}`;
  
  const cachedResult = cacheService.get<YouTubeVideo>(cacheKey);
  if (cachedResult) {
    console.log('Returning cached video details');
    return cachedResult;
  }

  try {
    await throttleRequest();

    const params = new URLSearchParams({
      part: 'snippet',
      id: videoId,
      key: YOUTUBE_API_KEY,
    });

    const response = await fetch(`${YOUTUBE_API_URL}/videos?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch video details');
    }

    const result = data.items[0];
    
    // Cache the result
    cacheService.set(cacheKey, result, CACHE_DURATIONS.VIDEO_DETAILS);

    return result;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

export const formatGameTitle = (title: string): { homeTeam: string; awayTeam: string } => {
  // Example: "Dodgers vs. Padres FULL GAME! Seoul Series Game 1" -> { homeTeam: "Dodgers", awayTeam: "Padres" }
  const teams = title.split(/vs\.?/i)[0].trim().split(' ');
  return {
    homeTeam: teams[0] || 'Unknown',
    awayTeam: teams[1] || 'Unknown',
  };
}; 