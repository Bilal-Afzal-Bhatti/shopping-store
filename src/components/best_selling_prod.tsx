import { useState, useRef } from "react";
import Slider from "react-slick";
import { Heart, Eye, Star } from "lucide-react";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import coat from "../assets/coat.jpg";
import bag from "../assets/bag.jpg";
import speaker from "../assets/speaker.jpg";
import bookshelf from "../assets/bookshelf.jpg";

export default function Bestselling() {
  const [liked, setLiked] = useState<boolean[]>([]);
  const sliderRef = useRef<Slider>(null);

  const products = [
    { id: 1, name: "COAT", price: "$120", rating: 4, image: coat },
    { id: 2, name: "BAG", price: "$80", rating: 5, image: bag },
    { id: 3, name: "SPEAKER", price: "$40", rating: 3, image: speaker },
    { id: 4, name: "BOOK SHELF", price: "$90", rating: 4, image: bookshelf },
  ];

  const toggleLike = (index: number) => {
    setLiked((prev) => {
      const newLikes = [...prev];
      newLikes[index] = !newLikes[index];
      return newLikes;
    });
  };

 const settings = {
  dots: false,
  infinite: true,
  speed: 600,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024, // tablets
      settings: { slidesToShow: 2 },
    },
    {
      breakpoint: 640, // mobile
      settings: { slidesToShow: 1 },
    },
  ],
};

  return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
      {/* 🔴 Label */}
      <div className="inline-block bg-red-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md mb-3">
        This Month
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-3xl font-bold font-sans text-gray-900 tracking-wide text-center sm:text-left">
          Best Selling Product
        </h2>

        <button className="bg-[#DB4444] text-white px-4 sm:px-6 py-2 mt-3 md:mt-0 md:mr-6 rounded-md hover:bg-[#c33d3d] transition self-center sm:self-auto">
          View All
        </button>
      </div>
<Slider ref={sliderRef} {...settings}>
  {products.map((product, index) => (
    <div key={product.id} className="px-3">
      <div className="relative bg-gray-50 p-4 rounded-xl shadow-md transition duration-300 hover:scale-95">

        {/* Icons */}
        <Heart
          className={`absolute top-3 right-3 cursor-pointer transition-colors ${
            liked[index] ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
          onClick={() => toggleLike(index)}
          size={20}
        />

        <Link
          to={`/view_item/${product.id}`}
          className="absolute top-10 right-3 text-gray-500 hover:text-blue-600"
        >
          <Eye size={20} />
        </Link>

        {/* Image */}
        <div className="relative group flex justify-center items-center h-[180px] sm:h-[200px]">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-40 object-contain transition duration-300 group-hover:scale-90  filter brightness-105 contrast-95"
          />

          {/* Hover Overlay */}
          <div className="absolute top-11 inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-lg">
            <button className="bg-amber-600 text-white px-4 py-2 text-sm rounded-md">
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-gray-800 mt-4 text-center sm:text-left">
          {product.name}
        </h3>

        <p className="text-lg font-bold text-amber-700 mt-1 text-center sm:text-left">
          {product.price}
        </p>

        {/* Rating */}
        <div className="flex justify-center sm:justify-start items-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={
                star <= product.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>

      </div>
    </div>
  ))}
</Slider>
    </div>
  );
}
