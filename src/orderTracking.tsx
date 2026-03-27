import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Truck, Clock, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

// --- INTERFACES (Matching your Backend Model) ---
interface OrderData {
  _id: string;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'stripe';
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  billingInfo: {
    name: string;
    address: string;
    city: string;
    zipcode: string;
  };
  createdAt: string;
}

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Logic
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Use your local IP or Environment Variable for the API URL
        console.log("id****",id);
        const response = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/track/${id}`);
        
        if (response.data.success || response.data.order) {
          setOrder(response.data.order);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to locate order");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  // 2. Stepper Configuration
  const steps = [
    { id: 'processing', label: 'Order Placed', icon: Clock },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ];

  const currentIdx = order ? steps.findIndex(s => s.id === order.orderStatus) : 0;

  // 3. Loading State (Industry standard Skeleton or Spinner)
  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  // 4. Error State
  if (error || !order) return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <AlertCircle size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-black uppercase">Order Not Found</h2>
      <p className="text-gray-500 mb-6">{error || "The tracking ID provided is invalid."}</p>
      <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 font-bold uppercase text-sm hover:bg-red-600 transition-colors">
        Back to Shopping
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans bg-white animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6 mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Track Order</h1>
          <p className="text-gray-400 mt-1 font-medium italic">ID: #{order._id.toUpperCase()}</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Date</p>
          <p className="text-xl font-bold text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stepper Logic */}
      <div className="relative flex justify-between items-center mb-24 px-2 md:px-10">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10" />
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentIdx;
          const isCurrent = index === currentIdx;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
               {index > 0 && (
                <div className={`absolute top-1/2 right-1/2 w-full h-[3px] -translate-y-1/2 -z-10 transition-all duration-1000 
                  ${isActive ? 'bg-red-500' : 'bg-transparent'}`} 
                />
              )}
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-700
                ${isActive ? 'bg-red-600 border-red-100 text-white' : 'bg-white border-gray-100 text-gray-300'}
                ${isCurrent ? 'ring-8 ring-red-50 scale-110' : ''}`}>
                {isActive && index < currentIdx ? <Check size={28} strokeWidth={3} /> : <Icon size={24} />}
              </div>
              <div className="absolute -bottom-10 w-32 text-center">
                <p className={`text-[10px] md:text-xs font-black uppercase tracking-tighter 
                  ${isActive ? 'text-black' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold uppercase italic border-l-4 border-red-600 pl-3 mb-6">Package Content</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-sm bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border flex items-center justify-center font-bold text-gray-400">
                   {item.quantity}x
                </div>
                <div>
                  <p className="font-bold text-black uppercase">{item.name}</p>
                  <p className="text-xs text-gray-500 font-bold">UNIT PRICE: ${item.price}</p>
                </div>
              </div>
              <p className="font-black text-lg text-black">${item.price * item.quantity}</p>
            </div>
          ))}
          
          <div className="flex justify-between items-center p-6 bg-black text-white rounded-sm mt-4">
            <span className="font-bold uppercase tracking-widest text-xs text-gray-400">Grand Total</span>
            <span className="text-3xl font-black text-red-500">${order.totalPrice}</span>
          </div>
        </div>

        {/* Shipping Summary */}
        <div className="bg-white border-2 border-black p-8 rounded-sm self-start shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-6 text-red-600 font-black uppercase italic underline decoration-2">
            <MapPin size={20} strokeWidth={3}/>
            <h3>Shipping To</h3>
          </div>
          <div className="space-y-1 text-gray-800">
            <p className="text-black font-black text-xl mb-2 uppercase">{order.billingInfo.name}</p>
            <p className="text-sm font-medium">{order.billingInfo.address}</p>
            <p className="text-sm font-black">{order.billingInfo.city}, {order.billingInfo.zipcode}</p>
          </div>
          <div className="mt-8 pt-6 border-t border-black border-dashed">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Payment</p>
            <span className="text-xs font-black uppercase text-black border border-black px-2 py-1">
               {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid via Card'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;