interface SocietyHeaderProps {
  societyName: string;
  score: number;
}

export default function SocietyHeader({ societyName, score }: SocietyHeaderProps) {
  const scorePercentage = Math.round(score * 100);

  return (
    <div className="border-b border-gray-200 pb-6 mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Society: {societyName}
          </h1>
          <p className="text-sm text-gray-600">
            Simulated reaction from agent voices within this buyer society
          </p>
        </div>
        <div className="px-4 py-2 bg-gray-100 rounded">
          <div className="text-xs text-gray-600 mb-0.5">Relevance Score</div>
          <div className="text-2xl font-bold text-gray-900">{scorePercentage}%</div>
        </div>
      </div>
    </div>
  );
}
