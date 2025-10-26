"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisResult, SocietyMatch, BrandMeta } from '@/lib/types';
import { analyzeAd } from '@/lib/mockApi';
import { generateAgentNetworks, AgentNetwork } from '@/lib/agentNetwork';
import AgentNetworkViz from '@/components/AgentNetworkViz';

type SimulationPhase = 'extracting' | 'matching' | 'simulating' | 'complete';

export default function SimulationPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<SimulationPhase>('extracting');
  const [progress, setProgress] = useState(0);
  const [societies, setSocieties] = useState<SocietyMatch[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [agentNetworks, setAgentNetworks] = useState<AgentNetwork[]>([]);
  const [currentNetworkIndex, setCurrentNetworkIndex] = useState(0);

  useEffect(() => {
    // Check if previous steps completed
    const brandMetaStr = sessionStorage.getItem('brandMeta');
    if (!brandMetaStr) {
      router.push('/');
      return;
    }

    runSimulation();
  }, [router]);

  const runSimulation = async () => {
    const brandMetaStr = sessionStorage.getItem('brandMeta');
    if (!brandMetaStr) return;

    const brandMeta: BrandMeta = JSON.parse(brandMetaStr);

    // Phase 1: Extract features
    setPhase('extracting');
    setProgress(0);
    await simulateProgress(0, 25, 2000);

    // Phase 2: Match societies
    setPhase('matching');
    await simulateProgress(25, 40, 1500);

    // Fetch analysis result
    // TODO(matthew): replace with real extractor output
    // TODO(yashas): wire real society selection + activation here
    const mockFile = new File([''], 'ad.mp4');
    const result = await analyzeAd(mockFile, brandMeta);
    setAnalysisResult(result);
    setSocieties(result.societies);
    sessionStorage.setItem('analysisResult', JSON.stringify(result));

    // Generate agent networks for each society
    const networks = generateAgentNetworks(result.societies.map(s => s.societyId));
    setAgentNetworks(networks);

    await simulateProgress(40, 50, 500);

    // Phase 3: Simulate agent reactions with network visualization
    setPhase('simulating');
    setProgress(50);

    // Networks will auto-complete via their onComplete callbacks
  };

  const simulateProgress = (start: number, end: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 20;
      const increment = (end - start) / steps;
      const interval = duration / steps;

      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setProgress(end);
          clearInterval(timer);
          resolve();
        } else {
          setProgress(current);
        }
      }, interval);
    });
  };

  const handleNetworkComplete = () => {
    // Move to next network or complete
    if (currentNetworkIndex < agentNetworks.length - 1) {
      setCurrentNetworkIndex(prev => prev + 1);
      const newProgress = 50 + ((currentNetworkIndex + 1) / agentNetworks.length) * 40;
      setProgress(newProgress);
    } else {
      // All networks complete
      setPhase('complete');
      setProgress(100);

      // Wait a moment then redirect to results
      setTimeout(() => {
        router.push('/results');
      }, 2000);
    }
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'extracting': return 'Extracting Creative Signals';
      case 'matching': return 'Mapping to Artificial Societies';
      case 'simulating': return 'Simulating Society Reactions';
      case 'complete': return 'Simulation Complete';
    }
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'extracting': return 'Analyzing tone, pacing, CTA, visual energy, and demographic signals from your creative';
      case 'matching': return 'Finding buyer micro-communities that match your creative and brand positioning';
      case 'simulating': return 'Running agent-based simulations to predict how each society will react, share, and convert';
      case 'complete': return 'Generating your playbook with actionable recommendations';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-blue-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            Step 4 of 4
          </span>
          <span className="text-sm text-muted-foreground">Running Simulation</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out shadow-glow"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Phase Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 glass-effect rounded-full mb-6">
          {phase !== 'complete' ? (
            <svg className="animate-spin h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h2 className="text-4xl font-bold text-gradient mb-4">
          {getPhaseTitle()}
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {getPhaseDescription()}
        </p>
      </div>

      {/* Society Cards - Show during matching phase */}
      {phase !== 'extracting' && societies.length > 0 && (
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            Matched Societies ({societies.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {societies.map((society) => (
              <div
                key={society.societyId}
                className="glass-effect rounded-xl p-6 hover-lift"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-foreground">
                    {society.societyName}
                  </h4>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/30">
                    {society.score}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {society.whyWeChoseThis.substring(0, 120)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Network Visualization */}
      {phase === 'simulating' && agentNetworks.length > 0 && (
        <div className="space-y-6">
          <AgentNetworkViz
            network={agentNetworks[currentNetworkIndex]}
            onComplete={handleNetworkComplete}
          />

          {agentNetworks.length > 1 && (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-xl">
                <span className="text-sm text-blue-400 font-medium">
                  Society {currentNetworkIndex + 1} of {agentNetworks.length}
                </span>
                <div className="flex gap-2">
                  {agentNetworks.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        idx === currentNetworkIndex ? 'bg-blue-400 shadow-glow' :
                        idx < currentNetworkIndex ? 'bg-green-400 animate-pulse' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Message */}
      {phase === 'complete' && (
        <div className="glass-effect rounded-2xl border border-green-500/20 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gradient mb-4">
            Simulation Complete!
          </h3>
          <p className="text-lg text-muted-foreground">
            Generating your playbook with actionable creative recommendations...
          </p>
        </div>
      )}
    </div>
  );
}
