import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {  Truck, Clock, ShieldCheck, MapPin,  ArrowLeft, Info } from 'lucide-react';
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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`https://shoppingstore-backend.vercel.app/api/orders/track/${id}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error("Order not found");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: 'CANCEL THIS ORDER?',
      text: "Our team will review your request shortly.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'CONFIRM CANCELLATION',
      customClass: { popup: 'border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' }
    });

    if (result.isConfirmed) {
      try {
        setIsCancelling(true);
        const res = await axios.post(
          `https://shoppingstore-backend.vercel.app/api/ordercancel/${id}/cancel`,
          { reason: "Customer requested via tracking page" },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        if (res.status === 201) {
          await Swal.fire({
            title: 'REQUEST SENT',
            text: 'Admin is reviewing your request.',
            icon: 'success',
            confirmButtonColor: '#000'
          });
          // Industrial UX: Update state without reloading page
          setOrder(prev => prev ? { ...prev, orderStatus: 'processing' } : null);
        }
      } catch (err: any) {
        Swal.fire('ERROR', err.response?.data?.message || 'Action failed', 'error');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;
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
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 font-black uppercase text-xs tracking-widest"><ArrowLeft size={14}/> Back</button>

        {/* ORDER HEADER */}
        <div className="bg-white border-2 border-black p-8 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Order Status</h1>
            <p className="font-mono text-sm underline mt-1">REF: {order._id}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">${order.totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* STEPPER UI */}
        <div className="bg-white border-2 border-black p-10 mb-8 relative">
          <div className="flex justify-between items-center relative z-10">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${index <= currentIdx ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'}`}>
                  <step.icon size={24} />
                </div>
                <p className="text-[10px] font-black uppercase mt-2 tracking-widest">{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="bg-white border-2 border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt="" className="w-16 h-16 object-contain" />
                  <div>
                    <p className="font-black uppercase">{item.name}</p>
                    <p className="text-xs font-bold text-gray-400">QTY: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-black">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-black text-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
              <h3 className="font-black uppercase text-sm mb-2 flex items-center gap-2"><MapPin size={16} /> Address</h3>
              <p className="text-xs text-gray-400 uppercase">{order.billingInfo.name}</p>
              <p className="text-xs text-gray-400">{order.billingInfo.address}</p>
            </div>

            {/* CANCELLATION LOGIC BOX */}
            <div className="bg-white border-2 border-black p-6">
              {order.orderStatus === 'processing' ? (
                <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
                  <p className="text-[10px] font-black uppercase flex items-center gap-2 text-yellow-700">
                    <Info size={14}/> Request Under Review
                  </p>
                  <p className="text-[11px] font-bold text-gray-600 mt-1 leading-tight">
                    You have requested a cancellation. An admin is currently verifying if your package has been shipped.
                  </p>
                </div>
              ) : !['shipped', 'delivered', 'cancelled'].includes(order.orderStatus) ? (
                <button 
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full py-4 border-2 border-black bg-white text-red-600 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                >
                  {isCancelling ? 'PROCESSING...' : 'CANCEL ORDER'}
                </button>
              ) : (
                <div className="text-center p-4 bg-gray-100 border-2 border-dashed border-gray-300">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    {order.orderStatus === 'cancelled' ? 'Successfully Cancelled' : 'Order in Transit'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;