interface PlaybookHeaderProps {
  societyName: string;
}

export default function PlaybookHeader({ societyName }: PlaybookHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 mb-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Your Playbook
          </h1>
          <p className="text-base text-gray-700 mb-3">
            Primary win state: <span className="font-semibold text-green-700">{societyName}</span>
          </p>
          <p className="text-sm text-gray-600">
            We've simulated how this artificial society reacts to your creative, what they'll share in group chats, and what messaging fixes will actually convert them. This is pre-spend culture testing—aim your budget here.
          </p>
        </div>
      </div>
    </div>
  );
}
