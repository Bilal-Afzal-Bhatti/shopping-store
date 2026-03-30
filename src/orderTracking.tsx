import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Truck, Clock, ShieldCheck, MapPin, AlertCircle, Package, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
// --- INTERFACES ---
interface OrderItem {
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  discount?: string;
}

interface OrderData {
  _id: string;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'stripe';
  totalPrice: number;
  items: OrderItem[];
  billingInfo: {
    name: string;
    address: string;
    city: string;
    zipcode: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const [isCancelling, setIsCancelling] = useState(false);

const handleCancelOrder = async () => {
    // A. Confirm with the user first (UX Standard)
    const result = await Swal.fire({
      title: 'CANCEL ORDER?',
      text: "This action will send a request to our admins.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'YES, CANCEL IT',
      customClass: {
        popup: 'border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
        confirmButton: 'rounded-none font-black uppercase',
        cancelButton: 'rounded-none font-black uppercase'
      }
    });

    if (result.isConfirmed) {
      try {
        setIsCancelling(true);
        // B. API Call
           console.log("id.....",id);
        const res = await axios.post(
       
          `https://shoppingstore-backend.vercel.app/api/ordercancel/${id}/cancel`, 
          { reason: "Changed my mind" }, // You could also show a select dropdown here
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        if (res.data.success) {
          Swal.fire({
            title: 'REQUEST SENT',
            text: 'Admin will review your cancellation.',
            icon: 'success',
            confirmButtonColor: '#000'
          });
          // Refresh order data to show "Processing" or "Cancellation Pending"
          window.location.reload(); 
        }
      } catch (err: any) {
        Swal.fire('ERROR', err.response?.data?.message || 'Cancellation failed', 'error');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  // 3. Logic Check: Can the user cancel?
  // Industry Standard: No cancellation if Shipped or already Cancelled
  const canCancel = order && !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus.toLowerCase());
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/track/${id}`);
        if (response.data.success || response.data.order) {
          setOrder(response.data.order);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Order not found in our records.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const steps = [
    { id: 'processing', label: 'Processing', icon: Clock },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ];

  const currentIdx = order ? steps.findIndex(s => s.id === order.orderStatus) : 0;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-16 h-16 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
      <p className="font-black uppercase tracking-tighter text-sm">Locating Package...</p>
    </div>
  );

  if (error || !order) return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
      <div className="bg-white p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <AlertCircle size={64} className="text-red-600 mx-auto mb-4" />
        <h2 className="text-3xl font-black uppercase tracking-tighter">404: Order Not Found</h2>
        <p className="text-gray-500 my-4 max-w-xs mx-auto font-medium">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 mx-auto bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-red-600 transition-all"
        >
          <ArrowLeft size={16}/> Back to Shop
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-2 font-bold uppercase text-xs tracking-widest hover:text-red-600 transition-colors">
          <ArrowLeft size={14}/> Back to Store
        </button>

        {/* HEADER */}
        <div className="bg-white border-2 border-black p-6 md:p-10 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest">
                  {order.orderStatus}
                </span>
                <span className="text-gray-400 font-bold text-xs">/ PLACED {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Track Order</h1>
              <p className="text-gray-500 font-mono text-sm mt-2 font-bold underline">ID: {order._id}</p>
            </div>
            <div className="text-left md:text-right">
                <p className="text-xs font-black text-gray-400 uppercase">Estimated Total</p>
                <p className="text-4xl font-black text-black">${order.totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* STEPPER */}
        <div className="bg-white border-2 border-black p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
          <div className="relative flex justify-between items-center max-w-3xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />
            <div 
                className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 transition-all duration-1000 ease-out"
                style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentIdx;
              const isCurrent = index === currentIdx;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500
                    ${isActive ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-300'}
                    ${isCurrent ? 'ring-4 ring-red-100 scale-110' : ''}`}>
                    {isActive && index < currentIdx ? <Check size={28} strokeWidth={4} /> : <Icon size={24} />}
                  </div>
                  <div className="absolute -bottom-8 w-24 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-tighter leading-none ${isActive ? 'text-black' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
               <Package size={20} className="text-red-600"/>
               <h3 className="text-xl font-black uppercase tracking-tighter">Your Package</h3>
            </div>
            
            {order.items.map((item, i) => (
              <div key={i} className="group flex items-center justify-between p-4 bg-white border-2 border-black hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                    <img 
                       src={item.image.startsWith('http') ? item.image : `https://shopping-store-blond-one.vercel.app${item.image}`}
                       alt={item.name}
                       className="w-full h-full object-contain p-2"
                       onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image" }}
                    />
                    <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-black px-1.5 py-0.5">
                        x{item.quantity}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-lg uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">{item.name}</h4>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-400 tracking-widest">${item.price} PER UNIT</p>
                        {item.discount && <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">{item.discount}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-xl font-black tracking-tighter">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-6">
             <div className="bg-black text-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                    <MapPin size={18} className="text-red-500"/>
                    <h3 className="font-black uppercase tracking-widest text-sm">Delivery Address</h3>
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-black uppercase text-red-500">{order.billingInfo.name}</p>
                    <p className="text-sm font-bold text-gray-300">{order.billingInfo.address}</p>
                    <p className="text-sm font-black uppercase italic">{order.billingInfo.city}, {order.billingInfo.zipcode}</p>
                </div>
             </div>

             <div className="bg-white p-6 border-2 border-black">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-[.2em]">Payment Summary</p>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase">Method</span>
                    <span className="text-xs font-black uppercase bg-gray-100 px-2 py-1">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                    <span className="text-sm font-black uppercase">Final Total</span>
                    <span className="text-2xl font-black text-black">${order.totalPrice}</span>
                </div>
             </div>
          </div>
        </div>
<div className="mt-6">
               {canCancel ? (
                 <button
                   onClick={handleCancelOrder}
                   disabled={isCancelling}
                   className={`w-full py-4 border-2 border-black font-black uppercase tracking-widest transition-all
                     ${isCancelling 
                        ? 'bg-gray-200 cursor-not-allowed' 
                        : 'bg-white text-red-600 hover:bg-red-600 hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1'
                     }`}
                 >
                   {isCancelling ? 'Processing...' : 'Cancel Order'}
                 </button>
               ) : (
                 <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-400 text-center">
                    <p className="text-[10px] font-black uppercase text-gray-500">
                        {order?.orderStatus === 'cancelled' 
                          ? 'This order is already cancelled' 
                          : 'Cancellation unavailable for shipped items'}
                    </p>
                 </div>
               )}
               <p className="text-[9px] text-gray-400 mt-2 text-center uppercase font-bold">
                 * Orders cannot be cancelled once they are in the 'Shipped' stage.
               </p>
             </div>
        
      </div>
    </div>
  );
};

export default OrderTracking;