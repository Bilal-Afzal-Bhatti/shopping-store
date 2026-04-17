import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import { useProduct } from "./hooks/useProducts";
import { addToCart } from "./redux/slices/cartSlice";
import { productsApi } from "./api/productsApi";
import axiosInstance from "./api/axiosInstance";

const Viewitem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const { data: product, isLoading, isError } = useProduct(id!);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Default to main image when loaded
  useEffect(() => {
    if (product && product.image) {
      setSelectedImage(product.image);
    }
    // Select first color by default if available
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].hex);
    }
  }, [product]);

  const handleQuantity = (type: "inc" | "dec") => {
    setQuantity((prev) =>
      type === "inc" ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
  };

  const handleRateProduct = async (ratingValue: number) => {
    if (!product) return;
    try {
      const result = await productsApi.rateProduct(product._id, ratingValue);
      if (result.success) {
        toast.success(result.message || "Thank you for your rating!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first to add items to your cart.");
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
        // Redux Sync 
        // We simulate multiple dispatches for quantity or assume backend handles quantity 
        // We will dispatch once but multiply price if your slice handles it, or dispatch looping
        for(let i=0; i<quantity; i++) {
          dispatch(addToCart({
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock || 10,
            category: product.category || "Other",
            isActive: true
          }));
        }
        toast.success(`${quantity} x ${product.name} added to cart!`);
      } else {
        toast.error(res.data?.message || "Failed to add item.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Network error. Please try again later.");
    } finally {
      setIsAdding(false);
    }
  };

  // Adjust image size slightly based on selected size
  const sizeScale = selectedSize === "S" ? "scale-75" : selectedSize === "M" ? "scale-90" : selectedSize === "L" ? "scale-100" : "scale-110";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center">
            <div className="w-64 h-64 bg-gray-300 rounded-md mb-4"></div>
            <div className="w-48 h-6 bg-gray-300 rounded-md"></div>
         </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="text-xl text-red-500 font-medium bg-red-100 px-6 py-4 rounded-md">
           Failed to load product details. It may have been removed.
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 px-6 md:px-20 py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 ml-2 md:ml-8">
        <Link to="/myaccount" className="hover:text-[#DB4444] transition-colors font-medium">
          Home
        </Link>{" "}
        / <Link to="/shop" className="hover:text-[#DB4444] transition-colors font-medium">{product.category}</Link>{" "}
        / <span className="text-black font-semibold">{product.name}</span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[96px_1fr_360px] gap-6 bg-white shadow-sm rounded-2xl p-8 mx-auto max-w-7xl">
        
        {/* Left Thumbnails - If backend supports multiple images in future, map them here. We mirror the single image into 4 thumbs for layout consistency */}
        <div className="flex lg:flex-col gap-4 justify-start items-start">
          {[product.image, product.image, product.image, product.image].map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`p-2 bg-gray-100 rounded-xl cursor-pointer transition ${selectedImage === img ? "ring-2 ring-[#DB4444]" : ""}`}
            >
              <img src={img || 'https://via.placeholder.com/150'} alt={`thumb-${idx}`} className="w-20 h-20 object-contain rounded-md" />
            </div>
          ))}
        </div>

        {/* Center - MAIN IMAGE */}
        <div className="flex justify-center items-center mb-10 overflow-hidden">
          <div className="bg-[#F5F5F5] rounded-2xl p-6 w-full h-[430px] flex justify-center items-center shadow-xs transition-all duration-300">
            {product.discount && product.discount !== 'No Discount' && (
              <span className="absolute top-10 left-10 bg-[#DB4444] text-white text-[12px] font-bold px-3 py-1 rounded shadow-sm z-10">
                {product.discount.match(/\d+/) ? `-${product.discount.match(/\d+/)?.[0]}%` : product.discount}
              </span>
            )}
            <img
              src={selectedImage || 'https://via.placeholder.com/600'}
              alt={product.name}
              className={`object-contain max-w-[92%] max-h-[92%] rounded-xl transition-all duration-300 ${sizeScale} hover:scale-105 mix-blend-multiply`}
            />
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-5 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{product.name}</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                const avgStr = product.ratings?.average || 0;
                return (
                   <button 
                     key={i} 
                     onClick={() => handleRateProduct(starValue)}
                     className="focus:outline-hidden hover:scale-110 active:scale-95 transition-transform"
                   >
                     <Star 
                       size={17} 
                       className={`transition-colors duration-200 ${
                         starValue <= Math.round(avgStr) 
                           ? "text-yellow-400 fill-yellow-400" 
                           : "text-gray-300 hover:text-yellow-200"
                       }`} 
                     />
                   </button>
                );
              })}
              <span className="text-gray-400 text-xs font-bold ml-1">({product.ratings?.count || 0} Reviews)</span>
            </div>
            
            <div className="w-[1px] h-4 bg-gray-300"></div>

            <span className={`font-medium ${product.stock > 0 ? 'text-[#00FF66]' : 'text-[#DB4444]'}`}>
               {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-4">
             <p className="text-3xl font-medium tracking-tight">${product.price}</p>
             {product.originalPrice && (
                <p className="text-xl text-gray-400 line-through">${product.originalPrice}</p>
             )}
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">
            {/* description not natively in AdminProduct but if added later this renders safely */}
            {product.category === 'Electronics' 
               ? "Industry-leading premium electronic devices featuring cutting-edge performance. Secure your modern tech stack today." 
               : "Premium materials engineered for comfort, style, and superior longevity. Upgrade your lifestyle with our featured products."}
          </p>

          <hr className="my-6 border-gray-200" />
          
          {/* Colors (Mapped dynamically if schema has them) */}
          {product.colors && product.colors.length > 0 ? (
            <div className="flex items-center gap-4">
              <span className="font-medium text-lg w-16">Colours:</span>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color.hex)}
                    title={color.name}
                    className={`w-6 h-6 rounded-full transition ${
                      selectedColor === color.hex ? "ring-2 ring-offset-2 ring-black" : "border border-gray-300"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Fallback to static selection if backend didn't save colors */}
              <span className="font-medium text-lg w-16">Colours:</span>
              <div className="flex gap-3">
                {["#E07575", "#000000"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition ${
                      selectedColor === color ? "ring-2 ring-offset-2 ring-black" : "border border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="flex items-center gap-4 mt-6">
            <span className="font-medium text-lg w-16">Size:</span>
            <div className="flex gap-3">
              {["S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 border rounded-md text-sm font-medium transition ${
                    selectedSize === size
                      ? "bg-[#DB4444] text-white border-[#DB4444]"
                      : "border-gray-300 hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => handleQuantity("dec")}
                className="px-4 py-2 hover:bg-[#DB4444] hover:text-white transition"
              >
                −
              </button>
              <div className="px-6 border-l border-r border-gray-300 font-medium w-16 text-center">{quantity}</div>
              <button
                onClick={() => handleQuantity("inc")}
                className="px-4 py-2 hover:bg-[#DB4444] hover:text-white transition bg-gray-50"
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
              className="bg-[#DB4444] text-white px-8 py-2.5 rounded-md hover:bg-[#c33d3d] active:scale-95 transition-all font-medium disabled:bg-gray-400 min-w-[150px]"
            >
              {isAdding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Buy Now"}
            </button>

            <button
              onClick={() => setFavorite(!favorite)}
              className={`p-2 rounded-md border ${
                favorite ? "bg-[#DB4444] border-[#DB4444] text-white" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
              } transition-colors`}
            >
              <Heart
                size={22}
                fill={favorite ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Delivery Services Info Block */}
          <div className="mt-8 border border-gray-300 rounded-md overflow-hidden">
             <div className="flex items-center gap-4 p-4 border-b border-gray-300">
                <i className="lucide-truck w-8 h-8 opacity-70 flex items-center justify-center border border-black rounded-full overflow-hidden">&nbsp;</i>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Free Delivery</span>
                  <span className="text-xs font-semibold text-gray-600 underline">Enter your postal code for Delivery Availability</span>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4">
                <i className="lucide-rotate-ccw w-8 h-8 opacity-70 flex items-center justify-center border border-black rounded-full overflow-hidden">&nbsp;</i>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Return Delivery</span>
                  <span className="text-xs font-semibold text-gray-600">Free 30 Days Delivery Returns. Details</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewitem;
