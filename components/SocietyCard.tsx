import { SocietyMatch } from '@/lib/types';

interface SocietyCardProps {
  society: SocietyMatch;
  rank: number;
}

export default function SocietyCard({ society, rank }: SocietyCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 90) return 'shadow-glow';
    if (score >= 75) return 'shadow-glow';
    return '';
  };

  return (
    <div className={`
      glass-effect rounded-2xl border-2 p-6 transition-all duration-300 hover-lift group
      ${rank === 1 
        ? 'border-blue-400 ring-2 ring-blue-400/30 shadow-neon' 
        : 'border-border hover:border-blue-400/50'
      }
      ${getScoreGlow(society.score)}
    `}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {rank === 1 && (
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-glow animate-pulse-glow">
                PRIMARY MATCH
              </span>
            )}
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getScoreColor(society.score)}`}>
              {society.score}% Match
            </span>
          </div>
          <h3 className="text-xl font-bold text-gradient">
            {society.societyName}
          </h3>
        </div>
        {rank === 1 && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-float">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="glass-effect rounded-xl p-5 border border-blue-500/20 group-hover:border-blue-400/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-blue-300">
              Why We Matched You Here
            </p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {society.whyWeChoseThis}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-5 border border-green-500/20 group-hover:border-green-400/40 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-300">
              Predicted Society Behavior
            </p>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {society.predictedBehavior}
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-purple-300">
              Agent Voices We'll Simulate
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {society.agentVoicesToSim.map((voice, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-full border border-border hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200"
              >
                {voice}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
