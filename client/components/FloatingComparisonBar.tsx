import { Link } from 'react-router-dom';
import { useComparison } from '../contexts/ComparisonContext';

export default function FloatingComparisonBar() {
  const { comparisonList, comparisonCount, removeFromComparison } = useComparison();

  if (comparisonCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:right-4 md:w-80 bg-white border-2 border-orange rounded-xl shadow-2xl z-50 animate-slide-up">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-dark-blue text-sm">
            مقارنة الأدوات ({comparisonCount}/3)
          </h3>
          <Link
            to="/comparateur"
            className="text-orange text-sm font-medium hover:text-orange/80 transition-colors"
          >
            عرض المقارنة
          </Link>
        </div>

        <div className="flex gap-2 mb-3">
          {comparisonList.map((tool) => (
            <div key={tool.id} className="relative">
              <img
                src={tool.image}
                alt={tool.name}
                className="w-16 h-16 object-contain rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeFromComparison(tool.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: 3 - comparisonCount }).map((_, index) => (
            <div key={index} className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
          ))}
        </div>

        <Link
          to="/comparateur"
          className="block w-full bg-orange text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-orange/90 transition-colors"
        >
          مقارنة الآن
        </Link>
      </div>
    </div>
  );
}
