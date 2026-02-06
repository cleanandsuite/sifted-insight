interface SourceFilterProps {
  sources: string[];
  selectedSource: string;
  onSelectSource: (source: string) => void;
}

export default function SourceFilter({
  sources,
  selectedSource,
  onSelectSource,
}: SourceFilterProps) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Source</h3>
      <div className="flex flex-wrap gap-2">
        {/* All Sources Button */}
        <button
          onClick={() => onSelectSource('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedSource === 'All'
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          All Sources
          <span className="ml-2 text-xs opacity-75">({sources.length + 1})</span>
        </button>

        {/* Individual Source Buttons */}
        {sources.map(source => (
          <button
            key={source}
            onClick={() => onSelectSource(source)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedSource === source
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {source}
          </button>
        ))}
      </div>
    </div>
  );
}
