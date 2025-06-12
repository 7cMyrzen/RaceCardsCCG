'use client';

import React, { useState, ReactNode } from 'react';

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export function Tabs({ tabs }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-300">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`px-4 py-2 font-semibold focus:outline-none ${
              i === activeIndex ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
