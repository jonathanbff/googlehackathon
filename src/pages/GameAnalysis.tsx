import React, { useState, useEffect } from 'react';
import { Play, Pause, BarChart2, Activity, Users, Clock, RefreshCw } from 'lucide-react';
import { searchMLBVideos, YouTubeVideo } from '../services/youtubeService';

interface GameEvent {
  timestamp: string;
  type: 'hit' | 'pitch' | 'run' | 'out';
  description: string;
}

interface PlayerMetric {
  name: string;
  position: string;
  stats: {
    pitchSpeed?: number;
    battingAvg?: number;
    pitchCount?: number;
    hits?: number;
  };
}

const GameAnalysis = () => {
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState('00:00');
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetric[]>([]);

  // Simulated game events for demo
  const demoEvents: GameEvent[] = [
    { timestamp: '0:05', type: 'pitch', description: 'Fastball - 95 mph' },
    { timestamp: '0:12', type: 'hit', description: 'Single to right field' },
    { timestamp: '0:25', type: 'run', description: 'Runner advances to second' },
    { timestamp: '0:40', type: 'out', description: 'Fly out to center field' },
  ];

  // Simulated player metrics for demo
  const demoMetrics: PlayerMetric[] = [
    {
      name: 'Shohei Ohtani',
      position: 'P',
      stats: {
        pitchSpeed: 95.5,
        pitchCount: 15,
      },
    },
    {
      name: 'Mookie Betts',
      position: 'RF',
      stats: {
        battingAvg: 0.325,
        hits: 2,
      },
    },
  ];

  useEffect(() => {
    fetchLatestGame();
  }, []);

  const fetchLatestGame = async () => {
    try {
      setIsLoading(true);
      const response = await searchMLBVideos('live game highlights 2024', 1);
      if (response.items.length > 0) {
        setCurrentVideo(response.items[0]);
        // Simulate real game data
        setEvents(demoEvents);
        setPlayerMetrics(demoMetrics);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate game time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const [mins, secs] = prev.split(':').map(Number);
          const newSecs = secs + 1;
          if (newSecs === 60) {
            return `${mins + 1}:00`;
          }
          return `${mins}:${newSecs.toString().padStart(2, '0')}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Live Analysis</h1>
          <button
            onClick={fetchLatestGame}
            className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFC2]"></div>
          </div>
        ) : !currentVideo ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold mb-4">No Game Data Available</h2>
            <p className="text-gray-400">Please check back later for live game updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="aspect-video relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideo.id.videoId}?autoplay=0`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-[#00FFC2] text-[#0A1A2F] p-2 rounded-lg"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <span className="font-mono text-lg">{gameTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold">LIVE</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">{currentVideo.snippet.title}</h2>
                </div>
              </div>
            </div>

            {/* Stats and Events Section */}
            <div className="space-y-6">
              {/* Player Metrics */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#00FFC2]" />
                  <h3 className="text-lg font-bold">Player Metrics</h3>
                </div>
                <div className="space-y-4">
                  {playerMetrics.map((player, index) => (
                    <div key={index} className="border-b border-gray-700 last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{player.name}</span>
                        <span className="text-sm text-gray-400">{player.position}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {player.stats.pitchSpeed && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4 text-[#00FFC2]" />
                            <span>{player.stats.pitchSpeed} mph</span>
                          </div>
                        )}
                        {player.stats.battingAvg && (
                          <div className="flex items-center gap-1">
                            <BarChart2 className="w-4 h-4 text-[#00FFC2]" />
                            <span>AVG: {player.stats.battingAvg}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Events */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#00FFC2]" />
                  <h3 className="text-lg font-bold">Live Events</h3>
                </div>
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-sm font-mono text-gray-400">{event.timestamp}</span>
                      <div>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-bold mb-1"
                          style={{
                            backgroundColor: {
                              hit: 'rgba(0, 255, 194, 0.2)',
                              pitch: 'rgba(255, 171, 0, 0.2)',
                              run: 'rgba(99, 102, 241, 0.2)',
                              out: 'rgba(239, 68, 68, 0.2)',
                            }[event.type],
                            color: {
                              hit: '#00FFC2',
                              pitch: '#FFAB00',
                              run: '#818CF8',
                              out: '#EF4444',
                            }[event.type],
                          }}
                        >
                          {event.type.toUpperCase()}
                        </span>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameAnalysis;