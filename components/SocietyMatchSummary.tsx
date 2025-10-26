interface SocietyMatchSummaryProps {
  societyCount: number;
}

export default function SocietyMatchSummary({ societyCount }: SocietyMatchSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">
        Society Match Complete
      </h1>
      <p className="text-base text-gray-700 mb-4">
        We've mapped your ad to <span className="font-semibold text-blue-700">{societyCount} high-resonance artificial societies</span>—networked buyer micro-communities with shared incentives, pain points, and influence patterns.
      </p>
      <p className="text-sm text-gray-600">
        These aren't generic personas. Each society is a simulated culture that will stress-test your creative before you spend a dollar on reach. We're about to run agent-based simulations to show you how each group will talk about your ad, share it (or ignore it), and what messaging will actually make them convert.
      </p>
    </div>
  );
}
