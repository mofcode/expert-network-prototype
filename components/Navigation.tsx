'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { userStorage, User } from '@/lib/storage';
import ProfileSwitcher from './ProfileSwitcher';

// Helper function to get real professional photos for experts
function getAvatarUrl(name: string): string {
  const expertPhotos: Record<string, string> = {
    'Sarah James': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    'Alex Rodriguez': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Maria Santos': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    'James Kim': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  };

  if (expertPhotos[name]) {
    return expertPhotos[name];
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  const seed = Math.abs(hash) % 1000;
  return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face&seed=${seed}`;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = userStorage.getCurrent();
    setUser(currentUser);
  }, [pathname]); // Re-check user on pathname change

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileSwitcher(false);
      }
    }

    if (showProfileSwitcher) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showProfileSwitcher]);

  const handleUserSwitch = (userId: string) => {
    const users = userStorage.getAll();
    const selectedUser = users.find(u => u.id === userId);
    if (!selectedUser) return;

    userStorage.setCurrent(selectedUser);
    setUser(selectedUser);
    setShowProfileSwitcher(false);

    // Force full page reload to re-initialize with new user
    window.location.href = '/';
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/library', label: 'Library' },
    { href: '/ask', label: 'Ask Expert AI' },
  ];

  const getProfileBadge = () => {
    if (!user) return 'Loading...';
    if (user.activeProfileType === 'expert') {
      return user.profiles.expert?.badge || 'Active Expert';
    }
    return user.profiles.seeker?.role || 'Member';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/g2-logo.svg"
              alt="G2 Logo"
              className="h-8 w-auto transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">Expert Network</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User profile */}
          <div className="hidden md:flex items-center relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
              className="flex items-center space-x-3 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'Loading...'}</div>
                <div className="text-xs text-gray-500">{getProfileBadge()}</div>
              </div>
              <img
                src={user?.avatarUrl || getAvatarUrl('Default')}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showProfileSwitcher ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileSwitcher && user && (
              <ProfileSwitcher
                currentUser={user}
                onSwitchUser={handleUserSwitch}
                onClose={() => setShowProfileSwitcher(false)}
              />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (hidden by default) */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                pathname === item.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
