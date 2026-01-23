'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import SparkleIcon from './icons/SparkleIcon';

export default function AskExpertAIWidget() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/ask?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="card bg-white border-gray-200">
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <SparkleIcon className="w-5 h-5" />
          <h3 className="text-lg font-bold text-gray-900">Ask Expert AI</h3>
        </div>
        <p className="text-sm text-gray-600">
          Get instant answers from 21,456+ expert transcripts
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-10 pr-20 py-3 bg-white border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-dark transition-colors"
          >
            Ask
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Try: "CRM migration challenges" or "SaaS pricing strategies"
        </p>
      </form>
    </div>
  );
}
