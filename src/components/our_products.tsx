import { useState, useMemo } from "react";
import { Heart, Eye, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

// Components & API
import SliderArrows from "../components/arrow";
import CartModal from "../components/modal";

import { addToCartAsync } from "../redux/slices/cartSlice";
import type { AppDispatch } from "../redux/store";

import { useProducts } from "../hooks/useProducts";
import type { Product } from "../api/productsApi";
import { productsApi } from "../api/productsApi";

// Helper for beautiful discount rendering
const formatDiscount = (discount?: string) => {
  if (!discount || discount === 'No Discount') return null;
  const num = discount.match(/\d+/);
  return num ? `-${num[0]}%` : discount;
};

export default function Our_products() {

  const navigate = useNavigate();

  // Fetch dynamic data
 // wherever our_products.tsx calls useProducts
  const dispatch = useDispatch<AppDispatch>();
  // Fetch true bestselling data from our new backend endpoint!
const { data, isLoading, isError } = useProducts({ category: 'bestselling' });
const products: Product[] = data?.products ?? [];

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 8; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ message: '', type: 'success' as 'success' | 'error' });
  const [isAdding, setIsAdding] = useState(false);

  const totalPages = Math.ceil(products.length / productsPerPage) || 1;

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

 const handleAddToCart = async (product: Product) => {
  const token = localStorage.getItem("token");
  if (!token) {
    setModalConfig({ message: "Please log in first.", type: "error" });
    setIsModalOpen(true);
    return;
  }

  setIsAdding(true);
  try {
    await dispatch(addToCartAsync(product)).unwrap();
    setModalConfig({ message: `${product.name} added to cart!`, type: "success" });
    setIsModalOpen(true);
  } catch (err: any) {
    setModalConfig({ message: err || "Failed to add to cart.", type: "error" });
    setIsModalOpen(true);
  } finally {
    setIsAdding(false);
  }
};

  const handleRateProduct = async (product: Product, ratingValue: number) => {
    try {
      const result = await productsApi.rateProduct(product._id, ratingValue);
      if (result.success) {
        toast.success(result.message || 'Rating submitted!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

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

  const currentProducts = useMemo(() => {
    const startIdx = currentPage * productsPerPage;
    return products.slice(startIdx, startIdx + productsPerPage);
  }, [products, currentPage, productsPerPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-10 sm:mt-20 font-sans">
      
      {/* 🔴 Label */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-5 h-10 bg-[#DB4444] rounded-sm"></div>
        <span className="text-[#DB4444] font-bold text-sm md:text-base uppercase tracking-wider">Our Products</span>
      </div>

      {/* Header Row: Inline and Arrows on the Right */}
      <div className="flex flex-row items-center justify-between w-full mb-8">
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-black tracking-tight">
          Explore Our Products
        </h2>
        
        <div className="shrink-0">
          <SliderArrows onPrev={handlePrev} onNext={handleNext} />
        </div>
      </div>

      {isError && (
        <div className="w-full text-center py-10 text-red-500 font-medium bg-red-50 rounded-md">
          Failed to load products. Please try again later.
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-3/4 rounded-md mt-4"></div>
              <div className="h-4 bg-gray-200 w-1/4 rounded-md"></div>
            </div>
          ))}
        </div>
      )}

      {/* 🛍️ Grid */}
      {!isLoading && !isError && currentProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
          {currentProducts.map((product: Product) => (
            <div key={product._id} className="group">
              <div className="relative bg-[#F5F5F5] aspect-square rounded-md flex items-center justify-center p-6 overflow-hidden">
                {formatDiscount(product.discount) && (
                   <span className="absolute top-3 left-3 bg-[#DB4444] text-white text-[12px] font-bold px-3 py-1 rounded-sm z-10 shadow-sm">
                     {formatDiscount(product.discount)}
                   </span>
                )}

                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                  <button onClick={() => toggleLike(product._id)} className="p-1.5 bg-white rounded-full shadow-sm hover:text-[#DB4444] active:scale-90 transition">
                    <Heart size={18} className={liked[product._id] ? "fill-[#DB4444] text-[#DB4444]" : "text-gray-400"} />
                  </button>
                  <Link to={`/view_item/${product._id}`} className="p-1.5 bg-white rounded-full shadow-sm hover:text-[#DB4444] transition">
                    <Eye size={18} className="text-gray-400" />
                  </Link>
                </div>

                <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-3/4 h-3/4 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110" />

                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding}
                  className="absolute bottom-0 w-full z-10 bg-slate-600 text-white py-2.5 text-sm font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all disabled:bg-gray-600"
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
              </div>

              <div className="mt-4 text-left">
                <h3 className="font-bold text-gray-900 text-base truncate">{product.name}</h3>
                <div className="flex gap-3 items-center">
                  <p className="text-[#DB4444] font-bold text-lg">${product.price}</p>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                  )}
                  {product.ratings && (
                    <div className="flex items-center ml-2 border-l pl-2 border-gray-300">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
         <div className="w-full text-center py-10 mt-10 text-gray-500 font-medium">
            No products found right now.
         </div>
      )}

      {/* Pagination Dots */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex justify-center mt-10 space-x-3">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentPage ? "bg-[#DB4444] scale-125" : "bg-gray-300"}`}
            />
          ))}
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