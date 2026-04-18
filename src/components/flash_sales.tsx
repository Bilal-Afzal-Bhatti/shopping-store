// src/components/flash_sales.tsx
import { useState, useEffect, useRef, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { Heart, Eye, ShoppingCart, Zap } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

import SliderArrows      from "../components/arrow";
import Line              from "./line";
import CartModal         from "../components/modal";
import { addToCartAsync } from "../redux/slices/cartSlice";
import { useProducts }   from "../hooks/useProducts";
import type { Product }  from "../api/productsApi";
import { productsApi }   from "../api/productsApi";
import type { AppDispatch } from "../redux/store";

const SALE_END_DATE = new Date();
SALE_END_DATE.setDate(SALE_END_DATE.getDate() + 3);

const formatDiscount = (discount?: string) => {
  if (!discount || discount === 'No Discount') return null;
  const num = discount.match(/\d+/);
  // ✅ "10" → "-10%", "10%" → "-10%", "10% OFF" → "-10%"
  return num ? `-${num[0]}%` : discount;
};

const pad = (n: number) => String(n).padStart(2, "0");

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ average = 0, count = 0, onRate }: {
  average?: number; count?: number; onRate?: (v: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? Math.round(average);
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => onRate?.(star)}
            onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(null)}
            className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" className="transition-all duration-150"
              fill={star <= display ? "#FBBF24" : "none"}
              stroke={star <= display ? "#FBBF24" : "#D1D5DB"} strokeWidth="1.5"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-[11px] text-gray-400 font-medium leading-none">({count})</span>
    </div>
  );
}

