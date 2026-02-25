import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Headphones,
  Watch,
  Gamepad2,
  Smartphone,
  Tv,
  MousePointerClick,
  Keyboard,
} from "lucide-react";
import SliderArrows from "./arrow";
import Line from "./line";

export default function BrowseByCategory() {
  const [width, setWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "Phones", icon: <Smartphone size={40} /> },
    { name: "Monitors", icon: <Monitor size={40} /> },
    { name: "Headphones", icon: <Headphones size={40} /> },
    { name: "Watches", icon: <Watch size={40} /> },
    { name: "Gaming", icon: <Gamepad2 size={40} /> },
    { name: "TVs", icon: <Tv size={40} /> },
    { name: "Keyboards", icon: <Keyboard size={40} /> },
    { name: "Accessories", icon: <MousePointerClick size={40} /> },
  ];

  // Update width for drag constraints
  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  // Button logic for horizontal scrolling
  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-10 sm:mt-20 relative font-sans">
      
      {/* 🔴 Section Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm md:text-base uppercase tracking-wider">
          Categories
        </span>
      </div>

      {/* ⚡ Header Row */}
      <div className="flex flex-row items-center justify-between w-full mb-8">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-black tracking-tight">
          Browse By Category
        </h2>
        
        <div className="shrink-0">
          <SliderArrows
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* 🛍️ Framer Motion Category Slider */}
      <div 
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing" 
        ref={carouselRef}
      >
        <motion.div 
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          whileTap={{ cursor: "grabbing" }}
          className="flex gap-4 sm:gap-5"
        >
          {categories.map((cat, index) => (
            <motion.div 
              key={index} 
              // Category Card sizing
              className="min-w-[140px] sm:min-w-[170px] aspect-square pointer-events-none"
            >
              <div className="
                w-full h-full border border-gray-200 bg-white hover:bg-[#DB4444] hover:text-white
                text-black rounded-md transition-all duration-300 group
                flex flex-col items-center justify-center cursor-pointer pointer-events-auto
              ">
                <div className="mb-2 transition-colors duration-300 group-hover:text-white">
                  {cat.icon}
                </div>
                <p className="text-xs sm:text-sm md:text-base font-medium text-center">
                  {cat.name}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 🔶 Standardized Line */}
      <Line
        color="bg-gray-200"
        width="w-full"
        height="h-[1px]"
        margin="mt-16"
      />
    </div>
  );
}