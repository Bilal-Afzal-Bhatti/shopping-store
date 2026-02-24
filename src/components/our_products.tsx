import { useState } from "react";
import { Heart, Eye, Star } from "lucide-react";
import joystick from "../assets/joystick.png";
import key_board from "../assets/Key_board.png";
import led from "../assets/led.png";
import bluetooth from "../assets/bluetooth.png";
import SliderArrows from "../components/arrow";
import { Link } from "react-router-dom";

export default function Our_products() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 8; 

  const products = [
    { id: 1, name: "Wireless Headphones", price: "$120", rating: 4, discount: "40% OFF", image: joystick },
    { id: 2, name: "Smart Watch", price: "$80", rating: 5, discount: "40% OFF", image: key_board },
    { id: 3, name: "Gaming Mouse", price: "$40", rating: 3, discount: "40% OFF", image: led },
    { id: 4, name: "Bluetooth Speaker", price: "$90", rating: 4, discount: "40% OFF", image: bluetooth },
    { id: 5, name: "Mechanical Keyboard", price: "$150", rating: 5, discount: "40% OFF", image: key_board },
    { id: 6, name: "LED Monitor", price: "$200", rating: 4, discount: "40% OFF", image: led },
    { id: 7, name: "VR Headset", price: "$250", rating: 5, discount: "40% OFF", image: joystick },
    { id: 8, name: "Bluetooth Earbuds", price: "$70", rating: 4, discount: "40% OFF", image: bluetooth },
    // Adding more random data for Page 2
    { id: 9, name: "RGB Gaming Chair", price: "$300", rating: 5, discount: "10% OFF", image: joystick },
    { id: 10, name: "4K Web Camera", price: "$110", rating: 4, discount: "15% OFF", image: led },
    { id: 11, name: "Noise Cancelling Mic", price: "$85", rating: 4, discount: "20% OFF", image: bluetooth },
    { id: 12, name: "Gaming Mousepad", price: "$25", rating: 3, discount: "5% OFF", image: key_board },
    { id: 13, name: "USB-C Hub", price: "$45", rating: 5, discount: "30% OFF", image: led },
    { id: 14, name: "External SSD 1TB", price: "$130", rating: 5, discount: "25% OFF", image: joystick },
    { id: 15, name: "Cooling Fan RGB", price: "$35", rating: 4, discount: "40% OFF", image: led },
    { id: 16, name: "Wired Gaming Headset", price: "$65", rating: 4, discount: "40% OFF", image: bluetooth },
  ];

  const totalPages = Math.ceil(products.length / productsPerPage);

  const toggleLike = (id: number) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Logic for Arrows to switch pages
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const startIdx = currentPage * productsPerPage;
  const currentProducts = products.slice(startIdx, startIdx + productsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-10 sm:mt-20 font-sans">
      
      {/* 🔴 Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm md:text-base uppercase tracking-wider">Our Products</span>
      </div>

      {/* ⚡ Header Row: Inline and Arrows on the Right */}
      <div className="flex flex-row items-center justify-between w-full mb-8">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-black tracking-tight">
          Explore Our Products
        </h2>
        
        <div className="shrink-0">
          <SliderArrows onPrev={handlePrev} onNext={handleNext} />
        </div>
      </div>

      {/* 🛍️ Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[800px]">
        {currentProducts.map((product) => (
          <div key={product.id} className="group">
            <div className="relative bg-[#F5F5F5] aspect-square rounded-md flex items-center justify-center p-6 overflow-hidden">
              <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-[10px] px-3 py-1 rounded-sm z-10">
                {product.discount}
              </span>

              <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                <button onClick={() => toggleLike(product.id)} className="p-1.5 bg-white rounded-full shadow-sm">
                  <Heart size={18} className={liked[product.id] ? "fill-[#DB4444] text-[#DB4444]" : "text-gray-400"} />
                </button>
                <Link to={`/view_item/${product.id}`} className="p-1.5 bg-white rounded-full shadow-sm">
                  <Eye size={18} className="text-gray-400" />
                </Link>
              </div>

              <img src={product.image} alt={product.name} className="w-40 h-40 object-contain mix-blend-multiply" />

              <button className="absolute bottom-0 w-full bg-black text-white py-2.5 text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                Add to Cart
              </button>
            </div>

            <div className="mt-4 text-left">
              <h3 className="font-bold text-gray-900 text-base truncate">{product.name}</h3>
              <div className="flex gap-3 items-center">
                <p className="text-[#DB4444] font-bold text-lg">{product.price}</p>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className={star <= product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  ))}
                  <span className="text-gray-400 text-xs ml-2">(65)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-10 space-x-3">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`w-3 h-3 rounded-full transition-all ${idx === currentPage ? "bg-[#DB4444] scale-125" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}