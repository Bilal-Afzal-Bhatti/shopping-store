import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck, Clock, ShieldCheck, MapPin, ArrowLeft, Info, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface OrderItem {
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  cancellationRequested: boolean;
  _id: string;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalPrice: number;
  items: OrderItem[];
  billingInfo: { name: string; address: string; city: string; zipcode: string; };
  createdAt: string;
  paymentMethod: string;
}

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // 1. Memoized fetch function for initial load and polling
  const fetchOrder = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const { data } = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/track/${id}`);
      const newOrder = data.order || data;

      // Logic: Show toast if the admin manually approved it while the user was watching
      if (order && order.orderStatus === 'processing' && newOrder.orderStatus === 'cancelled') {
        Swal.fire({
          title: 'CANCELLATION APPROVED',
          text: 'The admin has approved your request. Your refund is being processed.',
          icon: 'success',
          confirmButtonColor: '#000'
        });
      }

      setOrder(newOrder);
    } catch (err) {
      console.error("Order tracking error:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [id, order]);

  // 2. Initial Fetch + Polling (Checks every 30 seconds for manual DB changes)
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => fetchOrder(true), 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
  // 1. User selects reason (Matches Backend Enum)
  const { value: reason } = await Swal.fire({
    title: 'CANCEL ORDER',
    text: 'Please select a reason for cancellation:',
    input: 'select',
    inputOptions: {
      'Changed my mind': 'Changed my mind',
      'Ordered by mistake': 'Ordered by mistake',
      'Found a better price elsewhere': 'Found a better price elsewhere',
      'Delivery time is too long': 'Delivery time is too long',
      'Other': 'Other'
    },
    inputPlaceholder: 'Select a reason',
    showCancelButton: true,
    confirmButtonColor: '#000',
    cancelButtonColor: '#d33',
    customClass: { popup: 'border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' }
  });

  if (reason) {
    try {
      setIsCancelling(true);
      const res = await axios.post(
        `https://shoppingstore-backend.vercel.app/api/ordercancel/${id}/cancel`,
        {
          reason: reason,
          additionalNotes: "Requested via Tracking Page"
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (res.status === 201) {
        // --- KEEPING YOUR SPECIFIC TOAST ---
        Swal.fire({
          title: 'REQUEST SENT',
          text: 'Admin is reviewing your request.',
          icon: 'success',
          confirmButtonColor: '#000'
        });

        /* 
           🚀 REMOVED: setOrder(prev => ...) 
           We do NOT update the state here. 
           The button will remain visible so the user doesn't see 
           the "Under Review" box until YOU manually approve it in the DB.
        */
      }
    } catch (err: any) {
      Swal.fire('ERROR', err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setIsCancelling(false);
    }
  }
};
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black uppercase">
      <RefreshCw className="animate-spin mb-2" /> Loading Package Info...
    </div>
  );

  if (!order) return <div className="h-screen flex items-center justify-center font-black">ORDER NOT FOUND</div>;

  const steps = [
    { id: 'processing', label: 'Processing', icon: Clock },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ];
  const currentIdx = steps.findIndex(s => s.id === order.orderStatus);

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 font-black uppercase text-xs tracking-widest hover:text-red-600 transition-colors">
          <ArrowLeft size={14} /> Back to Store
        </button>

        {/* ORDER HEADER */}
        <div className="bg-white border-2 border-black p-8 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 uppercase tracking-widest ${order.orderStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                {order.orderStatus}
              </span>
              <span className="text-gray-400 font-bold text-[10px]">/ PLACED {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Track Order</h1>
            <p className="font-mono text-xs underline mt-2 text-gray-500">REF ID: {order._id}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 font-black uppercase text-[10px]">Total Amount</p>
            <p className="text-4xl font-black text-black">${order.totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* STEPPER UI */}
        <div className="bg-white border-2 border-black p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-black"></div>
          <div className="flex justify-between items-center relative z-10 max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentIdx;
              const isCurrent = index === currentIdx;
              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500
                    ${isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-200 border-gray-100'}
                    ${isCurrent ? 'ring-4 ring-gray-100 scale-110' : ''}`}>
                    <Icon size={24} />
                  </div>
                  <p className={`text-[10px] font-black uppercase mt-3 tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>


        {/* ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2"><RefreshCw size={16} /> Items in Package</h3>
          {order.items.map((item, i) => (
            <div key={i} className="bg-white border-2 border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 p-2 shrink-0">
                  <img src={item.image} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-black uppercase text-sm leading-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest mt-1">QTY: {item.quantity} × ${item.price}</p>
                </div>
              </div>
              <p className="font-black text-lg">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-black text-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
            <h3 className="font-black uppercase text-xs mb-3 flex items-center gap-2 tracking-[0.2em] border-b border-gray-800 pb-2">
              <MapPin size={14} className="text-red-600" /> Delivery To
            </h3>
            <p className="text-sm font-black uppercase text-red-600">{order.billingInfo.name}</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed font-bold">{order.billingInfo.address}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">{order.billingInfo.city}, {order.billingInfo.zipcode}</p>
          </div>
          {/* CANCELLATION BOX */}
         {/* 1. Show 'Under Review' ONLY when YOU manually set cancellationRequested to true in DB */}
    {order.cancellationRequested && order.orderStatus !== 'cancelled' ? (
      <div className="bg-[#FFFDF2] p-5 border-l-4 border-[#EAB308]">
        <div className="flex items-center gap-2 text-[#854D0E] mb-2 font-black uppercase text-xs">
          <Info size={18} className="animate-pulse" /> 
          Request Under Review
        </div>
        <p className="text-[11px] font-bold text-gray-600 leading-tight">
          An admin is currently verifying your request.
        </p>
      </div>
    ) : order.orderStatus === 'cancelled' ? (
      /* 2. Success State (Briefly visible before navigation) */
      <div className="text-center p-6 bg-red-50 border-2 border-dashed border-red-200">
        <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">
          Request Accepted - Redirecting...
        </p>
      </div>
    ) : (
      /* 3. DEFAULT: Show button while orderStatus is 'processing' */
      <button 
        onClick={handleCancelOrder}
        disabled={isCancelling}
        className="w-full py-4 border-2 border-black bg-white text-red-600 font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        {isCancelling ? 'SENDING...' : 'Cancel Order'}
      </button>
    )}
  </div>

      </div>
    </div>

  );
};

export default OrderTracking;