'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface AISearchInputProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  showExamples?: boolean;
}

export default function AISearchInput({
  onSearch,
  disabled = false,
  placeholder = "Ask about expert insights...",
  initialValue = '',
  showExamples = true
}: AISearchInputProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   disabled:bg-gray-50 disabled:cursor-not-allowed
                   text-gray-900 placeholder-gray-500"
        />
      </div>
      {showExamples && (
        <p className="mt-2 text-xs text-gray-500">
          Try: "CRM migration challenges" or "SaaS pricing strategies"
        </p>
      )}
    </form>
  );
}
