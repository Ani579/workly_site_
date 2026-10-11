import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-2xl" />
          <div className="h-4 w-96 bg-gray-100 rounded-xl" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-2xl" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-72 rounded-3xl bg-gray-100 lg:col-span-5" />
        <div className="h-72 rounded-3xl bg-gray-100 lg:col-span-7" />
        <div className="h-64 rounded-3xl bg-gray-100 lg:col-span-6" />
        <div className="h-64 rounded-3xl bg-gray-100 lg:col-span-6" />
        <div className="h-80 rounded-3xl bg-gray-100 lg:col-span-12" />
      </div>
    </div>
  );
}

