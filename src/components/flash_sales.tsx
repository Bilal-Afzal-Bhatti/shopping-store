import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { Heart, Eye, Star } from "lucide-react";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import joystick from "../assets/joystick.png";
import key_board from "../assets/Key_board.png";
import led from "../assets/led.png";
import bluetooth from "../assets/bluetooth.png";

import SliderArrows from "../components/arrow";
import Line from "./line";
import CartModal from "../components/modal";

// Define outside to prevent the timer from resetting on every render
const SALE_END_DATE = new Date();
SALE_END_DATE.setDate(SALE_END_DATE.getDate() + 3);

export default function Flash_sales() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: '', type: 'success' as 'success' | 'error' });
  const [isAdding, setIsAdding] = useState(false);
  
  const sliderRef = useRef<Slider>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = SALE_END_DATE.getTime() - now;
      if (distance <= 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const products = [
    { id: 1, name: "Wireless Headphones", price: "$120", rating: 4, discount: "20% OFF", image: joystick },
    { id: 2, name: "Smart Watch", price: "$80", rating: 5, discount: "40% OFF", image: key_board },
    { id: 3, name: "Gaming Mouse", price: "$40", rating: 3, discount: "40% OFF", image: led },
    { id: 4, name: "Bluetooth Speaker", price: "$90", rating: 4, discount: "40% OFF", image: bluetooth },
    { id: 5, name: "Bluetooth Speaker", price: "$90", rating: 4, discount: "40% OFF", image: bluetooth },
    { id: 6, name: "Bluetooth Speaker", price: "$90", rating: 4, discount: "20% OFF", image: bluetooth },
  ];

  const toggleLike = (id: number) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = async (product: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalConfig({ message: "Please log in first to add items to your cart.", type: 'error' });
      setIsModalOpen(true);
      return;
    }

    setIsAdding(true); // Start loading state
    try {
      const productData = {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price.replace("$", "")),
        image: product.image,
        discount: product.discount,
      };

      const res = await fetch("https://shoppingstore-backend.vercel.app/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        setModalConfig({ message: `${product.name} has been added to your cart!`, type: 'success' });
        setIsModalOpen(true);
      } else {
        setModalConfig({ message: data.message || "Failed to add item.", type: 'error' });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Cart Error:", err);
      setModalConfig({ message: "Network error. Please try again later.", type: 'error' });
      setIsModalOpen(true);
    } finally {
      setIsAdding(false); // End loading state
    }
  };

  const sliderSettings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false, // Set to false because we use custom SliderArrows
    infinite: false,
    dots: false,
    speed: 500,
    adaptiveHeight: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, centerMode: true, centerPadding: "40px" } },
    ],
  };

  return (  
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 md:mt-60 lg:mt-20 [@media(orientation:landscape)and(max-width:768px)]:mt-66">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm md:text-base uppercase tracking-wider">Today's</span>
      </div>

      <div className="flex flex-row items-center justify-between mb-8 flex-wrap gap-y-4">
        <div className="flex flex-row items-center gap-6 md:gap-20 flex-wrap">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-black tracking-tight">Flash Sales</h2>
          
          <div className="flex items-center gap-3 sm:gap-6">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hrs", value: timeLeft.hours },
              { label: "Mins", value: timeLeft.minutes },
              { label: "Secs", value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-black uppercase">{unit.label}</span>
                  <span className="text-lg sm:text-3xl font-extrabold text-black tabular-nums">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                {i < 3 && <span className="text-[#E07575] text-xl sm:text-2xl font-bold mx-2 sm:mx-4 self-end">:</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 ml-auto">
          <SliderArrows
            onPrev={() => sliderRef.current?.slickPrev()}
            onNext={() => sliderRef.current?.slickNext()}
          />
        </div>
      </div>

      {/* Products Slider */}
      <Slider ref={sliderRef} {...sliderSettings} className="overflow-visible">
        {products.map((product) => (
          <div key={product.id} className="px-2 sm:px-4 focus:outline-none">
            <div className="group relative bg-[#F5F5F5] rounded-md aspect-square flex items-center justify-center p-6 overflow-hidden">
              <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-[10px] px-3 py-1 rounded z-10">
                {product.discount}
              </span>

              <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                <button 
                  onClick={() => toggleLike(product.id)}
                  className="p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition active:scale-95"
                >
                  <Heart 
                    size={18} 
                    className={`${liked[product.id] ? "fill-[#DB4444] text-[#DB4444]" : "text-gray-600"}`} 
                  />
                </button>
                <Link 
                  to={"/view_item"}
                  className="p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition"
                >
                  <Eye size={18} className="text-gray-600" />
                </Link>
              </div>

              <img
                src={product.image}
                alt={product.name}
                className="w-3/4 h-3/4 object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-multiply"
              />
              
              <button 
                disabled={isAdding}
                className="absolute bottom-0 w-full bg-black text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                onClick={() => handleAddToCart(product)}
              >
                {isAdding ? "Adding..." : "Add To Cart"}
              </button>
            </div>

            <div className="mt-4 text-left">
              <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{product.name}</h3>
              <div className="flex gap-3 items-center mt-1">
                <span className="text-[#DB4444] font-bold">{product.price}</span>
                <span className="text-gray-400 line-through text-xs sm:text-sm">$160</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
                <span className="text-gray-400 text-xs font-bold ml-1">(88)</span>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <div className="  flex  justify-center mt-12">
        <button className="bg-[#DB4444] text-white px-10 py-3 rounded-md font-medium hover:bg-[#c33d3d] transition-colors active:scale-95">
          View All Products
        </button>
      </div>

      <Line color="bg-gray-200" width="w-full" height="h-[1px]" margin="mt-16" />

      {/* Render Modal Component */}
      <CartModal 
        isOpen={isModalOpen}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setIsModalOpen(false);
          if (modalConfig.type === 'success') navigate('/cart');
        }}
      />
    </div>
  );
}