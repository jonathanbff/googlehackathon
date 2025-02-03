import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, Youtube, AlertCircle, ChevronLeft, ChevronRight,
  Upload, Video, Link as LinkIcon, X, Play, Loader
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { searchMLBVideos, YouTubeVideo as YouTubeApiVideo } from '../services/youtubeService';
import { GameEvent, GameEventType } from '../types/game';
import type { PlayerMetric } from '../types/game';
import VideoAnalyzer from '../components/VideoAnalyzer';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

const convertApiVideoToVideo = (apiVideo: YouTubeApiVideo): YouTubeVideo => ({
  id: apiVideo.id.videoId,
  title: apiVideo.snippet.title,
  thumbnail: apiVideo.snippet.thumbnails.maxres?.url || apiVideo.snippet.thumbnails.high.url,
  url: `https://www.youtube.com/watch?v=${apiVideo.id.videoId}`
});

// Event type colors mapping
const EVENT_COLORS: Record<GameEventType, { bg: string; text: string }> = {
  hit: { bg: 'rgba(0, 255, 194, 0.2)', text: '#00FFC2' },
  pitch: { bg: 'rgba(255, 171, 0, 0.2)', text: '#FFAB00' },
  run: { bg: 'rgba(99, 102, 241, 0.2)', text: '#818CF8' },
  out: { bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444' }
};

const VideoInputSection = ({ 
  onVideoSelect, 
  isProcessing 
}: { 
  onVideoSelect: (url: string, type: 'youtube' | 'mp4') => void;
  isProcessing: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      onVideoSelect(url, 'mp4');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      onVideoSelect(url, 'mp4');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
      onVideoSelect(urlInput, 'youtube');
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#00FFC2] mb-2">Upload Game Footage</h2>
        <p className="text-gray-400">Drag & drop video file or paste YouTube URL</p>
      </div>

      {/* File Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          isDragging 
            ? 'border-[#00FFC2] bg-[#00FFC2]/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`p-4 rounded-full bg-gray-700/50 transition-transform duration-300 ${
            isDragging ? 'scale-110' : ''
          }`}>
            <Upload className="w-8 h-8 text-[#00FFC2]" />
          </div>
          <div>
            <p className="font-medium mb-1">Drop video file here or click to browse</p>
            <p className="text-sm text-gray-400">Supports MP4, WebM, and other video formats</p>
          </div>
        </div>
      </div>

      {/* URL Input */}
      <div className="relative">
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00FFC2] text-sm"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!urlInput || isProcessing}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isProcessing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : urlInput
                ? 'bg-[#00FFC2] text-gray-900 hover:bg-[#00FFC2]/90'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 pt-2">
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#00FFC2] transition-colors">
          <Video className="w-4 h-4" />
          Recent Videos
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#00FFC2] transition-colors">
          <Youtube className="w-4 h-4" />
          Browse YouTube
        </button>
      </div>
    </div>
  );
};

interface VideoAnalyzerProps {
  video: YouTubeVideo;
  onEventsDetected: (events: GameEvent[]) => void;
  onMetricsDetected: (metrics: PlayerMetric[]) => void;
}

const GameAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [playerMetrics, setPlayerMetrics] = useState<PlayerMetric[]>([]);
  const [analysisMode, setAnalysisMode] = useState<'youtube' | 'mp4'>('youtube');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLatestGame = async (pageToken?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await searchMLBVideos('MLB game highlights 2024', 1, { pageToken });
      
      if (response && response.items && response.items.length > 0) {
        setCurrentVideo(convertApiVideoToVideo(response.items[0]));
        setNextPageToken(response.nextPageToken);
        setPrevPageTokens(prev => pageToken ? [...prev, pageToken] : prev);
      }
    } catch (error: any) {
      setError(t('errors.fetchFailed'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => prev - 1);
    const prevToken = prevPageTokens[prevPageTokens.length - 1];
    if (prevToken) {
      fetchLatestGame(prevToken);
      setPrevPageTokens(prev => prev.slice(0, -1));
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
    fetchLatestGame(nextPageToken);
  };

  const handleRefresh = () => {
    fetchLatestGame();
  };

  const handleEventsDetected = (newEvents: GameEvent[]) => {
    setEvents(prev => [...prev, ...newEvents]);
  };

  const handleMetricsDetected = (newMetrics: PlayerMetric[]) => {
    setPlayerMetrics(prev => [
      ...prev,
      ...newMetrics.filter(metric => 
        !prev.some(p => p.name === metric.name && p.position === metric.position)
      )
    ]);
  };

  const handleVideoSelect = async (url: string, type: 'youtube' | 'mp4') => {
    try {
      setIsProcessing(true);
      setAnalysisMode(type);
      
      if (type === 'youtube') {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        if (!videoId) throw new Error('Invalid YouTube URL');
        
        setCurrentVideo({
          id: videoId,
          title: 'YouTube Video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          url: url
        });
      } else {
        setCurrentVideo({
          id: 'local',
          title: 'Local Video',
          thumbnail: '',
          url: url
        });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00FFC2]">{t('analysis.title')}</h1>
            <p className="text-gray-400 mt-2">{t('analysis.description')}</p>
          </div>
          
          {error && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={!prevPageTokens.length || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  !prevPageTokens.length || isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span>{currentPage}</span>
              <button
                onClick={handleNextPage}
                disabled={!nextPageToken || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  !nextPageToken || isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Input Section */}
        {!currentVideo && (
          <VideoInputSection 
            onVideoSelect={handleVideoSelect}
            isProcessing={isProcessing}
          />
        )}

        {/* Video Player Section */}
        {currentVideo && (
          <div className="relative bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
            <VideoAnalyzer
              video={currentVideo}
              onEventsDetected={handleEventsDetected}
              onMetricsDetected={handleMetricsDetected}
            />
            <button
              onClick={() => setCurrentVideo(null)}
              className="absolute top-4 right-4 p-2 bg-gray-900/80 rounded-full hover:bg-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Stats */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4">{t('stats.playerStats')}</h2>
            <div className="space-y-4">
              {playerMetrics.map((player, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{player.name}</span>
                    <span className="text-gray-400">{player.position}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(player.stats || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {playerMetrics.length === 0 && (
                <p className="text-gray-400">{t('stats.noPlayerStats')}</p>
              )}
            </div>
          </div>

          {/* Game Events */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('stats.gameEvents')}</h2>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                  style={{ backgroundColor: EVENT_COLORS[event.type].bg }}
                >
                  <span style={{ color: EVENT_COLORS[event.type].text }}>
                    {event.description}
                  </span>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-400">{t('stats.noEvents')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis;