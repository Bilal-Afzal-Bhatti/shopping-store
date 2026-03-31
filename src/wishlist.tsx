import { useState, useTransition, useCallback } from 'react';
import { Trash2, ShoppingBag, Heart, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---
interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition(); // React 19 Optimization
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    // Mock data based on your e-commerce project scope
    { _id: '1', name: 'Premium Tech Shell', price: 120, image: '/api/placeholder/150/150', category: 'Apparel', inStock: true, rating: 4.8 },
    { _id: '2', name: 'Minimalist Watch', price: 85, image: '/api/placeholder/150/150', category: 'Accessories', inStock: false, rating: 4.5 }
  ]);

  // Optimization: Memoized remove handler to prevent unnecessary re-renders
  const handleRemove = useCallback((id: string) => {
    startTransition(() => {
      setWishlist(prev => prev.filter(item => item._id !== id));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-black uppercase text-xs tracking-[0.3em]">
              <Heart size={16} fill="currentColor" /> Your Collection
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
              Wishlist <span className="text-gray-200">({wishlist.length})</span>
            </h1>
          </div>
          <button 
            onClick={() => navigate('/shop')}
            className="group flex items-center gap-3 font-black uppercase text-sm border-b-4 border-black pb-1 hover:text-red-600 transition-colors"
          >
            Continue Shopping <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {wishlist.map((item) => (
              <div 
                key={item._id}
                className="bg-white border-2 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-8 group hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {/* IMAGE CONTAINER */}
                <div className="w-full md:w-40 h-40 bg-gray-50 border-2 border-black p-4 relative overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-1">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* INFO SECTION */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.category}</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{item.name}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-black font-bold text-xs">{item.rating}</span>
                  </div>
                </div>

                {/* PRICE & ACTIONS */}
                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                  <div className="text-center md:text-right">
                    <p className="text-gray-400 font-black uppercase text-[10px]">Unit Price</p>
                    <p className="text-3xl font-black">${item.price}</p>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      disabled={!item.inStock || isPending}
                      className="flex-1 md:flex-none bg-black text-white px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPending ? <RefreshCw size={16} className="animate-spin" /> : <ShoppingBag size={18} />}
                      Add to Cart
                    </button>
                    
                    <button 
                      onClick={() => handleRemove(item._id)}
                      className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all group/trash"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={20} className="group-hover/trash:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-dashed border-gray-200">
            <Heart size={48} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-2xl font-black uppercase text-gray-300">Your wishlist is empty</h2>
            <button 
              onClick={() => navigate('/shop')}
              className="mt-6 bg-black text-white px-10 py-4 font-black uppercase tracking-widest hover:bg-red-600 transition-all"
            >
              Go Explore
            </button>
          </div>
        )}

        {/* FOOTER STATS */}
        {wishlist.length > 0 && (
          <div className="mt-12 p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
            <p className="font-bold text-sm uppercase tracking-widest">Estimated Value</p>
            <p className="text-2xl font-black">${wishlist.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;