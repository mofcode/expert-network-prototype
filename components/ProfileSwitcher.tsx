'use client';

import { User, userStorage } from '@/lib/storage';
import { opportunityStorage, bookingStorage } from '@/lib/storage';

interface ProfileSwitcherProps {
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  onClose: () => void;
}

export default function ProfileSwitcher({ currentUser, onSwitchUser, onClose }: ProfileSwitcherProps) {
  // Get all users
  const allUsers = userStorage.getAll();

  const getUserStats = (user: User) => {
    if (user.profiles.expert) {
      return {
        label: 'Expert',
        role: user.profiles.expert.role,
        detail: `$${user.profiles.expert.earnings.total.toLocaleString()} earned • ${opportunityStorage.getPending().length} opportunities`,
      };
    } else if (user.profiles.seeker) {
      const activeRequests = user.profiles.seeker.postedOpportunities.length +
        user.profiles.seeker.bookings.filter(id => {
          const booking = bookingStorage.getById(id);
          return booking?.status === 'requested' || booking?.status === 'confirmed';
        }).length;
      return {
        label: 'Member',
        role: user.profiles.seeker.role,
        detail: `${user.profiles.seeker.savedTranscripts.length} saved • ${activeRequests} active requests`,
      };
    }
    return null;
  };

  const handleUserClick = (userId: string) => {
    if (userId !== currentUser.id) {
      onSwitchUser(userId);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase">Switch Account</div>
      </div>

      {allUsers.map((user) => {
        const stats = getUserStats(user);
        const isActive = user.id === currentUser.id;

        return (
          <button
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
              isActive
                ? 'bg-orange-50 hover:bg-orange-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{user.name}</span>
                  {isActive && (
                    <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {stats && (
                  <>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {stats.label} • {stats.role}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.detail}
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
