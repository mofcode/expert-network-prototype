'use client';

import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  icon: string;
  transcriptCount: number;
  href: string;
}

export default function CategoryCard({ name, icon, transcriptCount, href }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-purple/10 to-purple/20 rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-purple">{icon}</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-sm text-gray-600">
            {transcriptCount.toLocaleString()} transcripts
          </p>
        </div>
      </div>
    </Link>
  );
}
