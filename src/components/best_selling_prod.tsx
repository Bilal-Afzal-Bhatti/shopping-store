import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Eye, Star } from "lucide-react";
import { useDispatch } from "react-redux";

// Flow & API
import CartModal from "../components/modal";
import { addToCart } from "../redux/slices/cartSlice";
import axiosInstance from "../api/axiosInstance";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../api/productsApi";
import { productsApi } from "../api/productsApi";

// Helper for beautiful discount rendering
const formatDiscount = (discount?: string) => {
  if (!discount || discount === 'No Discount') return null;
  const num = discount.match(/\d+/);
  return num ? `-${num[0]}%` : discount;
};

export default function Bestselling() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch true bestselling data from our new backend endpoint!
  const { data: products = [], isLoading, isError } = useProducts({ category: 'bestselling' });

  const [liked, setLiked] = useState<Record<string, boolean>>({});
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

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalConfig({ message: "Please log in first.", type: 'error' });
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
        // FIXED: Matched exact properties to your TS Product interface
        dispatch(addToCart({
          _id: product._id.toString(),
          name: product.name,
          price: productData.price,
          image: product.image,
          stock: product.stock || 10,
          category: product.category || 'Other',
          isActive: true
        }));

        setModalConfig({ message: `${product.name} added to cart!`, type: 'success' });
        setIsModalOpen(true);
      } else {
        setModalConfig({ message: res.data?.message || "Error adding item", type: 'error' });
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setModalConfig({ message: err.response?.data?.message || "Network error.", type: 'error' });
      setIsModalOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRateProduct = async (product: Product, ratingValue: number) => {
    try {
      const result = await productsApi.rateProduct(product._id, ratingValue);
      if (result.success) {
        // You'll likely see a native toast library in future, but assuming they have a modal
        setModalConfig({ message: result.message || 'Rating submitted!', type: 'success' });
        setIsModalOpen(true);
      }
    } catch (err: any) {
      setModalConfig({ message: err.response?.data?.message || 'Failed to submit rating', type: 'error' });
      setIsModalOpen(true);
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
        <button className="bg-[#DB4444] text-white px-8 py-3 rounded-md hover:bg-[#c33d3d] transition-all active:scale-95 text-sm font-medium">
          View All
        </button>
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
            <div key={i} className="min-w-[85%] sm:min-w-[300px] md:min-w-[280px] lg:min-w-[300px] flex flex-col gap-4 animate-pulse">
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
                className="min-w-[85%] sm:min-w-[300px] md:min-w-[280px] lg:min-w-[300px] pointer-events-none"
              >
                <div className="group relative bg-[#F5F5F5] rounded-md aspect-square flex items-center justify-center p-8 overflow-hidden pointer-events-auto">
                  
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
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-multiply"
                  />

                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleLike(product._id)}
                      className="p-2 bg-white rounded-full shadow-md hover:text-[#DB4444] transition active:scale-90"
                    >
                      <Heart 
                        size={18} 
                        fill={liked[product._id] ? "#DB4444" : "none"} 
                        className={liked[product._id] ? "text-[#DB4444]" : "text-black"} 
                      />
                    </button>
                    <Link 
                      to={`/view_item/${product._id}`} 
                      className="p-2 bg-white rounded-full shadow-md hover:text-[#DB4444] transition"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>

                  {/* Add to Cart Button */}
                  <button 
                    disabled={isAdding}
                    className="absolute bottom-0 w-full bg-slate-600 text-white py-2 
                               opacity-100 md:opacity-0 md:group-hover:opacity-100 
                               transition-opacity duration-300 
                               disabled:bg-gray-600 disabled:cursor-not-allowed 
                               active:bg-gray-800 active:scale-95 z-10"
                    onClick={() => handleAddToCart(product)}
                  >
                    {isAdding ? "Adding..." : "Add To Cart"}
                  </button>
                </div>

                {/* Product Info */}
                <div className="mt-4 pointer-events-auto">
                  <h3 className="font-bold text-black text-base truncate">{product.name}</h3>
                  <div className="flex gap-3 items-center mt-1">
                    <span className="text-[#DB4444] font-bold">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                    )}
                  </div>
                  {product.ratings && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => {
                        const starValue = i + 1;
                        const avgStr = product.ratings?.average || 0;
                        return (
                           <button 
                             key={i} 
                             onClick={() => handleRateProduct(product, starValue)}
                             className="focus:outline-hidden hover:scale-110 active:scale-95 transition-transform"
                           >
                             <Star 
                               size={15} 
                               className={`transition-colors duration-200 ${
                                 starValue <= Math.round(avgStr) 
                                   ? "text-yellow-400 fill-yellow-400 drop-shadow-sm" 
                                   : "text-gray-300 hover:text-yellow-200"
                               }`} 
                             />
                           </button>
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