import React from 'react';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Share2,
  ChevronRight
} from 'lucide-react';

function PlayerProfile() {
  return (
    <div className="min-h-screen bg-[#0A1A2F] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Player Header */}
        <div className="bg-[#0A1A2F]/50 rounded-xl p-8 mb-8 border border-gray-800">
          <div className="flex items-center space-x-8">
            <img 
              src="https://images.unsplash.com/photo-1584735422715-6cdc7c73d991?auto=format&fit=crop&w=200&h=200&q=80"
              alt="Player"
              className="w-32 h-32 rounded-full border-4 border-[#00FFC2]"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2">Aaron Judge</h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <span>RF | #99</span>
                <span>New York Yankees</span>
                <button className="flex items-center space-x-1 text-[#00FFC2] hover:text-[#00FFC2]/80 transition-all">
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Main Stats */}
          <div className="col-span-8 space-y-8">
            {/* Season Stats */}
            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6">2024 Season Stats</h2>
              <div className="grid grid-cols-4 gap-6">
                <StatCard label="AVG" value=".297" trend="+.023" />
                <StatCard label="HR" value="42" trend="+3" />
                <StatCard label="RBI" value="102" trend="+12" />
                <StatCard label="OPS" value=".988" trend="+.045" />
              </div>
            </div>

            {/* Career Timeline */}
            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Career Highlights</h2>
              <div className="space-y-6">
                <TimelineEvent 
                  year="2022"
                  title="AL MVP & Home Run Record"
                  description="Set AL record with 62 home runs, won AL MVP"
                />
                <TimelineEvent 
                  year="2017"
                  title="Rookie Season"
                  description="AL Rookie of the Year, 52 home runs"
                />
              </div>
            </div>

            {/* Spray Chart */}
            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Hit Distribution</h2>
              <div className="aspect-square bg-[#0A1A2F]/30 rounded-lg">
                {/* Placeholder for spray chart */}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="col-span-4 space-y-8">
            {/* AI Insights */}
            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">AI Insights</h2>
              <div className="space-y-4">
                <InsightCard 
                  icon={<TrendingUp className="w-5 h-5" />}
                  title="Hot Zone Analysis"
                  description="Exceptional performance against high fastballs this season"
                />
                <InsightCard 
                  icon={<Award className="w-5 h-5" />}
                  title="Historical Comparison"
                  description="Power numbers similar to Mickey Mantle's 1961 season"
                />
                <InsightCard 
                  icon={<Target className="w-5 h-5" />}
                  title="Next Milestone"
                  description="3 HRs away from 200 career home runs"
                />
              </div>
            </div>

            {/* Recent Highlights */}
            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Recent Highlights</h2>
              <div className="space-y-4">
                <HighlightCard 
                  image="https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=400&q=80"
                  title="Walk-off Home Run vs. Boston"
                  date="Yesterday"
                />
                <HighlightCard 
                  image="https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=400&q=80"
                  title="Diving Catch in Right Field"
                  date="3 days ago"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }) {
  const isPositive = trend.startsWith('+');
  return (
    <div className="p-4 rounded-lg bg-[#0A1A2F]/30 border border-gray-800">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function TimelineEvent({ year, title, description }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="text-[#00FFC2] font-bold">{year}</div>
      <div className="flex-1">
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, description }) {
  return (
    <div className="p-4 rounded-lg bg-[#0A1A2F]/30 border border-gray-800 hover:border-[#00FFC2] transition-all group">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-full bg-[#00FFC2]/10 text-[#00FFC2]">
          {icon}
        </div>
        <div>
          <h3 className="font-bold mb-1 group-hover:text-[#00FFC2] transition-all">
            {title}
          </h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ image, title, date }) {
  return (
    <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-[#0A1A2F]/30 transition-all cursor-pointer group">
      <img 
        src={image} 
        alt={title}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="font-bold mb-1 group-hover:text-[#00FFC2] transition-all">
          {title}
        </h3>
        <p className="text-sm text-gray-400">{date}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#00FFC2]" />
    </div>
  );
}

export default PlayerProfile;