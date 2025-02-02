import React, { useState } from 'react';
import { Play, PauseCircle, ChevronRight, ChevronLeft } from 'lucide-react';

function GameAnalysis() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1A2F] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Game Header */}
        <div className="bg-[#0A1A2F]/50 rounded-xl p-6 mb-8 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://images.unsplash.com/photo-1584735422715-6cdc7c73d991?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Team 1"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">Yankees</h2>
                <p className="text-gray-400">Home Team</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">3 - 2</div>
              <div className="text-gray-400">Top 7th</div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <h2 className="text-2xl font-bold">Red Sox</h2>
                <p className="text-gray-400">Away Team</p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1584735422715-6cdc7c73d991?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Team 2"
                className="w-16 h-16 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Live Feed */}
          <div className="col-span-8">
            <div className="bg-[#0A1A2F]/50 rounded-xl overflow-hidden border border-gray-800">
              <div className="aspect-video relative">
                <img 
                  src="https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=1200&q=80"
                  alt="Live game"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-[#00FFC2] flex items-center justify-center text-[#0A1A2F] hover:bg-[#00FFC2]/90 transition-all"
                    >
                      {isPlaying ? <PauseCircle className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
                <div className="space-y-4">
                  <InsightCard 
                    title="Pitch Selection"
                    description="Judge's tendency to chase high fastballs suggests a potential vulnerability in this at-bat."
                    confidence={85}
                  />
                  <InsightCard 
                    title="Defensive Positioning"
                    description="The infield shift against Judge has reduced his batting average by .042 this season."
                    confidence={92}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="col-span-4 space-y-8">
            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Win Probability</h3>
              <div className="h-48 bg-[#0A1A2F]/30 rounded-lg mb-4">
                {/* Placeholder for D3.js chart */}
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <div>Yankees: 64%</div>
                <div>Red Sox: 36%</div>
              </div>
            </div>

            <div className="bg-[#0A1A2F]/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Current Situation</h3>
              <div className="space-y-4">
                <StatRow label="Count" value="2-1" />
                <StatRow label="Runners" value="1st, 2nd" />
                <StatRow label="Outs" value="1" />
                <StatRow label="Pitch Speed" value="95 mph" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, description, confidence }) {
  return (
    <div className="p-4 rounded-lg bg-[#0A1A2F]/30 border border-gray-800">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold">{title}</h4>
        <div className="text-sm text-[#00FFC2]">{confidence}% confidence</div>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-gray-400">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

export default GameAnalysis;