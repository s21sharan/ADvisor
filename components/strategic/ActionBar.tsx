"use client";

interface ActionBarProps {
  onDownloadReport: () => void;
  onGenerateVariant: () => void;
}

export default function ActionBar({ onDownloadReport, onGenerateVariant }: ActionBarProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl shadow-2xl p-10">
      <div className="flex items-center justify-between">
        <div className="text-white">
          <h4 className="text-xl font-bold mb-2">Export & Next Steps</h4>
          <p className="text-gray-300">
            Download your simulation report or generate optimized creative variants
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onDownloadReport}
            className="px-6 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl text-sm font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>

          <button
            onClick={onGenerateVariant}
            className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-sm font-bold text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate New Variant
          </button>
        </div>
      </div>
    </div>
  );
}
