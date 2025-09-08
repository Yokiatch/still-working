import React from 'react'

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-700 rounded w-40"></div>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar skeleton */}
          <div className="w-64 bg-gray-900 p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 p-6">
            <div className="h-12 bg-gray-800 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3">
                  <div className="w-12 h-12 bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded"></div>
              <div>
                <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            </div>
            <div className="w-24 h-6 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton