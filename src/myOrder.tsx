import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion'; // 🏃 Install this: npm install framer-motion

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId || !token) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
      } catch (err) {
        console.error("History fetch error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId, token, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest animate-pulse italic">
      Fetching History...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black italic">My Orders</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Personal Purchase Vault</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="w-fit flex items-center gap-2 text-xs font-black uppercase border-4 border-black px-6 py-3 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <ArrowLeft size={16} strokeWidth={3}/> Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border-4 border-black p-20 text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
            <Package size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-black text-black uppercase italic">The vault is empty</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order._id}
                className="bg-white border-2 border-black rounded-sm overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group"
              >
                <div className="p-4 sm:p-6">
                  {/* Status Bar */}
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b-2 border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1 text-[10px] font-black uppercase italic ${
                        order.orderStatus === 'delivered' ? 'bg-green-400' : 'bg-yellow-400'
                      } border-2 border-black`}>
                        {order.orderStatus || 'processing'}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">ID: {order._id.slice(-10)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Date</p>
                      <p className="font-black text-sm uppercase">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    
                    {/* 🖼️ INDUSTRIAL SLIDER GALLERY */}
                    <div className="w-full md:w-2/3">
                      <p className="text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Package Contents ({order.items?.length})</p>
                      <div className="relative">
                        <motion.div 
                          drag="x"
                          dragConstraints={{ right: 0, left: -100 }}
                          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 cursor-grab active:cursor-grabbing"
                        >
                          {order.items?.map((item: any, i: number) => (
                            <div key={i} className="group/item relative shrink-0">
                              <img 
                                className="h-20 w-20 rounded-none border-2 border-black object-contain bg-gray-50 p-2"
                                src={item.image?.startsWith('http') ? item.image : `https://shopping-store-blond-one.vercel.app${item.image}`}
                                alt={item.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Product'; }}
                              />
                              {/* Hover Tooltip */}
                              <div className="absolute -top-8 left-0 hidden group-hover/item:block bg-black text-white text-[8px] font-bold px-2 py-1 uppercase whitespace-nowrap z-10">
                                {item.name} (x{item.quantity})
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    </div>

                    {/* Action & Total */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-6 w-full md:w-auto justify-between border-t-2 border-gray-50 pt-4 md:border-t-0 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Total</p>
                        <p className="text-3xl font-black text-black leading-tight tracking-tighter italic">
                          ${Number(order.totalPrice || 0).toFixed(2)}
                        </p>
                      </div>
                  
                      <button 
                        onClick={() => navigate(`/orderTracking/${order._id}`)}
                        className="bg-black text-white px-8 py-4 font-black uppercase text-xs flex items-center gap-3 hover:bg-red-600 transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(255,0,0,0.5)] md:shadow-none"
                      >
                        Track <ChevronRight size={18} strokeWidth={4}/>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;