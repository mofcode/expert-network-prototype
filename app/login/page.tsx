'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Set your password here
    const correctPassword = 'demo2026';

    if (password === correctPassword) {
      // Store authentication in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } else {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple/5 to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/g2-logo.svg"
              alt="G2 Logo"
              className="h-10 w-auto"
            />
            <span className="text-2xl font-semibold text-gray-900">PxD Prototype</span>
          </div>
          <p className="text-sm text-gray-600">
            Please enter the password to continue.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                required
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple hover:bg-purple/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Prototype Demo • For authorized users only</p>
        </div>
      </div>
    </div>
  );
}
