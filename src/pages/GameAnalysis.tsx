import React, { useState, useEffect } from 'react';
import { RefreshCw, Youtube, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { searchMLBVideos, YouTubeVideo } from '../services/youtubeService';
import { GameEvent, PlayerMetric } from '../types/game';
import VideoAnalyzer from '../components/VideoAnalyzer';

const GameAnalysis = () => {
  const { t } = useTranslation();
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetric[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'youtube' | 'mp4'>('youtube');

  useEffect(() => {
    if (analysisMode === 'youtube') {
      fetchLatestGame();
    }
  }, [analysisMode]);

  const fetchLatestGame = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching latest game...');
      const response = await searchMLBVideos('MLB game highlights 2024', 1);
      console.log('Search response:', response);
      
      if (response.items && response.items.length > 0) {
        console.log('Setting current video:', response.items[0]);
        setCurrentVideo(response.items[0]);
      } else {
        setError(t('analysis.noVideo'));
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      setError(t('analysis.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventsDetected = (newEvents: GameEvent[]) => {
    setEvents(prev => [...newEvents, ...prev].slice(0, 10)); // Keep last 10 events
  };

  const handleMetricsDetected = (newMetrics: PlayerMetric[]) => {
    setPlayerMetrics(prev => {
      const updated = [...prev];
      newMetrics.forEach(metric => {
        const existingIndex = updated.findIndex(p => p.position === metric.position);
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...metric };
        } else {
          updated.push(metric);
        }
      });
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('analysis.title')}</h1>
            {error && (
              <div className="flex items-center gap-2 text-red-400 mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setAnalysisMode('youtube')}
                className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                  analysisMode === 'youtube'
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </button>
              <button
                onClick={() => setAnalysisMode('mp4')}
                className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                  analysisMode === 'mp4'
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                MP4 Upload
              </button>
            </div>
            {analysisMode === 'youtube' && (
              <button
                onClick={fetchLatestGame}
                disabled={isLoading}
                className={`flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? t('analysis.loading') : t('analysis.refresh')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {analysisMode === 'youtube' ? (
              isLoading ? (
                <div className="aspect-video bg-gray-800/50 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFC2]"></div>
                </div>
              ) : currentVideo ? (
                <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                  <div className="aspect-video relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideo.id.videoId}?autoplay=0`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{currentVideo.snippet.title}</h2>
                    <p className="text-gray-400 text-sm">{currentVideo.snippet.description}</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-800/50 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <Youtube className="w-12 h-12 mb-4 opacity-50" />
                  <p>{t('analysis.noVideo')}</p>
                  <button
                    onClick={fetchLatestGame}
                    className="mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {t('analysis.loadLatest')}
                  </button>
                </div>
              )
            ) : (
              <VideoAnalyzer
                onEventsDetected={handleEventsDetected}
                onMetricsDetected={handleMetricsDetected}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4">{t('analysis.playerMetrics')}</h3>
              <div className="space-y-4">
                {playerMetrics.map((player, index) => (
                  <div key={index} className="border-b border-gray-700 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{player.name}</span>
                      <span className="text-sm text-gray-400">{player.position}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(player.stats).map(([key, value]) => (
                        <div key={key} className="text-gray-400">
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {playerMetrics.length === 0 && (
                  <p className="text-gray-400 text-center">{t('analysis.noMetrics')}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4">{t('analysis.events')}</h3>
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
                {events.length === 0 && (
                  <p className="text-gray-400 text-center">{t('analysis.noEvents')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis;