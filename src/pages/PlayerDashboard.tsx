import React, { useState } from 'react';
import { 
  User, Calendar, Award, TrendingUp, Activity, Target, 
  BarChart2, ChevronDown, Star, Heart, Share2, MapPin,
  Trophy, Users, Flag, Medal, Crown, Banknote, Search, Filter
} from 'lucide-react';

// Mock data including team information
const TEAM_DATA = {
  name: "Los Angeles Dodgers",
  record: "100-62",
  division: "NL West",
  standing: "1st",
  stadium: "Dodger Stadium",
  manager: "Dave Roberts",
  founded: 1883,
  worldSeries: 7,
  stats: {
    batting: {
      avg: ".257",
      runs: 906,
      hr: 249,
      rbi: 853,
      obp: ".341",
      slg: ".455"
    },
    pitching: {
      era: "3.82",
      so: 1475,
      whip: "1.23",
      saves: 40,
      shutouts: 12
    }
  }
};

// Enhanced player data with more awards and achievements
const PLAYER_DATA = {
  id: "660271",
  name: "Shohei Ohtani",
  number: "17",
  position: "P/DH",
  team: "Los Angeles Dodgers",
  image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/660271/headshot/67/current",
  age: 29,
  birthplace: "Oshu, Japan",
  bats: "Left",
  throws: "Right",
  height: "6'4\"",
  weight: "210 lbs",
  contract: {
    years: "10",
    value: "$700M",
    avgAnnual: "$70M",
    expires: 2033
  },
  stats: {
    batting: {
      avg: ".304",
      hr: 44,
      rbi: 95,
      hits: 151,
      runs: 102,
      sb: 20,
      obp: ".412",
      slg: ".654",
      ops: "1.066"
    },
    pitching: {
      era: "3.14",
      wins: 10,
      losses: 5,
      ip: "132.0",
      so: 167,
      whip: "1.06",
      saves: 0,
      holds: 0
    }
  },
  awards: {
    major: [
      {
        name: "AL MVP",
        years: ["2021", "2023"],
        icon: Crown
      },
      {
        name: "All-Star",
        years: ["2021", "2022", "2023"],
        icon: Star
      },
      {
        name: "Silver Slugger",
        years: ["2021", "2023"],
        icon: Medal
      }
    ],
    records: [
      "First player with 10+ HR and 10+ wins in a season",
      "Most HR by a pitcher in a single season",
      "Fastest pitch by a starting pitcher (101.4 mph)"
    ]
  },
  recentGames: [
    {
      date: "2024-03-20",
      opponent: "vs SF Giants",
      batting: "3-4, HR, 2 RBI",
      pitching: null
    },
    {
      date: "2024-03-21",
      opponent: "vs SD Padres",
      batting: "2-4, 2B, RBI",
      pitching: "7.0 IP, 1 ER, 9 K"
    },
    {
      date: "2024-03-23",
      opponent: "@ ARI D-backs",
      batting: "1-3, BB, R",
      pitching: null
    }
  ]
};

// Add more players to the mock data
const PLAYERS_DATA = [
  {
    id: "660271",
    name: "Shohei Ohtani",
    number: "17",
    position: "P/DH",
    team: "Los Angeles Dodgers",
    image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/660271/headshot/67/current",
    stats: {
      batting: { avg: ".304", hr: 44, rbi: 95 },
      pitching: { era: "3.14", so: 167, wins: 10 }
    }
  },
  {
    id: "545361",
    name: "Mike Trout",
    number: "27",
    position: "CF",
    team: "Los Angeles Angels",
    image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/545361/headshot/67/current",
    stats: {
      batting: { avg: ".299", hr: 40, rbi: 87 },
      pitching: null
    }
  },
  {
    id: "592450",
    name: "Aaron Judge",
    number: "99",
    position: "RF",
    team: "New York Yankees",
    image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/592450/headshot/67/current",
    stats: {
      batting: { avg: ".267", hr: 37, rbi: 75 },
      pitching: null
    }
  },
  {
    id: "665742",
    name: "Juan Soto",
    number: "22",
    position: "RF",
    team: "New York Yankees",
    image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/665742/headshot/67/current",
    stats: {
      batting: { avg: ".275", hr: 35, rbi: 109 },
      pitching: null
    }
  },
  {
    id: "605141",
    name: "Mookie Betts",
    number: "50",
    position: "RF/2B",
    team: "Los Angeles Dodgers",
    image: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/605141/headshot/67/current",
    stats: {
      batting: { avg: ".307", hr: 39, rbi: 107 },
      pitching: null
    }
  }
];