// ─── CountdownUnit ────────────────────────────────────────────────────────────
function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center min-w-11">
      <span className="text-[9px] font-bold text-black uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-2xl sm:text-3xl font-extrabold text-black tabular-nums leading-none">
        {pad(value)}
      </span>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, isLiked, isAdding, isPending, onWishlist, onAddToCart, onRate, onView }: {
  product: Product; isLiked: boolean; isAdding: boolean; isPending: boolean;
  onWishlist: () => void; onAddToCart: () => void; onRate: (v: number) => void; onView: () => void;
}) {
  const badge = formatDiscount(product.discount);
  return (
    <div className="flex flex-col w-full">
      <div className="group relative bg-[#F5F5F5] rounded-xl aspect-square flex items-center justify-center p-6 overflow-hidden">
        {badge && (
          <span className="absolute top-3 left-3 z-10 bg-[#DB4444] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow">
            {badge}
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button onClick={onWishlist} disabled={isPending} aria-label="Add to wishlist"
            className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 active:scale-90 transition disabled:opacity-40"
          >
            <Heart size={15} className={`transition-all duration-200 ${isLiked ? "fill-[#DB4444] text-[#DB4444]" : "text-gray-500 hover:text-red-400"}`} />
          </button>
          <button onClick={onView} aria-label="Quick view"
            className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 active:scale-90 transition"
          >
            <Eye size={15} className="text-gray-500" />
          </button>
        </div>
        <img
          src={product.image || "https://placehold.co/300x300?text=No+Image"}
          alt={product.name} loading="lazy"
          className="w-3/4 h-3/4 object-contain transition-transform duration-300 group-hover:scale-110 mix-blend-multiply select-none pointer-events-none"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x300?text=No+Image"; }}
        />
        <button onClick={onAddToCart} disabled={isAdding || product.stock === 0}
          className="absolute bottom-0 left-0 w-full bg-gray-900 text-white text-sm font-medium py-2.5 flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={15} />
          {product.stock === 0 ? "Out of Stock" : isAdding ? "Adding…" : "Add To Cart"}
        </button>
      </div>
      <div className="mt-3 px-0.5">
        <h3 onClick={onView} className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 cursor-pointer hover:text-[#DB4444] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="text-[#DB4444] font-bold text-sm">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-xs">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="inline-block mt-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
        <StarRating average={product.ratings?.average} count={product.ratings?.count} onRate={onRate} />
      </div>
    </div>
  );
}

// ─── Flash_sales ──────────────────────────────────────────────────────────────
export default function Flash_sales() {
  const dispatch  = useDispatch<AppDispatch>();  // ✅ typed
  const navigate  = useNavigate();

  const { data, isLoading, isError } =useProducts({ category: 'Flash Sales', limit: 20 })
  const products: Product[] = data?.products ?? [];

  const [timeLeft,    setTimeLeft]    = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ message: string; type: "success" | "error" }>({ message: "", type: "success" });
  const [addingId,    setAddingId]    = useState<string | null>(null);
  const [isLiked,     setLiked]       = useState<Record<string, boolean>>({});
  const [isPending,   startTransition] = useTransition();
  const carousel = useRef<HTMLDivElement>(null);
  const dragX    = useMotionValue(0);

  useEffect(() => {
    const tick = () => {
      const distance = SALE_END_DATE.getTime() - Date.now();
      if (distance <= 0) return;
      setTimeLeft({
        days:    Math.floor(distance / 86_400_000),
        hours:   Math.floor((distance / 3_600_000) % 24),
        minutes: Math.floor((distance / 60_000) % 60),
        seconds: Math.floor((distance / 1_000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleWishlistToggle = (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login to add to wishlist"); return; }
    startTransition(async () => {
      const wasLiked = !!isLiked[product._id];
      setLiked((prev) => ({ ...prev, [product._id]: !wasLiked }));
      try {
        const res = await axios.post(
          "https://shoppingstore-backend.vercel.app/api/wishlist/add",
          { productId: product._id, name: product.name, price: product.price, image: product.image },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) { toast.success(res.data.message || "Wishlist updated"); navigate("/wishlist"); }
      } catch (err: any) {
        setLiked((prev) => ({ ...prev, [product._id]: wasLiked }));
        toast.error(err.response?.data?.message || "Could not update wishlist");
      }
    });
  };

  // ✅ Uses addToCartAsync — hits backend + updates Redux in one dispatch
  const handleAddToCart = async (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalConfig({ message: "Please log in first to add items to your cart.", type: "error" });
      setIsModalOpen(true);
      return;
    }
    setAddingId(product._id);
    try {
      await dispatch(addToCartAsync(product)).unwrap();
      setModalConfig({ message: `${product.name} added to cart!`, type: "success" });
      setIsModalOpen(true);
    } catch (err: any) {
      setModalConfig({ message: err || "Failed to add to cart.", type: "error" });
      setIsModalOpen(true);
    } finally {
      setAddingId(null);
    }
  };

  const handleRateProduct = async (product: Product, rating: number) => {
    try {
      const result = await productsApi.rateProduct(product._id, rating);
      if (result.success) toast.success("Rating submitted!");
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  const scroll = (dir: "prev" | "next") => {
    if (!carousel.current) return;
    carousel.current.scrollBy({ left: (dir === "next" ? 1 : -1) * (carousel.current.offsetWidth / 2), behavior: "smooth" });
  };

  const Skeleton = () => (
    <div className="flex gap-4 sm:gap-6 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="min-w-[85%] sm:min-w-[270px] flex flex-col gap-3 animate-pulse">
          <div className="w-full aspect-square bg-gray-200 rounded-xl" />
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 mt-20 md:mt-60 lg:mt-20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-4 h-9 bg-[#DB4444] rounded-sm" />
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-[#DB4444]" fill="#DB4444" />
          <span className="text-[#DB4444] font-bold text-sm uppercase tracking-wider">Today's</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6 md:gap-12 flex-wrap">
          <h2 className="text-2xl md:text-4xl font-bold text-black tracking-tight">Flash Sales</h2>
          <div className="flex items-end gap-1">
            {[
              { label: "Days",  value: timeLeft.days },
              { label: "Hrs",   value: timeLeft.hours },
              { label: "Mins",  value: timeLeft.minutes },
              { label: "Secs",  value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-end">
                <CountdownUnit label={unit.label} value={unit.value} />
                {i < 3 && <span className="text-[#E07575] text-xl font-bold mx-1 mb-0.5 leading-none">:</span>}
              </div>
            ))}
          </div>
        </div>
        <SliderArrows onPrev={() => scroll("prev")} onNext={() => scroll("next")} />
      </div>

      {isError && (
        <div className="w-full text-center py-10 text-red-500 font-medium bg-red-50 rounded-xl border border-red-100">
          Failed to load flash sales. Please try again later.
        </div>
      )}

      {isLoading && <Skeleton />}

      {!isLoading && !isError && products.length > 0 && (
        <div ref={carousel} className="overflow-x-auto scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing" style={{ scrollbarWidth: "none" }}>
          <motion.div style={{ x: dragX }} drag="x" dragConstraints={carousel} dragElastic={0.1} className="flex gap-4 sm:gap-6 w-max">
            {products.map((product) => (
              <div key={product._id} className="snap-start min-w-[80vw] sm:min-w-[260px] md:min-w-[270px] max-w-[270px]">
                <ProductCard
                  product={product}
                  isLiked={!!isLiked[product._id]}
                  isAdding={addingId === product._id}
                  isPending={isPending}
                  onWishlist={() => handleWishlistToggle(product)}
                  onAddToCart={() => handleAddToCart(product)}
                  onRate={(v) => handleRateProduct(product, v)}
                  onView={() => navigate(`/view_item/${product._id}`)}
                />
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="text-center py-16 text-gray-400 font-medium">
          No active flash sales right now. Check back later!
        </div>
      )}

      <div className="flex justify-center mt-12">
        <Link to="/products" className="bg-[#DB4444] text-white px-10 py-3 rounded-lg font-medium hover:bg-[#c33d3d] active:scale-95 transition-all duration-200 inline-block">
          View All Products
        </Link>
      </div>

      <Line color="bg-gray-200" width="w-full" height="h-[1px]" margin="mt-16" />

      <CartModal
        isOpen={isModalOpen}
        type={modalConfig.type}
        message={modalConfig.message}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => { setIsModalOpen(false); if (modalConfig.type === "success") navigate("/cart"); }}
      />
    </div>
  );
}