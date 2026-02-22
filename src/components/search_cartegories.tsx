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
    { name: "Smartphones", icon: <Smartphone size={40} /> },
    { name: "Monitors", icon: <Monitor size={40} /> },
    { name: "Headphones", icon: <Headphones size={40} /> },
    { name: "Watches", icon: <Watch size={40} /> },
    { name: "Gaming", icon: <Gamepad2 size={40} /> },
    { name: "Televisions", icon: <Tv size={40} /> },
    { name: "Keyboards", icon: <Keyboard size={40} /> },
    { name: "Accessories", icon: <MousePointerClick size={40} /> },
  ];

const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024, // small laptops
      settings: { slidesToShow: 3 }
    },
    {
      breakpoint: 768, // tablets
      settings: { slidesToShow: 2 }
    },
    {
      breakpoint: 640, // mobile
      settings: { slidesToShow: 1 }
    }
  ]
};


  return (
    <div className="p-6 sm:p-8 md:p-10 bg-white relative mt-0 ml-2 sm:ml-4 md:ml-16">
      {/* 🔴 Label */}
      <div className="inline-block bg-red-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md mb-3">
        Categories
      </div>

      {/* 🛍️ Header + Arrows */}
      <div className="flex flex-col sm:flex-row  sm:items-center sm:justify-between mb-9 sm:mb-6">
        {/* Heading */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
  Browse By Category
</h2>

 <div className="flex md:-mr-6 sm:ml-4 mr-10  -top-26 sm:-mt-28 md:mt-4 absolute right-10">
      <SliderArrows
        onPrev={() => sliderRef.current?.slickPrev()}
        onNext={() => sliderRef.current?.slickNext()}
      />
    </div>
      </div>
<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:pr-26">
  <Slider ref={sliderRef} {...settings}>
    {categories.map((cat, index) => (
      <div key={index} className="px-2">
        <div className="
          bg-gray-100 hover:bg-[#DB4444] hover:text-white
          text-black rounded-xl shadow-sm transition-all duration-300
          h-[120px] sm:h-[140px] md:h-40
          flex flex-col items-center justify-center
        ">
          <div className="text-3xl sm:text-4xl mb-2">
            {cat.icon}
          </div>
          <p className="text-sm sm:text-base font-medium text-center">
            {cat.name}
          </p>
        </div>
      </div>
    ))}
  </Slider>
</div>

      {/* 🔶 Line under section */}
      <Line
        color="bg-gray-300"
        width="w-[320px] sm:w-[640px] md:w-[900px] lg:w-[1210px]"
        height="h-[1px]"
        margin="mt-10 ml-3 sm:mt-16 sm:ml-5"
      />
    </div>
  );
}