const StatBox = ({ label, value, trend = 0 }: { label: string; value: string | number; trend?: number }) => (
  <div className="bg-gray-800/50 rounded-xl p-4">
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="flex items-end gap-2">
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend !== 0 && (
        <div className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

const TeamStatBox = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-gray-800/50 rounded-lg p-3">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="text-lg font-bold text-white">{value}</div>
  </div>
);

const AwardCard = ({ award }: { award: typeof PLAYER_DATA.awards.major[0] }) => {
  const Icon = award.icon;
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-[#00FFC2]" />
        <span className="font-bold">{award.name}</span>
      </div>
      <div className="text-sm text-gray-400">
        {award.years.join(", ")}
      </div>
    </div>
  );
};

const PlayerCard = ({ player }: { player: typeof PLAYERS_DATA[0] }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img
          src={player.image}
          alt={player.name}
          className="w-16 h-16 rounded-full border-2 border-[#00FFC2]"
        />
        <div className="absolute -bottom-1 -right-1 bg-[#00FFC2] text-[#0A1A2F] px-1.5 py-0.5 rounded text-xs font-bold">
          #{player.number}
        </div>
      </div>
      <div>
        <h3 className="font-bold">{player.name}</h3>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>{player.position}</span>
          <span>•</span>
          <span>{player.team}</span>
        </div>
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">
      <div className="text-center">
        <div className="text-xs text-gray-400">AVG</div>
        <div className="font-bold">{player.stats.batting.avg}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400">HR</div>
        <div className="font-bold">{player.stats.batting.hr}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400">RBI</div>
        <div className="font-bold">{player.stats.batting.rbi}</div>
      </div>
    </div>
  </div>
);

const PlayerDashboard = () => {
  const [selectedTab, setSelectedTab] = useState<'batting' | 'pitching'>('batting');
  const [selectedSection, setSelectedSection] = useState<'player' | 'team'>('player');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = PLAYERS_DATA.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-[#00FFC2]" />
              MLB Players
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players, teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00FFC2] text-sm w-64"
                />
              </div>
              <button className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPlayers.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </div>

        {/* Selected Player Details */}
        {PLAYER_DATA && (
          <>
            {/* Player Header */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={PLAYER_DATA.image}
                    alt={PLAYER_DATA.name}
                    className="w-32 h-32 rounded-full border-4 border-[#00FFC2]"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#00FFC2] text-[#0A1A2F] px-2 py-1 rounded-lg text-sm font-bold">
                    #{PLAYER_DATA.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-4xl font-bold">{PLAYER_DATA.name}</h1>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-[#00FFC2]">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-[#00FFC2]">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {PLAYER_DATA.team}
                    </div>
                    <div>•</div>
                    <div>{PLAYER_DATA.position}</div>
                    <div>•</div>
                    <div>B/T: {PLAYER_DATA.bats}/{PLAYER_DATA.throws}</div>
                  </div>
                  <div className="flex gap-4">
                    {PLAYER_DATA.awards.major.slice(0, 3).map((award, index) => (
                      <AwardCard key={index} award={award} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedSection('player')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedSection === 'player'
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                Player Stats
              </button>
              <button
                onClick={() => setSelectedSection('team')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedSection === 'team'
                    ? 'bg-[#00FFC2] text-[#0A1A2F]'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Team Stats
              </button>
            </div>

            {selectedSection === 'player' ? (
              <>
                {/* Stats Tabs */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setSelectedTab('batting')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedTab === 'batting'
                        ? 'bg-[#00FFC2] text-[#0A1A2F]'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    Batting
                  </button>
                  <button
                    onClick={() => setSelectedTab('pitching')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedTab === 'pitching'
                        ? 'bg-[#00FFC2] text-[#0A1A2F]'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Pitching
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedTab === 'batting' ? (
                        <>
                          <StatBox label="AVG" value={PLAYER_DATA.stats.batting.avg} trend={2.1} />
                          <StatBox label="HR" value={PLAYER_DATA.stats.batting.hr} trend={15.3} />
                          <StatBox label="RBI" value={PLAYER_DATA.stats.batting.rbi} trend={-3.2} />
                          <StatBox label="OPS" value={PLAYER_DATA.stats.batting.ops} trend={5.7} />
                        </>
                      ) : (
                        <>
                          <StatBox label="ERA" value={PLAYER_DATA.stats.pitching.era} trend={-1.2} />
                          <StatBox label="W-L" value={`${PLAYER_DATA.stats.pitching.wins}-${PLAYER_DATA.stats.pitching.losses}`} />
                          <StatBox label="SO" value={PLAYER_DATA.stats.pitching.so} trend={8.4} />
                          <StatBox label="WHIP" value={PLAYER_DATA.stats.pitching.whip} trend={-2.8} />
                        </>
                      )}
                    </div>

                    {/* Recent Games */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#00FFC2]" />
                        Recent Games
                      </h3>
                      <div className="space-y-4">
                        {PLAYER_DATA.recentGames.map((game, index) => (
                          <div key={index} className="flex items-center gap-4 border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                            <div className="w-24 text-sm text-gray-400">{game.date}</div>
                            <div className="flex-1">
                              <div className="font-bold">{game.opponent}</div>
                              <div className="text-sm text-gray-400">
                                {game.batting && <span className="mr-4">{game.batting}</span>}
                                {game.pitching && <span>{game.pitching}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Side Stats */}
                  <div className="space-y-6">
                    {/* Player Info */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#00FFC2]" />
                        Player Info
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Age</span>
                          <span>{PLAYER_DATA.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Height</span>
                          <span>{PLAYER_DATA.height}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weight</span>
                          <span>{PLAYER_DATA.weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Birthplace</span>
                          <span>{PLAYER_DATA.birthplace}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Stats */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-[#00FFC2]" />
                        {selectedTab === 'batting' ? 'Batting Stats' : 'Pitching Stats'}
                      </h3>
                      <div className="space-y-3">
                        {selectedTab === 'batting' ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Hits</span>
                              <span>{PLAYER_DATA.stats.batting.hits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Runs</span>
                              <span>{PLAYER_DATA.stats.batting.runs}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">SB</span>
                              <span>{PLAYER_DATA.stats.batting.sb}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">OBP</span>
                              <span>{PLAYER_DATA.stats.batting.obp}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">SLG</span>
                              <span>{PLAYER_DATA.stats.batting.slg}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">IP</span>
                              <span>{PLAYER_DATA.stats.pitching.ip}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Saves</span>
                              <span>{PLAYER_DATA.stats.pitching.saves}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Holds</span>
                              <span>{PLAYER_DATA.stats.pitching.holds}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Awards Section */}
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#00FFC2]" />
                    Awards & Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {PLAYER_DATA.awards.major.map((award, index) => (
                      <AwardCard key={index} award={award} />
                    ))}
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#00FFC2]" />
                      MLB Records
                    </h4>
                    <ul className="space-y-2">
                      {PLAYER_DATA.awards.records.map((record, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFC2] mt-1.5" />
                          {record}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contract Information */}
                <div className="mt-6 bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-[#00FFC2]" />
                    Contract Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Length</div>
                      <div className="text-xl font-bold">{PLAYER_DATA.contract.years} Years</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Total Value</div>
                      <div className="text-xl font-bold">{PLAYER_DATA.contract.value}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Annual Average</div>
                      <div className="text-xl font-bold">{PLAYER_DATA.contract.avgAnnual}</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Expires</div>
                      <div className="text-xl font-bold">{PLAYER_DATA.contract.expires}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Team Section */
              <div className="space-y-6">
                {/* Team Header */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Flag className="w-8 h-8 text-[#00FFC2]" />
                    <div>
                      <h2 className="text-2xl font-bold">{TEAM_DATA.name}</h2>
                      <div className="text-gray-400">
                        {TEAM_DATA.division} • {TEAM_DATA.standing} • {TEAM_DATA.record}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TeamStatBox label="Founded" value={TEAM_DATA.founded} />
                    <TeamStatBox label="World Series Titles" value={TEAM_DATA.worldSeries} />
                    <TeamStatBox label="Stadium" value={TEAM_DATA.stadium} />
                    <TeamStatBox label="Manager" value={TEAM_DATA.manager} />
                  </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team Batting */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#00FFC2]" />
                      Team Batting
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <TeamStatBox label="Team AVG" value={TEAM_DATA.stats.batting.avg} />
                      <TeamStatBox label="Runs" value={TEAM_DATA.stats.batting.runs} />
                      <TeamStatBox label="Home Runs" value={TEAM_DATA.stats.batting.hr} />
                      <TeamStatBox label="RBI" value={TEAM_DATA.stats.batting.rbi} />
                      <TeamStatBox label="OBP" value={TEAM_DATA.stats.batting.obp} />
                      <TeamStatBox label="SLG" value={TEAM_DATA.stats.batting.slg} />
                    </div>
                  </div>

                  {/* Team Pitching */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#00FFC2]" />
                      Team Pitching
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <TeamStatBox label="Team ERA" value={TEAM_DATA.stats.pitching.era} />
                      <TeamStatBox label="Strikeouts" value={TEAM_DATA.stats.pitching.so} />
                      <TeamStatBox label="WHIP" value={TEAM_DATA.stats.pitching.whip} />
                      <TeamStatBox label="Saves" value={TEAM_DATA.stats.pitching.saves} />
                      <TeamStatBox label="Shutouts" value={TEAM_DATA.stats.pitching.shutouts} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard; 