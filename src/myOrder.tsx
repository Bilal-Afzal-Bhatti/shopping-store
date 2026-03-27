import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react';

// --- INTERFACES ---
interface OrderItem {
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderHistoryData {
  _id: string;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderHistoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
   console.log("id***",userId);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
     
        // Ensure this endpoint matches your backend route exactly
        const res = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/user/${userId}`);
        
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err: any) {
        setError("Could not load your order history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
        fetchOrders();
    } else {
        navigate('/login');
    }
  }, [userId, navigate]);

  // Helper to style status badges
  const getStatusBadge = (status: string) => {
    const base = "text-[10px] font-black uppercase px-2 py-1 border-2 ";
    switch (status) {
      case 'delivered': return `${base} border-green-500 text-green-600 bg-green-50`;
      case 'shipped': return `${base} border-blue-500 text-blue-600 bg-blue-50`;
      case 'cancelled': return `${base} border-red-500 text-red-600 bg-red-50`;
      default: return `${base} border-orange-500 text-orange-600 bg-orange-50`; // processing
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black uppercase italic tracking-tighter">
      Loading History...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">My Orders</h1>
            <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">
              Total Orders: {orders.length}
            </p>
          </div>
          <button onClick={() => navigate('/')} className="text-xs font-black uppercase flex items-center gap-1 hover:text-red-600 transition-colors">
            <ArrowLeft size={14}/> Back to Shop
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border-2 border-black p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Package size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-black uppercase text-gray-400">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Left Side: Order Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={getStatusBadge(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                      <p className="text-[10px] font-mono font-bold text-gray-400 underline uppercase">
                        #{order._id.slice(-8)}
                      </p>
                    </div>

                    {/* Preview Images of Items */}
                  {/* Preview Images of Items with Safety Check */}
<div className="flex gap-2 mb-4">
  {order.items.slice(0, 4).map((item, idx) => (
    <div key={idx} className="w-12 h-12 border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
      <img 
        // ✅ The fix: Check if item.image exists before calling startsWith
        src={item.image && item.image.startsWith('http') 
          ? item.image 
          : item.image 
            ? `https://shopping-store-blond-one.vercel.app${item.image}` 
            : '/assets/placeholder.png' // Fallback if image is missing
        } 
        alt={item.name} 
        className="object-contain w-full h-full p-1"
      />
    </div>
  ))}
</div>

                    <p className="text-sm font-black uppercase italic">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>

                  {/* Right Side: Total & Action */}
                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-black border-dashed pt-4 md:pt-0 md:pl-8">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Amount</p>
                      <p className="text-3xl font-black text-black leading-none mt-1">${order.totalPrice}</p>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/orderTracking/${order._id}`)}
                      className="group flex items-center gap-2 bg-black text-white px-5 py-3 font-black uppercase text-xs hover:bg-red-600 transition-colors"
                    >
                      Track Order <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
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