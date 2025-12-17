export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-6">
      <div className="animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 sm:mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="h-32 bg-gray-100 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  )
}

