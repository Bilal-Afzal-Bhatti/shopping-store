// src/view_item.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { addToCartAsync } from "./redux/slices/cartSlice";  // ✅ async thunk
import { useProduct } from "./hooks/useProducts";
import axiosInstance from "./api/axiosInstance";
import type { AppDispatch } from "./redux/store";

export const Viewitem: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();  // ✅ typed

  const { data: product, isLoading, isError } = useProduct(id);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize,  setSelectedSize]  = useState<string>('');
  const [quantity,      setQuantity]      = useState(1);
  const [favorite,      setFavorite]      = useState(false);
  const [isAdding,      setIsAdding]      = useState(false);
  const [hoveredStar,   setHoveredStar]   = useState<number | null>(null);

  useEffect(() => {
    if (!product) return;
    if (product.image) setSelectedImage(product.image);
    if (product.variants?.length > 0) {
      setSelectedColor(product.variants[0].color.hex);
      setSelectedSize(product.variants[0].size);
    }
  }, [product]);

  const handleQuantity = (type: "inc" | "dec") =>
    setQuantity((prev) => type === "inc" ? prev + 1 : prev > 1 ? prev - 1 : 1);

  const handleRateProduct = async (ratingValue: number) => {
    if (!product) return;
    try {
      const { data } = await axiosInstance.post(`/admin/products/${product._id}/review`, { rating: ratingValue });
      if (data.success) toast.success("Rating submitted!");
    } catch {
      toast.error("Failed to submit rating");
    }
  };


// src/view_item.tsx - only the buttons section changed
// Remove Add to Cart, keep only Buy Now + Wishlist

const handleBuyNow = async () => {
  const token = localStorage.getItem("token");
  if (!token) { toast.error("Please login first"); return; }
  if (!product) return;
  setIsAdding(true);
  try {
    // ✅ Cast to any to bypass the strict Product type check 
    // while including the quantity property
    await dispatch(addToCartAsync({ ...product, quantity } as any)).unwrap();
    navigate("/cart");
  } catch (err: any) {
    toast.error(err?.message || "Failed to proceed");
  } finally {
    setIsAdding(false);
  }
};
  const uniqueColors = product?.variants
    ? [...new Map(product.variants.map((v) => [v.color.hex, v.color])).values()]
    : [];

  const sizesForColor = product?.variants
    ? product.variants.filter((v) => v.color.hex === selectedColor).map((v) => v.size)
    : [];

  const stockForSelection = product?.variants?.find(
    (v) => v.color.hex === selectedColor && v.size === selectedSize
  )?.stock ?? product?.stock ?? 0;

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 font-medium mb-4">Product not found.</p>
      <button onClick={() => navigate(-1)} className="text-[#DB4444] underline">Go back</button>
    </div>
  );

  const avgRating   = product.ratings?.average ?? 0;
  const ratingCount = product.ratings?.count   ?? 0;
  const displayStar = hoveredStar ?? Math.round(avgRating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-10 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#F5F5F5] rounded-2xl aspect-square flex items-center justify-center p-8 overflow-hidden">
            <img
              src={selectedImage || product.image} alt={product.name}
              className="w-full h-full object-contain transition-all duration-300"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Image"; }}
            />
          </div>
          {uniqueColors.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {uniqueColors.map((color) => (
                <button key={color.hex}
                  onClick={() => {
                    setSelectedColor(color.hex);
                    const firstSize = product.variants.find((v) => v.color.hex === color.hex)?.size;
                    if (firstSize) setSelectedSize(firstSize);
                  }}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${selectedColor === color.hex ? "border-gray-900 scale-110 shadow" : "border-transparent hover:border-gray-400"}`}
                  style={{ backgroundColor: color.hex }} title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          {/* Stars */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRateProduct(star)}
                  onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(null)}
                  className="focus:outline-none hover:scale-125 active:scale-95 transition-transform"
                >
                  <Star size={18} fill={star <= displayStar ? "#FBBF24" : "none"}
                    stroke={star <= displayStar ? "#FBBF24" : "#D1D5DB"} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400">({ratingCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#DB4444]">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-gray-400 line-through text-base">${product.originalPrice.toFixed(2)}</span>}
            {product.discount && product.discount !== "No Discount" && (
              <span className="bg-[#DB4444] text-white text-xs font-bold px-2.5 py-1 rounded-md">{product.discount}</span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stockForSelection > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <span className={`text-sm font-medium ${stockForSelection > 0 ? "text-green-600" : "text-red-500"}`}>
              {stockForSelection > 0 ? `${stockForSelection} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Color */}
          {uniqueColors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="font-normal text-gray-500">{uniqueColors.find((c) => c.hex === selectedColor)?.name}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {uniqueColors.map((color) => (
                  <button key={color.hex}
                    onClick={() => {
                      setSelectedColor(color.hex);
                      const firstSize = product.variants.find((v) => v.color.hex === color.hex)?.size;
                      if (firstSize) setSelectedSize(firstSize);
                    }}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color.hex ? "border-gray-900 scale-110 shadow-md" : "border-gray-300 hover:border-gray-500"}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {sizesForColor.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {sizesForColor.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === size ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-700 hover:border-gray-600"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
            <div className="flex items-center w-fit border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => handleQuantity("dec")} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium">−</button>
              <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
              <button onClick={() => handleQuantity("inc")} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-lg font-medium">+</button>
            </div>
          </div>

          {/* Buttons */}
        {/* Buttons — only Buy Now + Wishlist */}
<div className="flex gap-3 flex-wrap">
  <button onClick={handleBuyNow}
    disabled={isAdding || stockForSelection === 0}
    className="flex-1 min-w-[140px] flex items-center justify-center gap-2
               bg-[#DB4444] text-white font-semibold py-3 px-6 rounded-xl
               hover:bg-[#c33d3d] active:scale-95 transition-all duration-200
               disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <ShoppingCart size={18} />
    {isAdding ? "Adding…" : "Add to Cart"}
  </button>

  <button onClick={() => setFavorite((p) => !p)}
    className="w-12 h-12 flex items-center justify-center rounded-xl
               border-2 border-gray-200 hover:border-red-300 transition"
  >
    <Heart size={20} className={favorite ? "fill-[#DB4444] text-[#DB4444]" : "text-gray-400"} />
  </button>
</div>

          <p className="text-sm text-gray-400">
            Category: <span className="text-gray-600 font-medium">{product.category}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Viewitem;