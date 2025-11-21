import { Link } from 'react-router-dom';
import { useComparison } from '../contexts/ComparisonContext';

export default function ToolComparison() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-dark-blue">مقارنة الأدوات</h3>
        <button
          onClick={clearComparison}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-right py-2 font-medium text-gray-600">المقارنة</th>
              {comparisonList.map((tool) => (
                <th key={tool.id} className="text-center py-2 px-2 min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => removeFromComparison(tool.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className="w-20 h-20 object-contain mx-auto mb-2 rounded-lg"
                    />
                    <h4 className="font-medium text-dark-blue leading-tight">
                      {tool.name}
                    </h4>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price Row */}
            <tr className="border-b">
              <td className="py-3 font-medium text-gray-700">السعر</td>
              {comparisonList.map((tool) => (
                <td key={tool.id} className="text-center py-3">
                  <div className="text-orange font-bold">
                    {tool.price} درهم / {tool.priceUnit}
                  </div>
                </td>
              ))}
            </tr>

            {/* Location Row */}
            <tr className="border-b">
              <td className="py-3 font-medium text-gray-700">الموقع</td>
              {comparisonList.map((tool) => (
                <td key={tool.id} className="text-center py-3 text-gray-600">
                  {tool.location}
                </td>
              ))}
            </tr>

            {/* Condition Row */}
            <tr className="border-b">
              <td className="py-3 font-medium text-gray-700">الحالة</td>
              {comparisonList.map((tool) => (
                <td key={tool.id} className="text-center py-3 text-gray-600">
                  {tool.condition}
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr className="border-b">
              <td className="py-3 font-medium text-gray-700">التقييم</td>
              {comparisonList.map((tool) => (
                <td key={tool.id} className="text-center py-3">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{tool.rating}</span>
                    <span className="text-gray-500 text-xs">({tool.reviews})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Delivery Row */}
            <tr className="border-b">
              <td className="py-3 font-medium text-gray-700">التوصيل</td>
              {comparisonList.map((tool) => (
                <td key={tool.id} className="text-center py-3">
                  {tool.hasDelivery ? (
                    <div className="text-green-600">
                      ✓ متاح
                      {tool.deliveryPrice && (
                        <div className="text-xs text-gray-500">
                          {tool.deliveryPrice} درهم
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">غير متاح</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Actions Row */}
            <tr>
              <td className="py-3 font-medium text-gray-700">الإجراءات</td>
              {comparisonList.map((tool) => (
                <td key={tool.id} className="text-center py-3">
                  <div className="space-y-2">
                    <Link
                      to={`/outil/${tool.id}`}
                      className="block w-full bg-orange text-white py-2 px-3 rounded-lg text-sm hover:bg-orange/90 transition-colors"
                    >
                      عرض التفاصيل
                    </Link>
                    <button
                      onClick={() => {
                        const message = `مرحباً، أود الاستفسار عن ${tool.name} - ${tool.price} درهم/${tool.priceUnit}`;
                        window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="block w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      واتساب
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
