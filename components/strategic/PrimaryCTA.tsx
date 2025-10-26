"use client";

interface PrimaryCTAProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function PrimaryCTA({ onClick, disabled = false, loading = false }: PrimaryCTAProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full px-10 py-5 font-bold text-base rounded-xl transition-all transform
        ${disabled || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-gray-900 to-black text-white hover:scale-[1.02] shadow-xl hover:shadow-2xl'
        }
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Running Simulation...
        </span>
      ) : (
        'Run Simulation'
      )}
    </button>
  );
}
