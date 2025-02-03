export interface Team {
  team_id: string;
  team_name: string;
}

export interface Teams {
  home: Team;
  visitor: Team;
}

export interface Pitch {
  pitcher_id: string;
  pitcher_name: string;
  pitch_type: string;
  pitch_speed_mph: number;
}

export interface Batter {
  batter_id: string;
  batter_name: string;
  batting_hand: 'left' | 'right';
}

export interface PitchResult {
  outcome: string;
  call: string;
}

export interface Hit {
  batter_id: string;
  batter_name: string;
  hit_type: string;
  exit_velocity_mph: number;
  launch_angle_deg: number;
  hit_location: string;
}

export interface Runner {
  runner_id: string;
  start_base: string;
  end_base: string;
  run_scored: boolean;
}

export interface Fielder {
  fielder_id: string;
  fielder_name: string;
  position: string;
}

export interface Throw {
  throw_speed_mph: number;
  throw_target: string;
}

export interface BaseRunner {
  runner_id: string;
  runner_name: string;
  start_base: string;
  end_base: string;
  steal_success: boolean;
}

export interface ScoringPlay {
  batter_id: string;
  batter_name: string;
  runner_id: string;
  runner_name: string;
  run_scored: boolean;
  rbi: boolean;
}

export type GameEventType = 'pitch' | 'hit' | 'run' | 'out';

export interface GameEvent {
  type: GameEventType;
  timestamp: string;
  description: string;
  inning: number;
  half: 'top' | 'bottom';
  details?: {
    pitchSpeed?: number;
    pitchType?: string;
    exitVelocity?: number;
    hitType?: string;
    location?: string;
    result?: string;
  };
}

export interface PlayerStats {
  name: string;
  position: string;
  stats: {
    [key: string]: string | number;
  };
  highlights?: string[];
}

export interface GameStats {
  players: PlayerStats[];
  events: GameEvent[];
  summary: {
    pitching: {
      strikeRate: string;
      firstPitchStrikes: string;
      groundBallRate: string;
      swingMissRate: string;
    };
    batting: {
      teamBabip: string;
      hardHitRate: string;
      exitVelocity: string;
      contactRate: string;
    };
  };
}

export interface PlayerMetric {
  name: string;
  position: string;
  stats: {
    [key: string]: string | number;
  };
  highlights?: string[];
}

export interface PitchEvent extends GameEvent {
  type: 'pitch';
  pitcher_name: string;
  pitch_type: string;
  pitch_speed_mph: number;
}

export interface HitEvent extends GameEvent {
  type: 'hit';
  batter_name: string;
  hit_type: string;
  exit_velocity_mph: number;
  launch_angle_deg: number;
}

export interface FinalScore {
  home: number;
  visitor: number;
}

export interface Game {
  game_id: string;
  date: string;
  teams: Teams;
  events: GameEvent[];
  final_score: FinalScore;
} 