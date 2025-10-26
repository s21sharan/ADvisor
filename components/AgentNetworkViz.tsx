"use client";

import { useState, useEffect } from 'react';
import { AgentNode, AgentNetwork } from '@/lib/agentNetwork';

interface AgentNetworkVizProps {
  network: AgentNetwork;
  onComplete?: () => void;
}

export default function AgentNetworkViz({ network, onComplete }: AgentNetworkVizProps) {
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [agentThoughts, setAgentThoughts] = useState<Map<string, string>>(new Map());
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);

  useEffect(() => {
    // Simulate agents activating in batches for better performance with large networks
    let currentIndex = 0;
    const batchSize = Math.max(1, Math.floor(network.agents.length / 20)); // Process in batches
    const interval = setInterval(() => {
      if (currentIndex < network.agents.length) {
        // Activate a batch of agents
        const batch = network.agents.slice(currentIndex, currentIndex + batchSize);
        
        batch.forEach(agent => {
          // Activate agent
          setActiveAgents(prev => new Set([...prev, agent.id]));

          // Generate thought
          const thought = generateThought(agent);
          setAgentThoughts(prev => new Map(prev).set(agent.id, thought));
        });

        // Update progress
        setSimulationProgress(((currentIndex + batchSize) / network.agents.length) * 100);

        currentIndex += batchSize;
      } else {
        clearInterval(interval);
        // Complete after a delay
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      }
    }, 800); // Faster activation for better UX

    return () => clearInterval(interval);
  }, [network, onComplete]);

  const generateThought = (agent: AgentNode): string => {
    const thoughts: { [key: string]: string[] } = {
      'Overwhelmed Working Mom': [
        '"This better actually save me time..."',
        '"Can I prep this during nap time?"',
        '"Will my kids actually eat this?"'
      ],
      'Single Dad Juggling Custody': [
        '"Is this weeknight-doable on short notice?"',
        '"Budget-friendly enough for weekly?"'
      ],
      'College Student Working Out on Budget': [
        '"Can I afford this on a student budget?"',
        '"Anyone else in the gym use this?"',
        '"Is there a student discount code?"'
      ],
      'Biohacker on Budget': [
        '"What metrics can I actually track?"',
        '"Is the data exportable for analysis?"'
      ],
      'Privacy-First Fitness Tracker': [
        '"Where does my data actually go?"',
        '"Is this open-source audited?"'
      ],
      'Extreme Couponer': [
        '"Can I stack this with my cashback?"',
        '"Let me search for promo codes..."'
      ]
    };

    const agentThoughts = thoughts[agent.archetype] || ['"Hmm, interesting..."'];
    return agentThoughts[Math.floor(Math.random() * agentThoughts.length)];
  };

  const getStatusColor = (agentId: string) => {
    if (!activeAgents.has(agentId)) return 'bg-gray-300';
    return 'bg-blue-500 animate-pulse';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="glass-effect rounded-2xl p-8 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gradient">
            {network.societyName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Simulating {network.agents.length} connected agents
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-400">
            {Math.round(simulationProgress)}%
          </div>
          <div className="text-sm text-muted-foreground">
            {activeAgents.size} / {network.agents.length} active
          </div>
        </div>
      </div>

      {/* Network Graph */}
      <div className="relative bg-muted/30 rounded-xl border border-border backdrop-blur-sm" style={{ height: '600px' }}>
        <svg className="w-full h-full">
          {/* Draw connections first (behind nodes) */}
          {network.agents.map(agent =>
            agent.connections.map(targetId => {
              const target = network.agents.find(a => a.id === targetId);
              if (!target) return null;

              const isActive = activeAgents.has(agent.id) && activeAgents.has(targetId);

              return (
                <line
                  key={`${agent.id}-${targetId}`}
                  x1={agent.position.x}
                  y1={agent.position.y}
                  x2={target.position.x}
                  y2={target.position.y}
                  stroke={isActive ? '#3b82f6' : '#e5e7eb'}
                  strokeWidth={isActive ? '2' : '1'}
                  opacity={isActive ? '0.6' : '0.3'}
                  className="transition-all duration-500"
                />
              );
            })
          )}
        </svg>

        {/* Agent Nodes */}
        {network.agents.map((agent) => {
          const isActive = activeAgents.has(agent.id);
          const thought = agentThoughts.get(agent.id);

          return (
            <div
              key={agent.id}
              className="absolute transition-all duration-500"
              style={{
                left: `${agent.position.x}px`,
                top: `${agent.position.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              {/* Agent Avatar */}
              <div className="relative">
                <div
                  className={`
                    w-12 h-12 rounded-full border-2 border-white shadow-lg
                    flex items-center justify-center font-bold text-white text-xs
                    transition-all duration-300 cursor-pointer
                    ${getStatusColor(agent.id)}
                    ${hoveredAgent === agent.id ? 'scale-125 ring-2 ring-blue-400' : ''}
                  `}
                >
                  {getInitials(agent.name)}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse" />
                )}
              </div>

              {/* Agent Info Card - shows on hover or when active */}
              {(hoveredAgent === agent.id || isActive) && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in">
                  <div className="glass-effect rounded-xl shadow-xl border border-border p-4 w-72">
                    <div className="text-sm font-semibold text-foreground mb-1">
                      {agent.name}
                    </div>
                    <div className="text-sm text-blue-400 font-medium mb-2">
                      {agent.archetype}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.personalityTraits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full border border-border"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    {thought && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="text-sm text-foreground italic">
                          {thought}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Thought bubble - shows when just activated */}
              {isActive && thought && hoveredAgent !== agent.id && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 animate-fade-in">
                  <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg max-w-xs whitespace-nowrap">
                    {thought}
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600 mx-auto" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <span>Thinking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}
