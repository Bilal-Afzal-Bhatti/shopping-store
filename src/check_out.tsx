// src/check_out.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, ShoppingBag, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './redux/store';
import { fetchCart, clearCartAsync } from './redux/slices/cartSlice';
import axiosInstance from './api/axiosInstance'; // ✅ added

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { items: cartItems, totalPrice, loading, synced } = useSelector((s: RootState) => s.cart);

  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod'>('bank');
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [saveInfo,      setSaveInfo]      = useState(false);
  const [billing, setBilling] = useState({
    name: '', company: '', address: '', apartment: '',
    city: '', phone: '', email: '', zipcode: '',
  });

  useEffect(() => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { navigate('/login'); return; }
    if (!synced) dispatch(fetchCart());
  }, []);

  const isFormComplete = useMemo(() =>
    ['name', 'address', 'city', 'phone', 'email', 'zipcode'].every(
      (f) => (billing as any)[f]?.trim() !== ''
    ), [billing]
  );

  const subtotal = totalPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── COD Order ──────────────────────────────────────────────────────────────
  const handleCODOrder = useCallback(async (loadId: string) => {
    const userId = localStorage.getItem('userId')!;
    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.productId || item._id,
        name:      item.name,
        price:     item.price,
        quantity:  item.quantity,
        image:     item.image,
      })),
      billingInfo:   { ...billing, saveInfo },
      totalPrice:    subtotal,
      userId,
      paymentMethod: 'cod',
    };

    try {
      // ✅ axiosInstance — no hardcoded URL
      const res = await axiosInstance.post('/orders/cod', orderData);

      const orderId = res.data.order?._id || res.data._id;
      if (!orderId) throw new Error('No order ID returned');

      await dispatch(clearCartAsync());
      toast.success('Order Placed Successfully!', { id: loadId });
      // setTimeout(() => navigate(`/orderTracking/${orderId}`), 1500);
    setTimeout(() => navigate('/order/tracking', {
  state: { orderId }
}), 1500);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.', { id: loadId });
      setIsProcessing(false);
    }
  }, [cartItems, billing, saveInfo, subtotal, dispatch, navigate]);

  // ── Online Payment ─────────────────────────────────────────────────────────
  const handleOnlineOrder = useCallback(async (loadId: string) => {
    const userId = localStorage.getItem('userId')!;
    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.productId || item._id,
        name:      item.name,
        price:     item.price,
        quantity:  item.quantity,
        image:     item.image,
      })),
      billingInfo:   { ...billing, saveInfo },
      totalPrice:    subtotal,
      userId,
      paymentMethod: 'bank',
    };

    try {
      // ✅ axiosInstance — no hardcoded URL
      const res = await axiosInstance.post('/orders/create-checkout-session', orderData);

      toast.success('Redirecting to Secure Payment...', { id: loadId });
      if (res.data.url) window.location.href = res.data.url;

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment redirect failed. Try again.', { id: loadId });
      setIsProcessing(false);
    }
  }, [cartItems, billing, saveInfo, subtotal]);

  // ── Execute Order ──────────────────────────────────────────────────────────
  // ✅ token no longer passed as param — axiosInstance interceptor handles it
  const executeOrder = useCallback(async () => {
    setIsProcessing(true);
    const loadId = toast.loading('Finalizing your order...');

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please login.', { id: loadId });
      setIsProcessing(false);
      return;
    }

    if (paymentMethod === 'cod') await handleCODOrder(loadId);
    else                         await handleOnlineOrder(loadId);
  }, [paymentMethod, handleCODOrder, handleOnlineOrder]);

  const handlePlaceOrder = () => {
    if (!isFormComplete || isProcessing) {
      if (!isFormComplete) toast.error('Please fill all shipping details.');
      return;
    }
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-gray-800">Confirm purchase of ${subtotal.toFixed(2)}?</p>
        <div className="flex gap-2">
          <button onClick={() => { toast.dismiss(t.id); if (!isProcessing) executeOrder(); }}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold">
            Confirm
          </button>
          <button onClick={() => toast.dismiss(t.id)}
            className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-bold">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 size={32} className="animate-spin text-gray-400" />
    </div>
  );

  if (!loading && synced && cartItems.length === 0 && !isProcessing) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <ShoppingBag size={60} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-300">Your cart is empty</h2>
      <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold hover:underline">
        Start Shopping
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 md:px-12 py-10 text-gray-900 font-sans">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
          <p className="text-gray-500 text-sm mt-1">Review your items and provide shipping details.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Billing Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">Shipping Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(billing).map((key) => (
                  <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">{key}</label>
                    <input
                      type="text" name={key}
                      value={(billing as any)[key]}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>
              <div
                className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setSaveInfo(!saveInfo)}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${saveInfo ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                  {saveInfo && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <span className="text-xs font-bold text-gray-600">Save this information for faster checkout</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 sticky top-10">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>

              <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-2">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center group">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 p-1 group-hover:scale-105 transition-transform">
                      <img src={item.image} alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56?text=?'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] font-medium text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-black text-blue-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Shipping</span><span>Free</span>
                </div>
                <div className="flex justify-between text-2xl font-black pt-2">
                  <span>Total</span><span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { key: 'bank', label: 'Online Payment', icon: <CreditCard size={16} /> },
                  { key: 'cod',  label: 'Cash on Delivery', icon: <DollarSign size={16} /> },
                ].map((method) => (
                  <button key={method.key}
                    onClick={() => setPaymentMethod(method.key as 'bank' | 'cod')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === method.key
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === method.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                        {method.icon}
                      </div>
                      <span className={`text-sm font-bold ${paymentMethod === method.key ? 'text-blue-900' : 'text-gray-500'}`}>
                        {method.label}
                      </span>
                    </div>
                    {paymentMethod === method.key && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                    )}
                  </button>
                ))}
              </div>

              <button disabled={isProcessing} onClick={handlePlaceOrder}
                className={`w-full mt-8 py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-blue-600 hover:shadow-lg active:scale-95'
                }`}
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 'COMPLETE PURCHASE'}
              </button>

              <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-amber-800 font-bold uppercase">
                  Orders cannot be cancelled once shipping begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;