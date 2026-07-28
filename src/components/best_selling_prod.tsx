import { useState, useEffect, useRef, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

// Flow & API
import CartModal from "../components/modal";
import { addToCartAsync } from "../redux/slices/cartSlice";
import type { AppDispatch } from "../redux/store";

import { useProducts } from "../hooks/useProducts";
import type { Product } from "../api/productsApi";
import { toSlug } from '../utils/slug';
import axiosInstance from "../api/axiosInstance";

// Helper for beautiful discount rendering
const formatDiscount = (discount?: string) => {
  if (!discount || discount === 'No Discount') return null;
  const num = discount.match(/\d+/);
  return num ? `-${num[0]}%` : discount;
};

export default function Bestselling() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Fetch true bestselling data from backend endpoint
  const { data, isLoading, isError } = useProducts({ sort: 'bestselling', limit: 8 });
  const products: Product[] = data?.products ?? [];

  const [isLiked, setLiked] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: '', type: 'success' as 'success' | 'error' });
  const [isAdding, setIsAdding] = useState(false);
  
  // Framer Motion constraints state
  const [width, setWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carouselRef.current && !isLoading) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [products, isLoading]);

  const handleWishlistToggle = (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    const wasLiked = !!isLiked[product._id];
    setLiked((prev) => ({ ...prev, [product._id]: !wasLiked }));

    startTransition(() => {
      (async () => {
        try {
          const res = await axiosInstance.post(
            '/wishlist/add',
            {
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.image,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data.success) {
            toast.success(res.data.message || "Wishlist updated");
            navigate("/wishlist");
          }
        } catch (err: any) {
          setLiked((prev) => ({ ...prev, [product._id]: wasLiked }));
          toast.error(err.response?.data?.message || "Could not update wishlist");
        }
      })();
    });
  };

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalConfig({ message: "Please log in first to add items to your cart.", type: "error" });
      setIsModalOpen(true);
      return;
    }

    // Extract or fall back to a valid variant ID
    const activeVariantId = 
      product.defaultVariantId || 
      (product.variants && product.variants.length > 0 ? product.variants[0]._id : product._id);

    setIsAdding(true);

    try {
      await dispatch(
        addToCartAsync({ 
          product, 
          quantity: 1, 
          variantId: activeVariantId 
        })
      ).unwrap();

      setModalConfig({ message: `${product.name} added to cart!`, type: "success" });
      setIsModalOpen(true);
    } catch (err: any) {
      setModalConfig({ 
        message: typeof err === "string" ? err : "Failed to add to cart.", 
        type: "error" 
      });
      setIsModalOpen(true);
    } finally {
      setIsAdding(false);
    }
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
        <Link to="/products" className="bg-[#DB4444] text-white px-8 py-3 rounded-md hover:bg-[#c33d3d] transition-all active:scale-95 text-sm font-medium inline-block">
          View All
        </Link>
      </div>

      {/* Error State */}
      {isError && (
        <div className="w-full text-center py-10 text-red-500 font-medium bg-red-50 rounded-md">
          Failed to load bestselling products. Please try again later.
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[85%] sm:min-w-70 md:min-w-70 lg:min-w-75 flex flex-col gap-4 animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-3/4 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-1/4 rounded-md"></div>
            </div>
          ))}
        </div>
      )}

      {/* Framer Motion Carousel */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={carouselRef}>
          <motion.div 
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            className="flex gap-4 sm:gap-6"
          >
            {products.map((product: Product) => (
              <motion.div 
                key={product._id} 
                className="min-w-[85%] sm:min-w-75 md:min-w-70 lg:min-w-75 pointer-events-none"
              >
                <div className="group relative rounded-md aspect-square flex items-center justify-center p-8 overflow-hidden pointer-events-auto">
                  
                  {/* Discount / Label */}
                  {formatDiscount(product.discount) && (
                    <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-[12px] font-bold px-3 py-1 rounded-sm z-10 shadow-sm">
                      {formatDiscount(product.discount)}
                    </span>
                  )}

                  {/* Image */}
                  <img
                    src={product.image || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-multiply select-none"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
                  />

                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    <button 
                      onClick={() => handleWishlistToggle(product)}
                      disabled={isPending}
                      aria-label="Add to wishlist"
                      className="p-2 bg-white rounded-full shadow-md hover:text-[#DB4444] active:scale-90 transition disabled:opacity-40"
                    >
                      <Heart 
                        size={18} 
                        fill={isLiked[product._id] ? "#DB4444" : "none"} 
                        className={`transition-all duration-200 ${isLiked[product._id] ? "text-[#DB4444]" : "text-gray-500 hover:text-red-400"}`} 
                      />
                    </button>
                    <button 
                      onClick={() => navigate(`/product/${toSlug(product.name)}`, {
                        state: { productId: product._id }
                      })} 
                      aria-label="Quick view"
                      className="p-2 bg-white rounded-full shadow-md hover:text-[#DB4444] active:scale-90 transition"
                    >
                      <Eye size={18} className="text-gray-500 hover:text-[#DB4444]" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    disabled={isAdding || product.stock === 0}
                    className="absolute bottom-0 w-full bg-slate-600 text-white py-2 
                               opacity-100 md:opacity-0 md:group-hover:opacity-100 
                               transition-opacity duration-300 
                               disabled:bg-gray-400 disabled:cursor-not-allowed 
                               active:bg-gray-800 active:scale-95 z-10"
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.stock === 0 ? "Out of Stock" : isAdding ? "Adding..." : "Add To Cart"}
                  </button>
                </div>

                {/* Product Info */}
                <div className="mt-4 pointer-events-auto">
                  <h3 
                    onClick={() => navigate(`/product/${toSlug(product.name)}`, { state: { productId: product._id } })} 
                    className="font-bold text-black text-base truncate cursor-pointer hover:text-[#DB4444] transition-colors"
                  >
                    {product.name}
                  </h3>
                  <div className="flex gap-3 items-center mt-1">
                    <span className="text-[#DB4444] font-bold">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {/* Read-only Star Rating */}
                  {product.ratings && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        const avgStr = product.ratings?.average || 0;
                        return (
                          <Star 
                            key={i}
                            size={15} 
                            className={`transition-colors duration-200 ${
                              starValue <= Math.round(avgStr) 
                                ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" 
                                : "text-gray-300"
                            }`} 
                          />
                        );
                      })}
                      <span className="text-gray-500 text-xs font-semibold ml-1.5 opacity-80">({product.ratings?.count || 0})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="col-span-full text-center py-10 mt-10 text-gray-500 font-medium">
          No bestselling products found at the moment.
        </div>
      )}

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