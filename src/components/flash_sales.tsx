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

export default function Flash_sales() {
  const [liked, setLiked] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const sliderRef = useRef<Slider>(null);
  const navigate = useNavigate();

  const saleEndDate = new Date();
  saleEndDate.setDate(saleEndDate.getDate() + 3); // 3 days from now

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = saleEndDate.getTime() - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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
  ];

  const toggleLike = (index: number) => {
    setLiked((prev) => {
      const newLikes = [...prev];
      newLikes[index] = !newLikes[index];
      return newLikes;
    });
  };

  const handleAddToCart = async (product: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign up or log in first before adding items to cart.");
      return;
    }

    try {
      const productData = {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price.replace("$", "")),
        image: product.image,
        discount: product.discount,
      };

      const response = await fetch("https://shoppingstore-backend.vercel.app/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Added to cart successfully!");
        navigate("/cart");
      } else {
        alert(`❌ Failed to add: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Slider settings with responsive breakpoints
  const sliderSettings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    infinite: false,
    responsive: [
      {
        breakpoint: 1280, // Laptop
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1024, // Tablet
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640, // Mobile
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "20px",
        },
      },
    ],
  };

  return (
    <div className="p-6 sm:p-10 bg-white mt-10">
      <div className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-md mb-3">TODAY</div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Flash Sales</h2>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex space-x-2 sm:space-x-4 text-sm sm:text-base">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={i} className="text-center">
                <div className="text-base sm:text-2xl font-bold">{String(unit.value).padStart(2, "0")}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">{unit.label}</div>
              </div>
            ))}
          </div>

          <div className="ml-4">
            <SliderArrows onPrev={() => sliderRef.current?.slickPrev()} onNext={() => sliderRef.current?.slickNext()} />
          </div>
        </div>
      </div>

      <Slider ref={sliderRef} {...sliderSettings}>
        {products.map((product, index) => (
          <div key={product.id} className="px-2 sm:px-3 flex justify-center w-full">
            <div className="relative bg-gray-50 p-4 rounded-xl shadow-md w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] xl:w-[300px] transition-transform duration-300 hover:scale-95">
              {product.discount && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-2 rounded-md">
                  {product.discount}
                </span>
              )}

              <div className="relative">
                <Heart
                  className={`absolute top-2 right-0 cursor-pointer transition-colors ${
                    liked[index] ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                  onClick={() => toggleLike(index)}
                  size={20}
                />
                <Link to={"/view_item"} className="absolute top-10 right-0 text-gray-500 hover:text-blue-600 z-10">
                  <Eye size={20} />
                </Link>
              </div>

              <div className="relative group flex justify-center items-center mt-3 w-full h-[150px] sm:h-[180px] md:h-[200px] lg:h-[220px] xl:h-60">
                <img src={product.image} alt={product.name} className="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] xl:w-[220px] h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-95" />
                <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition bg-black/50 rounded-lg">
                  <button onClick={() => handleAddToCart(product)} className="bg-amber-600 text-white px-2 py-1 text-xs sm:text-sm rounded-md hover:bg-amber-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 text-lg mt-3 text-center md:text-left">{product.name}</h3>
              <p className="text-lg font-bold text-amber-700 mt-1 text-center md:text-left">{product.price}</p>

              <div className="flex justify-center md:justify-start mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className={star <= product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <div className="flex justify-center mt-20">
        <h3 className="bg-[#DB4444] text-white px-6 py-2 rounded-md cursor-pointer hover:bg-[#c33d3d] transition">View All Products</h3>
      </div>

      <Line color="bg-gray-300" width="w-[300px] sm:w-[640px] md:w-[900px] lg:w-[1210px]" height="h-[1px]" margin="mt-10 ml-0 sm:mt-16 sm:ml-5" />
    </div>
  );
}