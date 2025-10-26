import { Society } from '@/types/advisor';

interface SocietyCardProps {
  society: Society;
  onViewDetails: () => void;
}

export default function SocietyCard({ society, onViewDetails }: SocietyCardProps) {
  const scorePercentage = Math.round(society.score * 100);
  const scoreColor = society.score >= 0.8 ? 'text-green-400' : society.score >= 0.6 ? 'text-yellow-400' : 'text-muted-foreground';
  const scoreBg = society.score >= 0.8 ? 'bg-green-500/20 border-green-500/30' : society.score >= 0.6 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-muted border-border';

  return (
    <div className={`
      glass-effect rounded-2xl p-8 transition-all duration-300 hover-lift group
      ${society.recommended
        ? 'border-2 border-blue-400 ring-2 ring-blue-400/30 shadow-neon'
        : 'border border-border hover:border-blue-400/50'
      }
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            {society.recommended && (
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-glow animate-pulse-glow">
                ⭐ RECOMMENDED
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gradient">{society.name}</h3>
        </div>
        <div className={`px-6 py-4 ${scoreBg} rounded-xl border shadow-sm`}>
          <div className="text-xs text-muted-foreground mb-1">Match</div>
          <span className={`text-3xl font-bold ${scoreColor}`}>{scorePercentage}%</span>
        </div>
      </div>

      {/* Core Insights */}
      <div className="space-y-6 mb-8">
        <div className="glass-effect rounded-xl p-6 border border-green-500/20 group-hover:border-green-400/40 transition-colors">
          <dt className="text-xs font-bold text-green-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            Motivation
          </dt>
          <dd className="text-base text-foreground leading-relaxed">{society.motivation}</dd>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-red-500/20 group-hover:border-red-400/40 transition-colors">
          <dt className="text-xs font-bold text-red-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            Friction
          </dt>
          <dd className="text-base text-foreground leading-relaxed">{society.friction}</dd>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-blue-500/20 group-hover:border-blue-400/40 transition-colors">
          <dt className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Conversion Trigger
          </dt>
          <dd className="text-base text-foreground leading-relaxed">{society.conversionTrigger}</dd>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onViewDetails}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-base font-bold hover:shadow-neon hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        View Agent Transcripts
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}
