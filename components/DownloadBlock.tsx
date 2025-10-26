"use client";

export default function DownloadBlock() {
  const handleExport = () => {
    // TODO(yashas): Implement actual export/download functionality
    alert('Export functionality coming soon! This will generate a PDF playbook with all recommendations.');
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            Export Your Playbook
          </h3>
          <p className="text-sm text-gray-300 max-w-2xl">
            Download a shareable brief with all creative recommendations, society insights, and trust fixes. Take this to your team and aim your ad spend at the right culture.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex-shrink-0 ml-6 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Brief
        </button>
      </div>
    </div>
  );
}
