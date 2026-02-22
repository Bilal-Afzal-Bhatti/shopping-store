import { useState } from "react";
import { Heart, Eye, Star } from "lucide-react";
import joystick from "../assets/joystick.png";
import key_board from "../assets/Key_board.png";
import led from "../assets/led.png";
import bluetooth from "../assets/bluetooth.png";
import SliderArrows from "../components/arrow";
import { Link } from "react-router-dom";

export default function Our_products() {
  const [liked, setLiked] = useState<boolean[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 8; // 4 cols x 2 rows

  const products = [
    { id: 1, name: "Wireless Headphones", price: "$120", rating: 4, discount: "40% OFF", image: joystick },
    { id: 2, name: "Smart Watch", price: "$80", rating: 5, discount: "40% OFF", image: key_board },
    { id: 3, name: "Gaming Mouse", price: "$40", rating: 3, discount: "40% OFF", image: led },
    { id: 4, name: "Bluetooth Speaker", price: "$90", rating: 4, discount: "40% OFF", image: bluetooth },
    { id: 5, name: "Mechanical Keyboard", price: "$150", rating: 5, discount: "40% OFF", image: key_board },
    { id: 6, name: "LED Monitor", price: "$200", rating: 4, discount: "40% OFF", image: led },
    { id: 7, name: "VR Headset", price: "$250", rating: 5, discount: "40% OFF", image: joystick },
    { id: 8, name: "Bluetooth Earbuds", price: "$70", rating: 4, discount: "40% OFF", image: bluetooth },
    { id: 9, name: "Gaming Controller", price: "$110", rating: 5, discount: "40% OFF", image: joystick },
    { id: 10, name: "Smart Lamp", price: "$60", rating: 4, discount: "40% OFF", image: led },
  ];

  const totalPages = Math.ceil(products.length / productsPerPage);

  const toggleLike = (index: number) => {
    setLiked((prev) => {
      const newLikes = [...prev];
      newLikes[index] = !newLikes[index];
      return newLikes;
    });
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const startIdx = currentPage * productsPerPage;
  const currentProducts = products.slice(startIdx, startIdx + productsPerPage);

  return (
    <div className="p-4 sm:p-6 md:p-10 bg-white mt-10 sm:mt-16 md:mt-20 ml-2 sm:ml-6 md:ml-16 relative">
      
      {/* 🔴 Label */}
      <div className="inline-block bg-red-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-md mb-3">
        Our Products
      </div>

      {/* Section Header */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-sans text-gray-900 tracking-wide mb-4 sm:mb-6">
        Explore Our Products
      </h2>

      {/* 🔁 Arrows */}
      <div className="absolute -top-12 right-4 sm:right-10 md:right[20px]">
        <SliderArrows onPrev={handlePrev} onNext={handleNext} />
      </div>

      {/* 🛍️ Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 sm:mt-16 w-full">
        {currentProducts.map((product, index) => (
          <div
            key={product.id}
            className="relative bg-gray-50 p-3 sm:p-1 md:w-66 rounded-xl shadow-md transition-transform duration-300 hover:scale-95 h-auto sm:h-80 md:h-auto"
          >
            {/* Discount Badge */}
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-md">
              {product.discount}
            </span>

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

            {/* Product Image */}
            <div className="relative group flex justify-center items-center w-full h-32 sm:h-44 md:h-48">
              <img
                src={product.image}
                alt={product.name}
                className="w-28 sm:w-36 md:w-40 h-28 sm:h-36 object-contain rounded-lg transition-transform duration-300 group-hover:scale-90"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-lg">
                <button className="bg-amber-600 text-white px-3 py-1 text-xs sm:text-sm rounded-md">
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Product Info */}
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg mt-3">
              {product.name}
            </h3>
            <p className="text-base sm:text-lg font-bold text-amber-700 mt-1">
              {product.price}
            </p>

            {/* ⭐ Rating */}
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={star <= product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🔘 Pagination Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <div
            key={idx}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full cursor-pointer transition ${
              idx === currentPage ? "bg-[#DB4444]" : "bg-gray-300"
            }`}
            onClick={() => setCurrentPage(idx)}
          ></div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-8 sm:mt-10">
        <button className="bg-[#DB4444] text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-md cursor-pointer hover:bg-[#c33d3d] transition">
          View All Products
        </button>
      </div>
    </div>
  );
}
