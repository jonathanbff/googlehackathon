import React, { useState } from 'react';
import { Play, Heart, BarChart3, X } from 'lucide-react';

interface GameCardProps {
  homeTeam: string;
  awayTeam: string;
  score?: {
    home: number;
    away: number;
  };
  status: 'live' | 'upcoming' | 'finished';
  timestamp: string;
  thumbnailUrl: string;
  youtubeId?: string;
}

const GameCard: React.FC<GameCardProps> = ({
  homeTeam,
  awayTeam,
  score,
  status,
  timestamp,
  thumbnailUrl,
  youtubeId,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="group relative bg-gray-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-200">
      {/* Thumbnail/Video */}
      <div className="aspect-video relative">
        {isPlaying && youtubeId ? (
          <>
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full z-10"
            />
          </>
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={`${awayTeam} vs ${homeTeam}`}
              className="w-full h-full object-cover"
            />
            {youtubeId && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#00FFC2]/90 text-[#0A1A2F]">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </button>
            )}
            {status === 'live' && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg mb-1">
              {awayTeam} vs {homeTeam}
            </h3>
            <p className="text-sm text-gray-400">{timestamp}</p>
          </div>
          {score && (
            <div className="text-right">
              <div className="font-mono font-bold text-lg">
                {score.away} - {score.home}
              </div>
              <div className="text-xs text-gray-400">
                {status === 'live' ? 'Current Score' : 'Final Score'}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-4">
          {youtubeId ? (
            <button 
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#00FFC2] transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Highlights
            </button>
          ) : (
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#00FFC2] transition-colors">
              <Play className="w-4 h-4" />
              Watch
            </button>
          )}
          <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#00FFC2] transition-colors">
            <Heart className="w-4 h-4" />
            Save
          </button>
          <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#00FFC2] transition-colors">
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard; 