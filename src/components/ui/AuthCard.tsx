'use client';

import React from 'react';
import Image from 'next/image';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/CodeRushLogo.png"
            alt="Code Rush Logo"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
} 