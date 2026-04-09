import React, { useState, useTransition, useCallback, useEffect } from 'react';
import { Trash2, ShoppingBag, Heart, ArrowLeft, Star, Loader2, Sparkles } from 'lucide-react';
import { useNavigate,Link } from 'react-router-dom';
import axios from "axios"; 
import { toast } from "react-hot-toast";

interface WishlistItem {
  _id: string;
  productId: string | number;
  name: string;
  price: any;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // --- GET API: DO NOT DISTURB ---
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login", { style: { fontSize: '12px' } });
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
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [navigate, backendUrl]);

  // --- DELETE API: DO NOT DISTURB ---
  const handleRemove = useCallback(async (productId: string | number) => {
    const token = localStorage.getItem("token");
    const previousWishlist = [...wishlist];
    setWishlist(prev => prev.filter(item => item.productId !== productId));
    setDeletingId(null); // Close modal

    startTransition(async () => {
      try {
        const response = await axios.delete(
          `${backendUrl}/api/wishlist/clear`, 
          { 
            headers: { Authorization: `Bearer ${token}` },
            data: { productId } 
          }
        );
        if (response.data.success) {
          toast.success("Removed", { style: { fontSize: '10px', fontWeight: 'bold' } });
        }
      } catch (error) {
        toast.error("Failed to remove");
        setWishlist(previousWishlist);
      }
    });
  }, [wishlist, backendUrl]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 md:px-12 font-sans selection:bg-black selection:text-white">
      
      {/* SMALL COMPACT DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white border-[3px] border-black p-6 max-w-[300px] w-full shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[11px] font-black uppercase tracking-tighter mb-4">Remove from favorites?</h4>
            <div className="flex gap-3">
              <button 
                onClick={() => handleRemove(deletingId)} 
                className="flex-1 bg-black text-white py-2 text-[10px] font-black uppercase hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={() => setDeletingId(null)} 
                className="flex-1 border-2 border-black py-2 text-[10px] font-black uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* COMPACT HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b-[3px] border-black pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
              <Sparkles size={10} className="text-red-600" /> Member Exclusive
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
              Wishlist<span className="text-red-600">.</span>
              <span className="text-sm not-italic ml-2 text-gray-400">({wishlist.length})</span>
            </h1>
          </div>
         <Link 
    to="/" 
    className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors border-b-2 border-transparent hover:border-red-600 pb-1"
  >
    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
    Back to Store
  </Link>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((item) => {
              const numericPrice = Number(String(item.price).replace(/[^0-9.-]+/g,""));

              return (
                <div key={item._id} className="group relative bg-white border-2 border-black transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
                  
                  {/* IMAGE AREA */}
                  <div className="aspect-square w-full bg-[#F5F5F5] overflow-hidden relative border-b-2 border-black p-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button 
                      onClick={() => setDeletingId(item.productId)}
                      className="absolute top-2 right-2 p-2 bg-white border border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* INFO AREA */}
                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[10px] font-black uppercase leading-tight line-clamp-2 min-h-6">{item.name}</h3>
                      <span className="text-[11px] font-black italic text-red-600">${numericPrice.toFixed(0)}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-auto">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={8} fill={i < Math.floor(item.rating) ? "black" : "none"} stroke="black" />
                        ))}
                      </div>
                      <span className="text-[8px] font-bold text-gray-300">({item.rating})</span>
                    </div>

                    <button className="w-full bg-black text-white py-2.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-colors">
                      <ShoppingBag size={12} /> Add to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
             <Heart className="text-gray-200 mb-4" size={48} strokeWidth={1} />
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">No items saved</p>
             <button onClick={() => navigate('/home')} className="mt-6 px-8 py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Go Shop</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;