const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

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

export const searchMLBVideos = async (
  query: string,
  maxResults: number = 10,
  pageToken?: string
): Promise<SearchResponse> => {
  try {
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
      ...(pageToken && { pageToken }),
    });

    const requestUrl = `${YOUTUBE_API_URL}/search?${params}`;
    console.log('Making YouTube API request to:', requestUrl.replace(YOUTUBE_API_KEY, '[REDACTED]'));

    const response = await fetch(requestUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API error:', data.error);
      throw new Error(data.error?.message || 'Failed to fetch videos');
    }

    console.log('YouTube API response:', {
      itemCount: data.items?.length || 0,
      hasNextPage: !!data.nextPageToken,
    });

    return {
      items: data.items || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching MLB videos:', error);
    throw error;
  }
};

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo> => {
  try {
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

    return data.items[0];
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