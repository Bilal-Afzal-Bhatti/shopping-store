import { useRef } from "react";
import Slider from "react-slick";
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
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SliderArrows from "./arrow";
import Line from "./line";

export default function BrowseByCategory() {
  const sliderRef = useRef<Slider>(null);

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

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6, // Standard for categories is usually higher
    slidesToScroll: 1,
    arrows: false, // We use our custom arrows
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    /* Standardized padding and max-width to match other components */
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-10 sm:mt-20 relative font-sans">
      
      {/* 🔴 Section Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm md:text-base uppercase tracking-wider">
          Categories
        </span>
      </div>

      {/* ⚡ Header Row: Heading and Arrows are INLINE and Arrows are RIGHT */}
      <div className="flex flex-row items-center justify-between w-full mb-8">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-black tracking-tight">
          Browse By Category
        </h2>
        
        {/* Arrows forced to the right side of the container */}
        <div className="flex-shrink-0">
          <SliderArrows
            onPrev={() => sliderRef.current?.slickPrev()}
            onNext={() => sliderRef.current?.slickNext()}
          />
        </div>
      </div>

      {/* 🛍️ Category Slider */}
      <div className="w-full">
        <Slider ref={sliderRef} {...settings}>
          {categories.map((cat, index) => (
            <div key={index} className="px-2 sm:px-4">
              <div className="
                border border-gray-200 bg-white hover:bg-[#DB4444] hover:text-white
                text-black rounded-md transition-all duration-300 group
                aspect-square flex flex-col items-center justify-center cursor-pointer
              ">
                <div className="mb-2 transition-colors duration-300">
                  {cat.icon}
                </div>
                <p className="text-xs sm:text-sm md:text-base font-medium text-center">
                  {cat.name}
                </p>
              </div>
            </div>
          ))}
        </Slider>
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