import { Society } from '@/types/advisor';
import SocietyCard from './SocietyCard';

interface SocietyListProps {
  societies: Society[];
  onViewDetails: (societyId: string) => void;
}

export default function SocietyList({ societies, onViewDetails }: SocietyListProps) {
  return (
    <div className="space-y-6">
      {societies.map((society) => (
        <SocietyCard
          key={society.id}
          society={society}
          onViewDetails={() => onViewDetails(society.id)}
        />
      ))}
    </div>
  );
}
