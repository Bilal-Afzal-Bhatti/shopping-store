import React, { useState, useTransition, useCallback, useEffect } from 'react';
import { Trash2, ShoppingBag, Heart, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"; 
import { toast } from "react-hot-toast";

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const response = await axios.get(`${backendUrl}/api/wishlist/show`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(response.data.wishlist);
      } catch (error) {
        toast.error("Failed to sync wishlist", { style: { fontSize: '12px' } });
      } finally { setLoading(false); }
    };
    fetchWishlist();
  }, [navigate, backendUrl]);

  const handleRemove = async (productId: string | number) => {
    const token = localStorage.getItem("token");
    setDeletingId(null); // Close modal
    
    startTransition(async () => {
      const previous = [...wishlist];
      setWishlist(prev => prev.filter(item => item.productId !== productId));

      try {
        await axios.post(`${backendUrl}/api/wishlist/w/add`, { productId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Removed", { duration: 1000, style: { fontSize: '12px', fontWeight: 'bold' } });
      } catch (error) {
        setWishlist(previous);
        toast.error("Error removing item", { style: { fontSize: '12px' } });
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-10 font-sans selection:bg-red-100">
      {/* DELETE MODAL OVERLAY */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white border-2 border-black p-6 max-w-[300px] w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase mb-4 tracking-tighter">Remove this item from favorites?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => handleRemove(deletingId)}
                className="flex-1 bg-black text-white py-2 text-[10px] font-bold uppercase hover:bg-red-600 transition-colors"
              >Confirm</button>
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 border-2 border-black py-2 text-[10px] font-bold uppercase"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* COMPACT HEADER */}
        <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Favorites<span className="text-red-600">({wishlist.length})</span></h1>
          </div>
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </button>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((item) => {
              const numericPrice = Number(String(item.price).replace(/[^0-9.-]+/g,""));

              return (
                <div key={item._id} className="group relative border-2 border-black bg-white transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
                  {/* COMPACT IMAGE */}
                  <div className="aspect-square w-full bg-[#f9f9f9] overflow-hidden border-b-2 border-black relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button 
                      onClick={() => setDeletingId(item.productId)}
                      className="absolute top-2 right-2 p-2 bg-white border border-black hover:bg-red-50 hover:text-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* INFO AREA - SMALLER FONTS */}
                  <div className="p-3 flex flex-col flex-1 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[11px] font-black uppercase leading-tight truncate">{item.name}</h3>
                      <p className="text-[11px] font-black italic text-red-600">${numericPrice.toFixed(0)}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={8} fill={i < Math.floor(item.rating) ? "black" : "none"} stroke="black" />
                      ))}
                      <span className="text-[8px] font-bold text-gray-400 ml-1">({item.rating})</span>
                    </div>

                    <button className="w-full mt-auto bg-black text-white py-2 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                      <ShoppingBag size={12} /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center border-4 border-dashed border-gray-100">
             <Heart className="mx-auto mb-4 text-gray-200" size={40} />
             <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Your wishlist is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;