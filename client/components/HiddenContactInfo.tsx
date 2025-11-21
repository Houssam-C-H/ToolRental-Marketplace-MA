interface ContactInfoProps {
  phoneNumber: string;
  whatsappNumber?: string;
  type: "phone" | "whatsapp";
  label: string;
  icon: React.ReactNode;
}

export default function ContactInfo({
  phoneNumber,
  whatsappNumber,
  type,
  label,
  icon,
}: ContactInfoProps) {
  const actualNumber = whatsappNumber || phoneNumber;

  const handleClick = () => {
    if (type === "phone") {
      window.location.href = `tel:${actualNumber}`;
    } else if (type === "whatsapp") {
      const cleanNumber = actualNumber.replace(/[^\d]/g, "");
      window.open(
        `https://wa.me/${cleanNumber}?text=مرحبا، أريد الاستفسار عن الأداة`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-right group"
    >
      <div className="text-green-600">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-medium flex items-center gap-2">
          <span>{phoneNumber}</span>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            اضغط للاتصال
          </span>
        </div>
      </div>
      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
