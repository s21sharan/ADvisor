import { AgentFeedback } from '@/types/advisor';

interface AgentFeedbackThreadProps {
  feedbacks: AgentFeedback[];
}

export default function AgentFeedbackThread({ feedbacks }: AgentFeedbackThreadProps) {
  return (
    <div className="space-y-6">
      {feedbacks.map((feedback, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          {/* Agent Role Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {feedback.agentRole.split(' ')[0].substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{feedback.agentRole}</h3>
              <p className="text-xs text-gray-600">Simulated agent voice</p>
            </div>
          </div>

          {/* Feedback Details */}
          <div className="space-y-4">
            <div>
              <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Emotional Reaction
              </dt>
              <dd className="text-sm text-gray-900 leading-relaxed">
                {feedback.emotionalReaction}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Primary Objection
              </dt>
              <dd className="text-sm text-gray-900 leading-relaxed">
                {feedback.objection}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Click Trigger
              </dt>
              <dd className="text-sm text-gray-900 leading-relaxed">
                {feedback.clickTrigger}
              </dd>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <dt className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Suggested Change
              </dt>
              <dd className="text-sm text-gray-900 leading-relaxed bg-green-50 border border-green-200 rounded p-3">
                {feedback.suggestedChange}
              </dd>
            </div>

            {feedback.funnelAnalysis && (
              <div className="pt-4 border-t border-gray-200">
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Funnel Analysis
                </dt>
                <dd className="text-sm text-gray-900 leading-relaxed italic">
                  {feedback.funnelAnalysis}
                </dd>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
