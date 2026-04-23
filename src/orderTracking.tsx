// src/orderTracking.tsx
import React, { useEffect, useState, useCallback, useRef, useTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, MapPin, Info, RefreshCw, Copy, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import axiosInstance from './api/axiosInstance';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface OrderItem {

  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderData {
  orderId: string;        // ✅ add this
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
  // ✅ read orderId from location state — not from URL params
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = (location.state as any)?.orderId as string | undefined;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const orderStatusRef = useRef<string | null>(null);

  // ✅ copy order ID to clipboard
  const handleCopyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId ?? order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const fetchOrder = useCallback(async (isSilent = false) => {
    if (!orderId) return;
    try {
      if (!isSilent) setLoading(true);
      const { data } = await axiosInstance.get(`/orders/track/${orderId}`);
      const newOrder = data.order || data;

      startTransition(() => {
        if (
          orderStatusRef.current &&
          orderStatusRef.current !== 'cancelled' &&
          newOrder.orderStatus === 'cancelled'
        ) {
          Swal.fire({
            title: 'REQUEST ACCEPTED',
            text: 'Your order has been cancelled. Redirecting...',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
          });
          setTimeout(() => navigate('/'), 3000);
        }
        orderStatusRef.current = newOrder.orderStatus;
        setOrder(newOrder);
      });
    } catch (err) {
      console.error('Order tracking error:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [orderId, navigate]);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    fetchOrder();
    const interval = setInterval(() => fetchOrder(true), 5000);
    return () => clearInterval(interval);
  }, [fetchOrder, orderId, navigate]);

  const handleCancelOrder = async () => {
    const { value: reason } = await Swal.fire({
      title: 'CANCEL ORDER',
      input: 'select',
      inputOptions: {
        'Changed my mind': 'Changed my mind',
        'Ordered by mistake': 'Ordered by mistake',
        'Other': 'Other',
      },
      showCancelButton: true,
      confirmButtonColor: '#000',
    });

    if (reason) {
      startTransition(async () => {
        try {
          const res = await axiosInstance.post(
            `/ordercancel/${orderId}/cancel`,
            { reason, additionalNotes: 'Requested via Tracking Page' }
          );
          if (res.status === 200 || res.status === 201) {
            Swal.fire('REQUEST SENT', 'Admin is reviewing your request.', 'success');
            fetchOrder(true);
          }
        } catch (err: any) {
          Swal.fire('ERROR', err.response?.data?.message || 'Action failed', 'error');
        }
      });
    }
  };

  if (loading && !order) return (
    <div className="h-screen flex flex-col items-center justify-center font-black uppercase">
      <RefreshCw className="animate-spin mb-2" /> Loading...
    </div>
  );

  if (!order) return (
    <div className="h-screen flex items-center justify-center font-black uppercase">
      Order Not Found
    </div>
  );

  const steps = [
    { id: 'processing', label: 'Processing', icon: Clock },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ];
  const currentIdx = steps.findIndex(s => s.id === order.orderStatus);

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="bg-white border-2 border-black p-8 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black px-2 py-0.5 uppercase tracking-widest ${order.orderStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-black text-white'
                }`}>
                {order.orderStatus}
              </span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">
              Track Order
            </h1>


            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Order ID:
              </span>
              {/* ✅ show custom orderId not MongoDB _id */}
              <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {order.orderId ?? order._id}
              </span>
              <button onClick={handleCopyId} className="text-gray-400 hover:text-black transition" title="Copy">
                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-black text-black">${order.totalPrice.toFixed(2)}</p>
            <p className="text-xs font-bold text-gray-400 uppercase mt-1">{order.paymentMethod}</p>
          </div>
        </div>

        {/* ── Stepper ───────────────────────────────────────────────── */}
        <div className="bg-white border-2 border-black p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-black" />
          <div className="relative max-w-2xl mx-auto py-4">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -translate-y-[180%] md:-translate-y-[210%]">
              <div
                className="h-full bg-black transition-all duration-1000 ease-in-out"
                style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentIdx;
                const isCurrent = index === currentIdx;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-700
                      ${isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-200 border-gray-100'}
                      ${isCurrent ? 'ring-4 ring-gray-100 scale-110 animate-pulse' : ''}`}
                    >
                      <Icon size={24} />
                    </div>
                    <p className={`text-[10px] font-black uppercase mt-3 tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Items + Sidebar ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-widest text-sm mb-4">Items in Package</h3>
            {order.items.map((item, i) => (
              <div key={i} className="bg-white border-2 border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 border border-gray-100 p-2 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">QTY: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-black text-lg">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-black text-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
              <h3 className="font-black uppercase text-xs mb-3 flex items-center gap-2 tracking-[0.2em] border-b border-gray-800 pb-2 text-red-600">
                <MapPin size={14} /> Delivery To
              </h3>
              <p className="text-sm font-black uppercase text-white">{order.billingInfo.name}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{order.billingInfo.address}</p>
              <p className="text-xs text-gray-400">{order.billingInfo.city}, {order.billingInfo.zipcode}</p>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {order.cancellationRequested && order.orderStatus !== 'cancelled' ? (
                <div className="bg-[#FFFDF2] p-5 border-l-4 border-[#EAB308]">
                  <div className="flex items-center gap-2 text-[#854D0E] mb-2 font-black uppercase text-xs">
                    <Info size={18} className="animate-pulse" /> Request Under Review
                  </div>
                </div>
              ) : order.orderStatus === 'cancelled' ? (
                <div className="text-center p-6 bg-green-50 border-2 border-dashed border-green-600">
                  <p className="text-[10px] font-black uppercase text-green-600">Request Approved & Cancelled</p>
                </div>
              ) : order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? (
                <button disabled className="w-full py-4 border-2 border-gray-200 bg-gray-50 text-gray-300 font-black uppercase cursor-not-allowed">
                  Cancellation Locked ({order.orderStatus})
                </button>
              ) : (
                <button
                  onClick={handleCancelOrder}
                  disabled={isPending}
                  className="w-full py-4 border-2 border-black bg-white text-red-600 font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                >
                  {isPending ? 'Processing...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;