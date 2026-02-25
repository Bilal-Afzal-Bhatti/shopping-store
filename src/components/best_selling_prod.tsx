import { useState, useRef } from "react";
import Slider from "react-slick";
import { Heart, Eye, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import coat from "../assets/coat.jpg";
import bag from "../assets/bag.jpg";
import speaker from "../assets/speaker.jpg";
import bookshelf from "../assets/bookshelf.jpg";

import CartModal from "../components/modal";

export default function Bestselling() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: '', type: 'success' as 'success' | 'error' });
  const [isAdding, setIsAdding] = useState(false);
  
  const sliderRef = useRef<Slider>(null);
  const navigate = useNavigate();

  const products = [
    { id: 101, name: "The North Coat", price: "$260", oldPrice: "$360", rating: 5, reviews: 65, image: coat },
    { id: 102, name: "Gucci Savoy Bag", price: "$960", oldPrice: "$1160", rating: 4, reviews: 85, image: bag },
    { id: 103, name: "RGB Liquid CPU Cooler", price: "$160", oldPrice: "$170", rating: 4, reviews: 95, image: speaker },
    { id: 104, name: "Small BookSelf", price: "$360", oldPrice: null, rating: 5, reviews: 99, image: bookshelf },
     { id: 105, name: "Small BookSelf", price: "$360", oldPrice: null, rating: 5, reviews: 99, image: bookshelf },
  ];

  const toggleLike = (id: number) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = async (product: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalConfig({ message: "Please log in first.", type: 'error' });
      setIsModalOpen(true);
      return;
    }

    setIsAdding(true);
    try {
      const productData = {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price.replace("$", "")),
        image: product.image,
      };

      const res = await fetch("https://shoppingstore-backend.vercel.app/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (res.ok) {
        setModalConfig({ message: `${product.name} added to cart!`, type: 'success' });
        setIsModalOpen(true);
      } else {
        setModalConfig({ message: data.message || "Error adding item", type: 'error' });
        setIsModalOpen(true);
      }
    } catch (err) {
      setModalConfig({ message: "Network error.", type: 'error' });
      setIsModalOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 mb-10">
      {/* 🔴 Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm uppercase tracking-wider">This Month</span>
      </div>

      {/* Section Header */}
      <div className="flex flex-row items-center justify-between mb-8">
        <h2 className="text-xl sm:text-4xl font-bold text-black tracking-tight">
          Best Selling Products
        </h2>
        <button className="bg-[#DB4444] text-white px-8 py-3 rounded-md hover:bg-[#c33d3d] transition-all active:scale-95 text-sm font-medium">
          View All
        </button>
      </div>

      <Slider ref={sliderRef} {...settings}>
        {products.map((product) => (
          <div key={product.id} className="px-3">
            <div className="group relative bg-[#F5F5F5] rounded-md aspect-square flex items-center justify-center p-8 overflow-hidden">
              
              {/* Image */}
              <img
                src={product.image}
                alt={product.name}
           className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 brightness-109 contrast-95"
              />

              {/* Action Icons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toggleLike(product.id)}
                  className="p-2 bg-white rounded-full shadow-md hover:text-[#DB4444] transition"
                >
                  <Heart size={18} fill={liked[product.id] ? "#DB4444" : "none"} className={liked[product.id] ? "text-[#DB4444]" : "text-black"} />
                </button>
                <Link to={`/view_item/${product.id}`} className="p-2 bg-white rounded-full shadow-md hover:text-[#DB4444] transition">
                  <Eye size={18} />
                </Link>
              </div>

                  <button 
  disabled={isAdding}
  className="absolute bottom-0 w-full bg-black text-white py-2 
             /* Mobile: Always visible */
             opacity-200 
             /* Laptop/Desktop: Hidden by default, show on hover */
           
             md:opacity-0 md:group-hover:opacity-100 
             /* Effects */
             transition-opacity duration-300 
             disabled:bg-gray-600 disabled:cursor-not-allowed 
             active:bg-gray-800 active:scale-95"
  onClick={() => handleAddToCart(product)}
>
  {isAdding ? "Adding..." : "Add To Cart"}
</button>
            </div>

            {/* Product Info */}
            <div className="mt-4">
              <h3 className="font-bold text-black text-base truncate">{product.name}</h3>
              <div className="flex gap-3 items-center mt-1">
                <span className="text-[#DB4444] font-bold">{product.price}</span>
                {product.oldPrice && (
                  <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
                <span className="text-gray-400 text-xs font-bold ml-1">({product.reviews})</span>
              </div>
            </div>
          </div>
        ))}
      </Slider>

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