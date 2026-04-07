import React, { useState, useTransition, useCallback, useEffect } from 'react';
import { Trash2, ShoppingBag, Heart, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"; 
import { toast } from "react-hot-toast";

interface WishlistItem {
  _id: string;
  productId: string | number; // Added to match your DB structure
  name: string;
  price: any; // Kept as any briefly to handle the String vs Number conversion
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // 1. Fetch Wishlist Data
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view your wishlist");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/wishlist/show`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setWishlist(response.data.wishlist);
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        toast.error(error.response?.data?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
        setTimeout(() => setIsVisible(true), 100); 
      }
    };

    fetchWishlist();
  }, [navigate, backendUrl]);

  // 2. Fixed Delete Logic
  const handleRemove = useCallback(async (productId: string | number) => {
    const token = localStorage.getItem("token");
    
    // Optimistic Update: Remove from UI immediately
    const previousWishlist = [...wishlist];
    setWishlist(prev => prev.filter(item => item.productId !== productId));

    startTransition(async () => {
      try {
        // Use the same "Toggle" endpoint you used for adding
        const response = await axios.post(
          `${backendUrl}/api/wishlist/w/add`,
          { productId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success("Item removed");
        }
      } catch (error) {
        toast.error("Could not remove item");
        setWishlist(previousWishlist); // Revert UI on failure
      }
    });
  }, [wishlist, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-black border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-6 font-sans selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em]">
                <Heart size={12} fill="white" /> Curated Favorites
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-2">
                Wishlist<span className="text-red-600">.</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                Storage: {wishlist.length} Items
              </p>
            </div>
            <button 
              onClick={() => navigate('/home')}
              className="group flex items-center gap-4 font-black uppercase text-sm border-b-4 border-black pb-2 hover:text-red-600 transition-all"
            >
              Back to Catalog <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
            </button>
          </div>
        </header>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {wishlist.map((item, index) => {
              // SAFE PRICE CONVERSION: Handles strings like "$120" or "120"
              const numericPrice = typeof item.price === 'string' 
                ? Number(item.price.replace(/[^0-9.-]+/g,"")) 
                : Number(item.price);

              return (
                <div 
                  key={item._id}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className={`bg-white border-[3px] border-black p-6 flex flex-col md:flex-row items-center gap-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-2 hover:-translate-x-1 transition-all duration-500 group
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
                >
                  {/* PRODUCT VISUAL */}
                  <div className="w-full md:w-48 h-48 bg-[#f0f0f0] border-2 border-black relative overflow-hidden shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 border border-black">{item.category || "General"}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < Math.floor(item.rating) ? "black" : "none"} stroke="black" />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight group-hover:text-red-600 transition-colors">{item.name}</h3>
                  </div>

                  {/* PRICING & ACTIONS */}
                  <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto border-t-2 md:border-t-0 md:border-l-2 border-black pt-6 md:pt-0 md:pl-10">
                    <div className="text-center md:text-right min-w-[120px]">
                      <p className="text-gray-400 font-black uppercase text-[10px] mb-1">Price</p>
                      <p className="text-4xl font-black italic">
                        ${isNaN(numericPrice) ? "0.00" : numericPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <button className="flex-1 md:flex-none bg-black text-white px-10 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
                        <ShoppingBag size={20} /> Add to Bag
                      </button>
                      
                      <button 
                        onClick={() => handleRemove(item.productId)} // Using productId for the toggle logic
                        className="p-5 border-[3px] border-black bg-white hover:bg-black hover:text-white transition-all"
                      >
                        {isPending ? <RefreshCw size={24} className="animate-spin" /> : <Trash2 size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center border-[6px] border-dashed border-gray-200">
             <h2 className="text-4xl md:text-6xl font-black uppercase text-gray-200 italic tracking-tighter">No items saved.</h2>
             <button onClick={() => navigate('/home')} className="mt-10 bg-black text-white px-16 py-6 font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all">Launch Shop</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;