import { useState } from 'react';

interface Tool {
  id: number;
  name: string;
  price: number;
  priceUnit: string;
  hasDelivery?: boolean;
  deliveryPrice?: number;
}

interface CostCalculatorProps {
  tool: Tool;
}

export default function CostCalculator({ tool }: CostCalculatorProps) {
  const [days, setDays] = useState(1);
  const [includeDelivery, setIncludeDelivery] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate costs
  const rentalCost = tool.price * days;
  const deliveryCost = includeDelivery && tool.hasDelivery ? (tool.deliveryPrice || 0) : 0;
  const totalCost = rentalCost + deliveryCost;


  if (!showCalculator) {
    return (
      <button
        onClick={() => setShowCalculator(true)}
        className="w-full bg-teal/10 text-teal border border-teal/20 py-3 px-4 rounded-xl hover:bg-teal/20 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span>حاسبة التكلفة</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark-blue">حاسبة التكلفة</h3>
        <button
          onClick={() => setShowCalculator(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {/* Days Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عدد أيام الإيجار
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDays(Math.max(1, days - 1))}
            className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            -
          </button>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg outline-none focus:border-teal"
            min="1"
          />
          <button
            onClick={() => setDays(days + 1)}
            className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Delivery Option */}
      {tool.hasDelivery && (
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDelivery}
              onChange={(e) => setIncludeDelivery(e.target.checked)}
              className="w-4 h-4 text-teal border-gray-300 rounded focus:ring-teal"
            />
            <span className="text-sm text-gray-700">
              إضافة التوصيل ({tool.deliveryPrice} درهم)
            </span>
          </label>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">تكلفة الإيجار ({days} أيام)</span>
            <span className="font-medium">{rentalCost} درهم</span>
          </div>
          {includeDelivery && deliveryCost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">تكلفة التوصيل</span>
              <span className="font-medium">{deliveryCost} درهم</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between">
            <span className="font-bold text-dark-blue">المجموع</span>
            <span className="font-bold text-orange text-lg">{totalCost} درهم</span>
          </div>
        </div>
      </div>


      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            const message = `مرحباً، أود استئجار ${tool.name} لمدة ${days} أيام. التكلفة المحسوبة: ${totalCost} درهم`;
            window.open(`https://wa.me/212600000000?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          احجز عبر واتساب
        </button>
        <button
          onClick={() => {
            const phone = '212600000000';
            window.open(`tel:+${phone}`, '_self');
          }}
          className="bg-orange text-white py-2 px-3 rounded-lg text-sm hover:bg-orange/90 transition-colors"
        >
          اتصل مباشرة
        </button>
      </div>
    </div>
  );
}
