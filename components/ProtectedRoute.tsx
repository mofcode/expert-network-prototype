'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = sessionStorage.getItem('isAuthenticated') === 'true';

    if (!authenticated && pathname !== '/login') {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }

    setIsChecking(false);
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple rounded-lg mx-auto animate-pulse"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated and not on login page
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
