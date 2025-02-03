import { cacheService } from './cacheService';

export interface BaseballStats {
  game_date: string;
  player_name: string;
  pitch_type: string;
  release_speed: number | null;
  effective_speed: number | null;
  strikes: number;
  balls: number;
  inning: number;
  stand: string;
  hit_distance_sc: number | null;
  hit_speed: number | null;
  events: string;
  description: string;
  zone: number | null;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
}

export interface PlayerStats {
  player_name: string;
  games_played: number;
  avg_pitch_speed: number;
  total_pitches: number;
  strikes: number;
  balls: number;
  hit_stats: {
    avg_hit_distance: number;
    avg_launch_speed: number;
    total_hits: number;
  };
}

interface FetchStatsOptions {
  startDate?: string;
  endDate?: string;
  bypassCache?: boolean;
}

interface ApiResponse {
  data: BaseballStats[];
  metadata: {
    start_date: string;
    end_date: string;
    total_records: number;
  };
}

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchBaseballStats = async (
  startDate?: string,
  endDate?: string,
  bypassCache: boolean = false
) => {
  const cacheKey = `baseball-stats-${startDate}-${endDate}`;
  
  if (!bypassCache) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) return cachedData;
  }

  try {
    // Get schedule for date range
    const scheduleUrl = `${MLB_API_BASE}/schedule?sportId=1${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}&gameType=R`;
    const scheduleResponse = await fetch(scheduleUrl);
    const scheduleData = await scheduleResponse.json();

    const stats: BaseballStats[] = [];
    
    // Get live feed data for each game
    for (const date of scheduleData.dates || []) {
      for (const game of date.games || []) {
        const gamePk = game.gamePk;
        const feedUrl = `${MLB_API_BASE}.1/game/${gamePk}/feed/live`;
        const feedResponse = await fetch(feedUrl);
        const feedData = await feedResponse.json();

        if (feedData.liveData?.plays?.allPlays) {
          for (const play of feedData.liveData.plays.allPlays) {
            const playEvents = play.playEvents || [];
            for (const event of playEvents) {
              if (event.details) {
                stats.push({
                  game_date: date.date,
                  player_name: play.matchup?.pitcher?.fullName || '',
                  pitch_type: event.details.type?.description || '',
                  release_speed: event.pitchData?.startSpeed || null,
                  effective_speed: event.pitchData?.effectiveSpeed || null,
                  strikes: play.count?.strikes || 0,
                  balls: play.count?.balls || 0,
                  inning: play.about?.inning || 0,
                  stand: play.matchup?.batSide?.code || '',
                  hit_distance_sc: event.hitData?.totalDistance || null,
                  hit_speed: event.hitData?.launchSpeed || null,
                  events: play.result?.event || '',
                  description: play.result?.description || '',
                  zone: event.pitchData?.zone || null,
                  home_team: feedData.gameData?.teams?.home?.name || '',
                  away_team: feedData.gameData?.teams?.away?.name || '',
                  home_score: play.result?.homeScore || 0,
                  away_score: play.result?.awayScore || 0
                });
              }
            }
          }
        }
      }
    }

    cacheService.set(cacheKey, stats, CACHE_DURATION);
    return stats;
  } catch (error) {
    console.error('Error fetching baseball stats:', error);
    throw error;
  }
};

export const fetchPitchTypes = async () => {
  try {
    const response = await fetch(`${MLB_API_BASE}/pitchTypes`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pitch types:', error);
    throw error;
  }
};

export const fetchPlayerStats = async (playerName: string) => {
  try {
    // Search for player
    const searchUrl = `${MLB_API_BASE}/people/search?q=${encodeURIComponent(playerName)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.people && searchData.people.length > 0) {
      const playerId = searchData.people[0].id;
      const statsUrl = `${MLB_API_BASE}/people/${playerId}/stats?stats=gameLog&group=pitching,hitting`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();
      return statsData;
    }
    
    throw new Error('Player not found');
  } catch (error) {
    console.error('Error fetching player stats:', error);
    throw error;
  }
}; 