import { PlaybookRec } from '@/lib/types';

interface ObjectionListProps {
  playbook: PlaybookRec;
}

export default function ObjectionList({ playbook }: ObjectionListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Society Objections & Trust Fixes
      </h2>

      <div className="space-y-4">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-900 mb-1.5">
                TOP OBJECTION FROM SIMULATED SOCIETY
              </p>
              <p className="text-sm text-gray-800 italic">
                "{playbook.topObjection}"
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-900 mb-1.5">
                HOW TO FIX THIS TRUST ISSUE
              </p>
              <p className="text-sm text-gray-800">
                {playbook.fixAdvice}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-medium">What this means:</span> This objection came up in agent simulations of how this society talks about products like yours in group chats and forums. Fix it before you spend on reach, or expect high bounce and low sharing.
        </p>
      </div>
    </div>
  );
}
