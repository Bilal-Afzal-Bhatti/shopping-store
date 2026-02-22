import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  margin?: string; // optional: margin control
}

export default function SliderArrows({ onPrev, onNext, margin }: SliderArrowsProps) {
  return (
    <div
      className={`
        flex items-center space-x-2
        absolute top-35 right-2 sm:right-40   // ✅ right edge on mobile, bigger margin on desktop
        transform -translate-y-1/2
        ${margin || ""}
      `}
    >
      <button
        onClick={onPrev}
        className="p-2 bg-gray-200 rounded-full border border-gray-300 hover:bg-gray-300 transition"
      >
        <ChevronLeft className="text-black" size={18} />
      </button>
      <button
        onClick={onNext}
        className="p-2 bg-gray-200 rounded-full border border-gray-300 hover:bg-gray-300 transition"
      >
        <ChevronRight className="text-black" size={18} />
      </button>
    </div>
  );
}
