import React from 'react';
import { cn } from '../../lib/utils';

interface ProductComparisonProps {
    originalProduct: any;
    modifiedData: any;
    className?: string;
}

interface FieldComparisonProps {
    label: string;
    originalValue: any;
    newValue: any;
    type?: 'text' | 'number' | 'boolean' | 'array';
}

const FieldComparison: React.FC<FieldComparisonProps> = ({
    label,
    originalValue,
    newValue,
    type = 'text'
}) => {
    const hasChanged = originalValue !== newValue;

    const formatValue = (value: any) => {
        if (value === null || value === undefined) return 'غير محدد';
        if (type === 'boolean') return value ? 'نعم' : 'لا';
        if (type === 'array' && Array.isArray(value)) return value.join(', ');
        if (type === 'number') return value?.toString() || '0';
        return value?.toString() || '';
    };

    const originalFormatted = formatValue(originalValue);
    const newFormatted = formatValue(newValue);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Value */}
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 font-medium">القيمة الحالية</div>
                    <div className={cn(
                        "p-3 rounded-lg border text-sm",
                        hasChanged
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                    )}>
                        {originalFormatted}
                    </div>
                </div>

                {/* New Value */}
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 font-medium">القيمة الجديدة</div>
                    <div className={cn(
                        "p-3 rounded-lg border text-sm",
                        hasChanged
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                    )}>
                        {newFormatted}
                    </div>
                </div>
            </div>

            {/* Change Indicator */}
            {hasChanged && (
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-700 font-medium">تم تغيير هذا الحقل</span>
                </div>
            )}
        </div>
    );
};

const ProductComparison: React.FC<ProductComparisonProps> = ({
    originalProduct,
    modifiedData,
    className
}) => {
    if (!originalProduct || !modifiedData) {
        return (
            <div className="p-4 text-center text-gray-500">
                لا توجد بيانات للمقارنة
            </div>
        );
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    مقارنة تفاصيل المنتج
                </h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span className="text-gray-600">القيمة الحالية</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span className="text-gray-600">القيمة الجديدة</span>
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2">
                    المعلومات الأساسية
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <FieldComparison
                        label="اسم الأداة"
                        originalValue={originalProduct.name}
                        newValue={modifiedData.toolName}
                    />

                    <FieldComparison
                        label="الفئة"
                        originalValue={originalProduct.category}
                        newValue={modifiedData.category}
                    />

                    <FieldComparison
                        label="العلامة التجارية"
                        originalValue={originalProduct.brand}
                        newValue={modifiedData.brand}
                    />

                    <FieldComparison
                        label="الموديل"
                        originalValue={originalProduct.model}
                        newValue={modifiedData.model}
                    />

                    <FieldComparison
                        label="الحالة"
                        originalValue={originalProduct.condition}
                        newValue={modifiedData.condition}
                    />

                    <FieldComparison
                        label="السعر اليومي (درهم)"
                        originalValue={originalProduct.daily_price}
                        newValue={modifiedData.dailyPrice}
                        type="number"
                    />
                </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2">
                    معلومات الموقع
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <FieldComparison
                        label="المدينة"
                        originalValue={originalProduct.city}
                        newValue={modifiedData.city}
                    />

                    <FieldComparison
                        label="الحي"
                        originalValue={originalProduct.neighborhood}
                        newValue={modifiedData.neighborhood}
                    />
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2">
                    معلومات الاتصال
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <FieldComparison
                        label="اسم المالك"
                        originalValue={originalProduct.owner_name}
                        newValue={modifiedData.ownerName}
                    />

                    <FieldComparison
                        label="رقم الهاتف"
                        originalValue={originalProduct.contact_phone}
                        newValue={modifiedData.contactPhone}
                    />

                    <FieldComparison
                        label="واتساب"
                        originalValue={originalProduct.contact_whatsapp}
                        newValue={modifiedData.contactWhatsApp}
                    />
                </div>
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2">
                    معلومات التوصيل
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <FieldComparison
                        label="يوجد توصيل"
                        originalValue={originalProduct.has_delivery}
                        newValue={modifiedData.hasDelivery}
                        type="boolean"
                    />

                    <FieldComparison
                        label="سعر التوصيل (درهم)"
                        originalValue={originalProduct.delivery_price}
                        newValue={modifiedData.deliveryPrice}
                        type="number"
                    />

                    <FieldComparison
                        label="ملاحظات التوصيل"
                        originalValue={originalProduct.delivery_notes}
                        newValue={modifiedData.deliveryNotes}
                    />
                </div>
            </div>

            {/* Description and Specifications */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2">
                    الوصف والمواصفات
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <FieldComparison
                        label="الوصف"
                        originalValue={originalProduct.description}
                        newValue={modifiedData.description}
                    />

                    <FieldComparison
                        label="المواصفات"
                        originalValue={originalProduct.specifications}
                        newValue={modifiedData.specifications}
                    />
                </div>
            </div>

            {/* Images Comparison */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-800 border-b border-gray-100 pb-2">
                    الصور
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <FieldComparison
                        label="عدد الصور"
                        originalValue={originalProduct.images?.length || 0}
                        newValue={modifiedData.images?.length || 0}
                        type="number"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductComparison;
