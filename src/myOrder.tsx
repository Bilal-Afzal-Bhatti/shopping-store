import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, ArrowLeft,  } from 'lucide-react';

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
        // Industry Level: Always include Authorization headers for user-specific data
        const res = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Safety check: ensure orders is always an array
        if (res.data && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else {
          setOrders([]);
        }
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
    <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest animate-pulse">
      Fetching History...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Order History</h1>
            <p className="text-gray-500 font-medium uppercase text-xs mt-1">Manage and track your recent purchases</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xs font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
          >
            <ArrowLeft size={14}/> Back to Shop
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 p-20 text-center rounded-xl">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-500 uppercase">You have no orders yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div 
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase rounded">
                        {order.orderStatus || 'processing'}
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date Placed</p>
                      <p className="font-bold text-sm uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Item Gallery */}
                    <div className="flex -space-x-3 overflow-hidden">
                      {order.items?.map((item: any, i: number) => (
                        <img 
                          key={i}
                          className="inline-block h-16 w-16 rounded-lg ring-4 ring-white object-cover bg-gray-50 border border-gray-100"
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                        <p className="text-2xl font-black text-black">${order.totalPrice}</p>
                      </div>
                      console.log("id ",_id);
                      <button 
                      
                        onClick={() => navigate(`/orderTracking/${order._id}`)}
                        className="bg-black text-white px-6 py-3 rounded-lg font-bold uppercase text-xs flex items-center gap-2 hover:bg-blue-600 transition-colors"
                      >
                        Track <ChevronRight size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;