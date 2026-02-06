export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-primary-200"></div>
        
        {/* Inner spinning ring */}
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 rounded-full bg-primary-600"></div>
        </div>
      </div>
      <span className="ml-4 text-gray-600 font-medium">Loading articles...</span>
    </div>
  );
}
