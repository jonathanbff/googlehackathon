import React, { useState, useEffect } from 'react';
import { Game } from '../types/game';
import GameScoreBoard from '../components/GameScoreBoard';
import GameEventList from '../components/GameEventList';

const GameAnalysis: React.FC = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchGameData = async () => {
      try {
        // Simulated API call - replace with actual endpoint
        const response = await fetch('/api/game/current');
        const data = await response.json();
        setGame(data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFC2]"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Game Data Available</h2>
          <p className="text-gray-400">Please check back later for live game updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score and Team Info */}
        <div className="lg:col-span-1">
          <GameScoreBoard 
            teams={game.teams} 
            score={game.final_score}
            isLive={true}
          />
          
          <div className="mt-6 bg-[#1A2A3F] rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Game Info</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="text-gray-400">Date:</span>{' '}
                {new Date(game.date).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-400">Game ID:</span>{' '}
                {game.game_id}
              </p>
            </div>
          </div>
        </div>

        {/* Game Events */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Game Events</h2>
          <GameEventList events={game.events} />
        </div>
      </div>
    </div>
  );
};

export default GameAnalysis;