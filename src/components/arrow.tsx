import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  margin?: string; // optional: custom margin classes
  position?: string; // optional: custom position classes
}

export default function SliderArrows({ onPrev, onNext, margin = "", position = "" }: SliderArrowsProps) {
  return (
    <div
      className={`
        flex items-center space-x-2
        ${position}   // allows overriding absolute/fixed positioning
        ${margin}     // allows custom margins from props
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