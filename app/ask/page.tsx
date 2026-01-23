'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AskExpertAI from '@/components/ask-expert-ai/AskExpertAI';
import { initializeSampleData } from '@/lib/storage';

function AskPageContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const initialQuery = searchParams.get('q') || '';

  useEffect(() => {
    setMounted(true);
    initializeSampleData();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple rounded-lg mx-auto animate-pulse"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ask Expert AI
          </h1>
          <p className="text-gray-600">
            Explore insights from 21,456+ expert transcripts using natural language queries
          </p>
        </div>

        {/* Full AskExpertAI Component */}
        <AskExpertAI initialQuery={initialQuery} />
      </main>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple rounded-lg mx-auto animate-pulse"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AskPageContent />
    </Suspense>
  );
}
