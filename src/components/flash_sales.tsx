import { useState, useEffect, useRef, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import axios from "axios"; 
import { useDispatch } from "react-redux";

// Components & API
import SliderArrows from "../components/arrow";
import Line from "./line";
import CartModal from "../components/modal";
import { toast } from "react-hot-toast";
import { addToCart } from "../redux/slices/cartSlice";
import axiosInstance from "../api/axiosInstance";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../api/productsApi";

const SALE_END_DATE = new Date();
SALE_END_DATE.setDate(SALE_END_DATE.getDate() + 3);

export default function Flash_sales() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch dynamic data
  const { data: products = [], isLoading, isError } = useProducts({ category: 'flash_sales' });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: '', type: 'success' as 'success' | 'error' });
  const [isAdding, setIsAdding] = useState(false);
  const [isLiked, setLiked] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carousel.current && !isLoading) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, [products, isLoading]);

  // Timer Logic
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

  const handleWishlistToggle = async (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    startTransition(async () => {
      const wasLiked = !!isLiked[product._id];
      try {
        setLiked(prev => ({ ...prev, [product._id]: !wasLiked }));
        const response = await axios.post(
          "https://shoppingstore-backend.vercel.app/api/wishlist/add", 
          { 
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success(response.data.message || "Wishlist updated");
          navigate("/wishlist"); 
        }
      } catch (error: any) {
        setLiked(prev => ({ ...prev, [product._id]: wasLiked }));
        const errorMsg = error.response?.data?.message || "Server Error: Could not update wishlist";
        toast.error(errorMsg);
      }
    });
  };

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalConfig({ message: "Please log in first to add items to your cart.", type: 'error' });
      setIsModalOpen(true);
      return;
    }
    setIsAdding(true);
    try {
      const productData = {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      };
      
      const res = await axiosInstance.post("/cart/add", productData);
      
      if (res.status === 200 || res.status === 201) {
        dispatch(addToCart({
          _id: product._id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock || 10,
          category: product.category || 'Other',
          isActive: true
        }));
        setModalConfig({ message: `${product.name} has been added to your cart!`, type: 'success' });
        setIsModalOpen(true);
      } else {
        setModalConfig({ message: res.data?.message || "Failed to add item.", type: 'error' });
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setModalConfig({ message: err.response?.data?.message || "Network error. Please try again later.", type: 'error' });
      setIsModalOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleNext = () => {
    if (carousel.current) {
      carousel.current.scrollBy({ left: carousel.current.offsetWidth / 2, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (carousel.current) {
      carousel.current.scrollBy({ left: -carousel.current.offsetWidth / 2, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 md:mt-60 lg:mt-20">
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
          <SliderArrows onPrev={handlePrev} onNext={handleNext} />
        </div>
      </div>

      {isError && (
        <div className="w-full text-center py-10 text-red-500 font-medium bg-red-50 rounded-md">
          Failed to load flash sales. Please try again later.
        </div>
      )}

      {isLoading && (
        <div className="flex gap-4 sm:gap-8 overflow-hidden px-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[85%] sm:min-w-[300px] md:min-w-[300px] flex flex-col gap-4 animate-pulse">
               <div className="w-full aspect-square bg-gray-200 rounded-md"></div>
               <div className="h-4 bg-gray-200 w-3/4 rounded-md"></div>
               <div className="h-4 bg-gray-200 w-1/4 rounded-md"></div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-hidden cursor-grab active:cursor-grabbing px-0" ref={carousel}>
          <motion.div 
            drag="x" 
            dragConstraints={{ right: 0, left: -width }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-4 sm:gap-8"
          >
            {products.map((product: Product) => (
              <motion.div 
                key={product._id} 
                className="min-w-[85%] sm:min-w-[300px] md:min-w-[300px] pointer-events-none"
              >
                <div className="group relative bg-[#F5F5F5] rounded-md aspect-square flex items-center justify-center p-6 overflow-hidden pointer-events-auto">
                  {product.discount && product.discount !== 'No Discount' && (
                    <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-[10px] px-3 py-1 rounded z-10">
                      {product.discount}
                    </span>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      disabled={isPending}
                      className={`p-1.5 bg-white rounded-full shadow-sm transition active:scale-95 
                        ${isPending ? "opacity-50 cursor-wait" : "opacity-100"}`}
                    >
                      <Heart
                        size={18}
                        className={`transition-all duration-300 ${
                          isLiked[product._id]
                            ? "fill-[#DB4444] text-[#DB4444] scale-110" 
                            : "text-gray-600 hover:text-red-400"
                        }`}
                      />
                    </button>
                    <Link to={`/view_item/${product._id}`} className="p-1.5 bg-white rounded-full shadow-sm transition">
                      <Eye size={18} className="text-gray-600" />
                    </Link>
                  </div>

                  <img
                    src={product.image || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-3/4 h-3/4 object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-multiply"
                  />

                  <button 
                    disabled={isAdding}
                    className="absolute bottom-0 w-full bg-slate-600 text-white py-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 disabled:bg-gray-600 z-10"
                    onClick={() => handleAddToCart(product)}
                  >
                    {isAdding ? "Adding..." : "Add To Cart"}
                  </button>
                </div>

                <div className="mt-4 text-left pointer-events-auto">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{product.name}</h3>
                  <div className="flex gap-3 items-center mt-1">
                    <span className="text-[#DB4444] font-bold">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-xs sm:text-sm">${product.originalPrice}</span>
                    )}
                  </div>
                  {product.ratings && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.round(product.ratings?.average || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                      ))}
                      <span className="text-gray-400 text-xs font-bold ml-1">({product.ratings?.count || 0})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
         <div className="col-span-full text-center py-10 mt-10 text-gray-500 font-medium">
            No active flash sales right now. Check back later!
         </div>
      )}

      <div className="flex justify-center mt-12">
        <button className="bg-[#DB4444] text-white px-10 py-3 rounded-md font-medium transition-all duration-200 hover:bg-[#c33d3d] active:scale-95">
          View All Products
        </button>
      </div>
      
      <Line color="bg-gray-200" width="w-full" height="h-[1px]" margin="mt-16" />

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