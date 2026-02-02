'use client';

interface ExpertCardProps {
  id: string;
  name: string;
  role: string;
  company: string;
  expertise: string[];
  stats: {
    transcripts: number;
    citations: number;
    upvotes: number;
  };
  avatarUrl: string;
  onBookCall: (expertId: string) => void;
  onViewProfile: (expertId: string) => void;
}

export default function ExpertCard({
  id,
  name,
  role,
  company,
  expertise,
  stats,
  avatarUrl,
  onBookCall,
  onViewProfile,
}: ExpertCardProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={avatarUrl}
          alt={name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-600 truncate">{role}</p>
          <p className="text-xs text-gray-500 truncate">{company}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Expertise</div>
        <div className="flex flex-wrap gap-1.5">
          {expertise.slice(0, 3).map((skill) => (
            <span key={skill} className="badge-outline text-xs">
              {skill}
            </span>
          ))}
          {expertise.length > 3 && (
            <span className="badge-outline text-xs text-gray-400">
              +{expertise.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mb-4 py-3 border-t border-gray-200">
        <div className="flex items-center space-x-1">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
          <span>{stats.transcripts} transcripts</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>format_quote</span>
          <span>{stats.citations} citations</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewProfile(id)}
          className="btn-secondary text-xs py-2"
        >
          View Profile
        </button>
        <button
          onClick={() => onBookCall(id)}
          className="btn-primary text-xs py-2"
        >
          Book Call
        </button>
      </div>
    </div>
  );
}
