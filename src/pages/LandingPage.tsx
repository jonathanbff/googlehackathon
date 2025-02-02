import React from 'react';
import { Globe2, Baseline as Baseball, Cpu, ChevronRight, Play, Heart, BarChart3, Database, Cloud, Zap } from 'lucide-react';

function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A2F]/80 to-[#0A1A2F]"></div>
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute w-full h-full object-cover"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-baseball-player-catching-the-ball-5763-large.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00FFC2]">
            Never Miss a Moment
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            AI-Powered MLB Highlights, Your Way
          </p>
          <p className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
            Get personalized game recaps with multilingual commentary, 
            delivered straight to your inbox.
          </p>
          <button className="bg-[#00FFC2] text-[#0A1A2F] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00FFC2]/90 transition-all flex items-center gap-2 mx-auto">
            Get Your Highlights Now
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0A1A2F]/95">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Baseball className="w-12 h-12 text-[#00FFC2]" />}
              title="Personalized Highlights"
              description="Follow players or teams. Get clips curated just for you."
            />
            <FeatureCard 
              icon={<Globe2 className="w-12 h-12 text-[#00FFC2]" />}
              title="AI Multilingual Voiceovers"
              description="Hear commentary in English, Spanish, or Japanese with pro-level analysis."
            />
            <FeatureCard 
              icon={<Cpu className="w-12 h-12 text-[#00FFC2]" />}
              title="Real-Time Insights"
              description="Understand the strategy behind every play with Gemini-powered breakdowns."
            />
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="py-24 bg-gradient-to-b from-[#0A1A2F] to-[#0A1A2F]/90">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Powered by Google Cloud AI</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TechCard 
              icon={<Database className="w-8 h-8" />}
              title="Real-Time Processing"
              description="Process terabytes of MLB data in milliseconds using Cloud Pub/Sub and Vertex AI"
            />
            <TechCard 
              icon={<Cloud className="w-8 h-8" />}
              title="AI Commentary"
              description="Generate natural language insights using Gemini and WaveNet voice synthesis"
            />
            <TechCard 
              icon={<Zap className="w-8 h-8" />}
              title="Smart Highlights"
              description="Automatically detect key moments using Video Intelligence API"
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-[#0A1A2F]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">See HighlightIQ in Action</h2>
          <div className="aspect-video bg-[#0A1A2F]/50 rounded-xl overflow-hidden mb-8">
            <img 
              src="https://images.unsplash.com/photo-1562077772-3bd90403f7f0?auto=format&fit=crop&w=1200&q=80"
              alt="Baseball stadium"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-center gap-8 text-lg">
            <Stat label="Languages" value="3" />
            <Stat label="Setup Time" value="10s" />
            <Stat label="Personalization" value="100%" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1A2F] py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Revolutionize Your MLB Experience?
            </h3>
            <button className="bg-[#00FFC2] text-[#0A1A2F] px-6 py-3 rounded-lg font-bold hover:bg-[#00FFC2]/90 transition-all">
              Start Free Trial
            </button>
          </div>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-[#00FFC2]">Privacy Policy</a>
            <a href="#" className="hover:text-[#00FFC2]">FAQ</a>
            <a href="#" className="hover:text-[#00FFC2]">GitHub Repo</a>
            <a href="#" className="hover:text-[#00FFC2]">Contact</a>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            HighlightIQ is a fan project, not endorsed by MLB™
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-xl bg-[#0A1A2F]/50 border border-gray-800 hover:border-[#00FFC2] transition-all group">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4 group-hover:text-[#00FFC2] transition-all">
        {title}
      </h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function TechCard({ icon, title, description }) {
  return (
    <div className="p-6 rounded-xl bg-[#0A1A2F]/30 border border-gray-800 hover:border-[#00FFC2] transition-all group">
      <div className="w-16 h-16 rounded-full bg-[#00FFC2]/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-[#00FFC2] transition-all">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-[#00FFC2]">{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
}

export default LandingPage;