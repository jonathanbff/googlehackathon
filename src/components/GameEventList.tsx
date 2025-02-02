import React from 'react';
import { GameEvent } from '../types/game';
import { Baseline as Baseball, Timer as Running, Shield, Target, Award } from 'lucide-react';

interface GameEventListProps {
  events: GameEvent[];
}

const EventIcon = ({ type }: { type: GameEvent['event_type'] }) => {
  switch (type) {
    case 'pitch':
      return <Baseball className="w-5 h-5 text-blue-400" />;
    case 'hit':
      return <Target className="w-5 h-5 text-green-400" />;
    case 'fielding':
      return <Shield className="w-5 h-5 text-yellow-400" />;
    case 'base_running':
      return <Running className="w-5 h-5 text-purple-400" />;
    case 'score':
      return <Award className="w-5 h-5 text-red-400" />;
    default:
      return null;
  }
};

const GameEventList: React.FC<GameEventListProps> = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div 
          key={`${event.timestamp}-${index}`}
          className="bg-[#1A2A3F] rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <EventIcon type={event.event_type} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Inning {event.inning} ({event.half})
                </div>
                <div className="text-sm text-gray-400">
                  {event.timestamp}
                </div>
              </div>
              <p className="mt-1 text-white">{event.description}</p>
              
              {/* Event-specific details */}
              {event.pitch && (
                <div className="mt-2 text-sm text-gray-300">
                  <span className="font-semibold">{event.pitch.pitcher_name}</span> - 
                  {event.pitch.pitch_type} ({event.pitch.pitch_speed_mph} mph)
                </div>
              )}
              
              {event.hit && (
                <div className="mt-2 text-sm text-gray-300">
                  <span className="font-semibold">{event.hit.batter_name}</span> - 
                  {event.hit.hit_type} ({event.hit.exit_velocity_mph} mph, {event.hit.launch_angle_deg}°)
                </div>
              )}
              
              {event.scoring_play && (
                <div className="mt-2 text-sm text-green-400 font-semibold">
                  Run scored by {event.scoring_play.runner_name}
                  {event.scoring_play.rbi && ' (RBI)'}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameEventList; 