import React, { useState, useEffect } from 'react';
import { fetchBaseballStats, fetchPitchTypes, fetchPlayerStats, BaseballStats } from '../services/baseballStatsService';
import { ChevronLeft, ChevronRight, RefreshCw, Filter } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface PitchType {
  code: string;
  description: string;
}

const BaseballStatsDisplay = () => {
  const [stats, setStats] = useState<BaseballStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedPitchType, setSelectedPitchType] = useState<string>('');
  const [pitchTypes, setPitchTypes] = useState<PitchType[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teams, setTeams] = useState<string[]>([]);
  const [view, setView] = useState<'overview' | 'pitching' | 'hitting'>('overview');

  useEffect(() => {
    loadStats();
    loadPitchTypes();
  }, [startDate, endDate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchBaseballStats(startDate, endDate);
      if (Array.isArray(data)) {
        setStats(data);
        
        // Extract unique teams
        const uniqueTeams = Array.from(new Set(
          data.flatMap((stat: BaseballStats) => [stat.home_team, stat.away_team])
        )).filter((team): team is string => typeof team === 'string');
        setTeams(uniqueTeams);
      } else {
        setStats([]);
        setTeams([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const loadPitchTypes = async () => {
    try {
      const types = await fetchPitchTypes();
      setPitchTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error('Failed to load pitch types:', err);
      setPitchTypes([]);
    }
  };

  const handleRefresh = () => {
    loadStats();
  };

  const filteredStats = stats.filter(stat => {
    if (selectedPitchType && stat.pitch_type !== selectedPitchType) return false;
    if (selectedTeam && stat.home_team !== selectedTeam && stat.away_team !== selectedTeam) return false;
    return true;
  });

  const calculateAverages = () => {
    if (!filteredStats.length) return null;
    
    return {
      avgPitchSpeed: filteredStats.reduce((sum, stat) => sum + (stat.release_speed || 0), 0) / filteredStats.length,
      avgHitDistance: filteredStats.reduce((sum, stat) => sum + (stat.hit_distance_sc || 0), 0) / filteredStats.length,
      avgHitSpeed: filteredStats.reduce((sum, stat) => sum + (stat.hit_speed || 0), 0) / filteredStats.length,
      totalPitches: filteredStats.length,
      strikePercentage: (filteredStats.filter(stat => stat.events === 'strikeout').length / filteredStats.length) * 100
    };
  };

  const averages = calculateAverages();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FFC2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">MLB Statistics Dashboard</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-700 rounded px-2 py-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-700 rounded px-2 py-1"
            />
          </div>
          
          <select
            value={selectedPitchType}
            onChange={(e) => setSelectedPitchType(e.target.value)}
            className="bg-gray-700 rounded px-2 py-1"
          >
            <option value="">All Pitch Types</option>
            {pitchTypes.map((type) => (
              <option key={type.code} value={type.code}>
                {type.description}
              </option>
            ))}
          </select>
          
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-gray-700 rounded px-2 py-1"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 bg-[#00FFC2] text-[#0A1A2F] px-4 py-1 rounded hover:bg-[#00FFC2]/90"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* View Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded ${view === 'overview' ? 'bg-[#00FFC2] text-[#0A1A2F]' : 'bg-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('pitching')}
            className={`px-4 py-2 rounded ${view === 'pitching' ? 'bg-[#00FFC2] text-[#0A1A2F]' : 'bg-gray-700'}`}
          >
            Pitching
          </button>
          <button
            onClick={() => setView('hitting')}
            className={`px-4 py-2 rounded ${view === 'hitting' ? 'bg-[#00FFC2] text-[#0A1A2F]' : 'bg-gray-700'}`}
          >
            Hitting
          </button>
        </div>

        {/* Stats Overview */}
        {view === 'overview' && averages && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Average Pitch Speed</h3>
              <p className="text-2xl text-[#00FFC2]">{averages.avgPitchSpeed.toFixed(1)} mph</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Average Hit Distance</h3>
              <p className="text-2xl text-[#00FFC2]">{averages.avgHitDistance.toFixed(1)} ft</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Pitches</h3>
              <p className="text-2xl text-[#00FFC2]">{averages.totalPitches}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Strike Percentage</h3>
              <p className="text-2xl text-[#00FFC2]">{averages.strikePercentage.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Detailed Stats Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-4">Date</th>
                <th className="p-4">Player</th>
                <th className="p-4">Pitch Type</th>
                <th className="p-4">Speed</th>
                <th className="p-4">Result</th>
                <th className="p-4">Teams</th>
                <th className="p-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-4">{stat.game_date}</td>
                  <td className="p-4">{stat.player_name}</td>
                  <td className="p-4">{stat.pitch_type}</td>
                  <td className="p-4">{stat.release_speed?.toFixed(1)} mph</td>
                  <td className="p-4">{stat.events || stat.description}</td>
                  <td className="p-4">{stat.away_team} @ {stat.home_team}</td>
                  <td className="p-4">{stat.away_score} - {stat.home_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BaseballStatsDisplay; 