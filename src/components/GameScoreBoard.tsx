import React from 'react';
import { Teams, FinalScore } from '../types/game';

interface GameScoreBoardProps {
  teams: Teams;
  score: FinalScore;
  isLive?: boolean;
}

const GameScoreBoard: React.FC<GameScoreBoardProps> = ({ teams, score, isLive = false }) => {
  return (
    <div className="bg-[#1A2A3F] rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {isLive ? 'Live Score' : 'Final Score'}
        </h2>
        {isLive && (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
            <span className="text-red-500 text-sm font-medium">LIVE</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{teams.home.team_name}</h3>
            <p className="text-sm text-gray-400">Home</p>
          </div>
          <div className="text-3xl font-bold text-white">{score.home}</div>
        </div>
        
        {/* Visitor Team */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{teams.visitor.team_name}</h3>
            <p className="text-sm text-gray-400">Visitor</p>
          </div>
          <div className="text-3xl font-bold text-white">{score.visitor}</div>
        </div>
      </div>
    </div>
  );
};

export default GameScoreBoard; 