"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResult } from '@/lib/types';
import { generateAgentNetworks, AgentNetwork, AgentNode, Sentiment } from '@/lib/agentNetwork';

export default function ResultsPage() {
  const router = useRouter();
  const [network, setNetwork] = useState<AgentNetwork | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    if (!storedResult) {
      router.push('/');
      return;
    }

    const result: AnalysisResult = JSON.parse(storedResult);
    const networks = generateAgentNetworks(result.societies.map(s => s.societyId));
    setNetwork(networks[0]); // Show first society
  }, [router]);

  if (!network) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  const getSentimentColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return 'from-green-500 to-emerald-500';
      case 'neutral': return 'from-yellow-500 to-amber-500';
      case 'negative': return 'from-red-500 to-rose-500';
    }
  };

  const getSentimentBorder = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return 'border-green-500';
      case 'neutral': return 'border-yellow-500';
      case 'negative': return 'border-red-500';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const avgEngagement = Math.round(
    network.agents.reduce((sum, a) => sum + a.engagement, 0) / network.agents.length
  );

  const sentimentBreakdown = {
    positive: network.agents.filter(a => a.sentiment === 'positive').length,
    neutral: network.agents.filter(a => a.sentiment === 'neutral').length,
    negative: network.agents.filter(a => a.sentiment === 'negative').length
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AdVisor
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Society Simulation Results</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-700"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Society Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4">{network.societyName}</h2>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">Overall Engagement</div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">{avgEngagement}%</div>
                    <div className="text-sm text-gray-400 mb-1">avg</div>
                  </div>
                  <div className="mt-2 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                      style={{ width: `${avgEngagement}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-3">Sentiment Breakdown</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Positive</span>
                      </div>
                      <span className="text-sm font-semibold">{sentimentBreakdown.positive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Neutral</span>
                      </div>
                      <span className="text-sm font-semibold">{sentimentBreakdown.neutral}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Negative</span>
                      </div>
                      <span className="text-sm font-semibold">{sentimentBreakdown.negative}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="text-xs text-gray-400 mb-2">Network Size</div>
                  <div className="text-2xl font-bold">{network.agents.length}</div>
                  <div className="text-sm text-gray-400">connected agents</div>
                </div>
              </div>
            </div>

            {selectedAgent && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedAgent.name}</h3>
                    <p className="text-sm text-gray-400">{selectedAgent.role}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Demographics</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {selectedAgent.demographics.location}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {selectedAgent.demographics.ageGroup}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedAgent.demographics.profession}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-2">Personality Traits</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.personalityTraits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-2">Engagement Score</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${getSentimentColor(selectedAgent.sentiment)} h-full rounded-full transition-all`}
                          style={{ width: `${selectedAgent.engagement}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{selectedAgent.engagement}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Network Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-1">Agent Network Map</h2>
                <p className="text-sm text-gray-400">
                  Click any agent to see their full profile and reaction
                </p>
              </div>

              {/* Network Graph */}
              <div className="relative bg-gray-950 rounded-xl border border-gray-800" style={{ height: '700px' }}>
                <svg className="w-full h-full">
                  {/* Draw connections */}
                  {network.agents.map(agent =>
                    agent.connections.map(targetId => {
                      const target = network.agents.find(a => a.id === targetId);
                      if (!target) return null;

                      return (
                        <line
                          key={`${agent.id}-${targetId}`}
                          x1={agent.position.x}
                          y1={agent.position.y}
                          x2={target.position.x}
                          y2={target.position.y}
                          stroke="#374151"
                          strokeWidth="2"
                          opacity="0.3"
                        />
                      );
                    })
                  )}
                </svg>

                {/* Agent Nodes */}
                {network.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="absolute transition-all duration-200 cursor-pointer"
                    style={{
                      left: `${agent.position.x}px`,
                      top: `${agent.position.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedAgent(agent)}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    {/* Agent Avatar with sentiment ring */}
                    <div className={`relative ${hoveredAgent === agent.id || selectedAgent?.id === agent.id ? 'scale-110' : ''} transition-transform`}>
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${getSentimentColor(agent.sentiment)} p-1`}
                      >
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {getInitials(agent.name)}
                          </span>
                        </div>
                      </div>

                      {/* Engagement badge */}
                      <div className="absolute -bottom-2 -right-2 bg-gray-900 border-2 border-gray-800 rounded-full px-2 py-0.5 text-xs font-semibold">
                        {agent.engagement}%
                      </div>
                    </div>

                    {/* Hover Card */}
                    {hoveredAgent === agent.id && (
                      <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-10 w-80">
                        <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-2xl p-4">
                          <div className="mb-3">
                            <div className="font-semibold text-white mb-0.5">{agent.name}</div>
                            <div className="text-xs text-gray-400">{agent.role}</div>
                          </div>
                          <div className={`p-3 bg-gray-950 rounded-lg border ${getSentimentBorder(agent.sentiment)}`}>
                            <div className="text-sm text-gray-300 italic leading-relaxed">
                              "{agent.comment}"
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className={`px-2 py-1 rounded ${
                              agent.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                              agent.sentiment === 'neutral' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {agent.sentiment}
                            </span>
                            <span className="text-gray-400">
                              {agent.engagement}% likely to engage
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                  <span className="text-gray-400">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500" />
                  <span className="text-gray-400">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
                  <span className="text-gray-400">Negative</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
