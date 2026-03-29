import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, DollarSign, AlertCircle, 
  CheckCircle2, ShoppingBag, Loader2 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);

  const [billing, setBilling] = useState({
    name: "", company: "", address: "", apartment: "",
    city: "", phone: "", email: "", zipcode: "",
  });

  // --- 1. Optimized Calculations ---
  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), 
  [cartItems]);

  const isFormComplete = useMemo(() => 
    ["name", "address", "city", "phone", "email", "zipcode"].every(
      (f) => (billing as any)[f]?.trim() !== ""
    ), 
  [billing]);

  // --- 2. Global UI Reset ---
  const resetGlobalCartUI = useCallback(() => {
    localStorage.setItem("cartCount", "0");
    window.dispatchEvent(new Event("cartUpdated"));
    setCartItems([]);
  }, []);

  // --- 3. Database Cart Clear ---
  const clearDatabaseCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    try {
     // Change from ?userId= to /${userId}
await fetch(`https://shoppingstore-backend.vercel.app/api/cart/clear/${userId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
      resetGlobalCartUI();
    } catch (err) {
      console.error("Clear Cart Error:", err);
    }
  }, [resetGlobalCartUI]);

  // --- 4. Fetch Cart on Load ---
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return navigate("/login");

        const res = await fetch(`https://shoppingstore-backend.vercel.app/api/cart/showcart/?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (err) {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  // --- 5. Separate Logic: Cash on Delivery ---
  const handleCODOrder = async (orderData: any, token: string, loadId: string) => {
    try {
      const res = await fetch(`https://shoppingstore-backend.vercel.app/api/orders/cod`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        // First clear database, then show success, then navigate
        await clearDatabaseCart(); 
        toast.success("Order Placed Successfully!", { id: loadId });
      // We use a slightly longer delay to ensure the state updates finish
      setTimeout(() => {
        console.log("Navigating to tracking...");
        navigate("/orderTracking");
      }, 2000);
      } else {
        throw new Error("COD failed");
      }
    } catch (err) {
      toast.error("Could not process COD. Try again.", { id: loadId });
      setIsProcessing(false);
    }
  };

  // --- 6. Separate Logic: Online Payment ---
  const handleOnlineOrder = async (orderData: any, token: string, loadId: string) => {
    try {
      const res = await fetch(`https://shoppingstore-backend.vercel.app/api/orders/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Redirecting to Secure Payment...", { id: loadId });
        if (data.url) window.location.href = data.url;
      } else {
        throw new Error("Online payment session failed");
      }
    } catch (err) {
      toast.error("Payment redirect failed. Try again.", { id: loadId });
      setIsProcessing(false);
    }
  };

  // --- 7. Main Execution Flow ---
  const executeOrderAPI = useCallback(async () => {
    setIsProcessing(true);
    const loadId = toast.loading("Finalizing your order...");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const orderData = {
      items: cartItems.map((item) => ({
        productId: item.productId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      billingInfo: { ...billing, saveInfo },
      totalPrice: subtotal,
      userId,
      paymentMethod,
    };

    if (paymentMethod === "cod") {
      await handleCODOrder(orderData, token!, loadId);
    } else {
      await handleOnlineOrder(orderData, token!, loadId);
    }
  }, [cartItems, billing, saveInfo, subtotal, paymentMethod, clearDatabaseCart]);

 const handlePlaceOrder = () => {
  // 1. Check if form is incomplete OR if we are already processing
  // This || operator prevents the function from running a second time
  if (!isFormComplete || isProcessing) {
    if (!isFormComplete) toast.error("Please fill all shipping details.");
    return; // Stop here
  }

  toast((t) => (
    <div className="flex flex-col gap-3 p-1">
      <p className="font-bold text-gray-800">Confirm purchase of ${subtotal}?</p>
      <div className="flex gap-2">
        <button 
          onClick={() => { 
            toast.dismiss(t.id); 
            // Double check inside the click too
            if (!isProcessing) executeOrderAPI(); 
          }} 
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
        >
          Confirm
        </button>
        <button 
          onClick={() => toast.dismiss(t.id)} 
          className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!loading && cartItems.length === 0 && !isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white animate-in fade-in duration-500">
        <ShoppingBag size={60} className="text-gray-100 mb-4" />
        <h2 className="text-xl font-bold text-gray-300">Your cart is empty</h2>
        <button onClick={() => navigate("/home")} className="mt-4 text-blue-600 font-bold hover:underline">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 md:px-12 py-10 text-gray-900 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
          <p className="text-gray-500 text-sm mt-1">Review your items and provide shipping details.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-gray-700">Shipping Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(billing).map((key) => (
                  <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">{key}</label>
                    <input
                      type="text"
                      name={key}
                      value={(billing as any)[key]}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setSaveInfo(!saveInfo)}>
                 <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${saveInfo ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                    {saveInfo && <CheckCircle2 size={14} className="text-white" />}
                 </div>
                 <span className="text-xs font-bold text-gray-600">Save this information for faster checkout next time</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 sticky top-10">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center group">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 p-1 group-hover:scale-105 transition-transform">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] font-medium text-gray-400">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-black text-blue-600">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-t border-gray-50">
                <div className="flex justify-between text-sm text-gray-500 font-medium"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-sm text-green-600 font-bold"><span>Shipping</span><span>Free</span></div>
                <div className="flex justify-between text-2xl font-black pt-2 text-gray-900"><span>Total</span><span>${subtotal}</span></div>
              </div>

              <div className="mt-6 space-y-3">
                 <button onClick={() => setPaymentMethod('bank')} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-50 bg-gray-50 hover:bg-gray-100'}`}>
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${paymentMethod === 'bank' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}><CreditCard size={16}/></div>
                     <span className={`text-sm font-bold ${paymentMethod === 'bank' ? 'text-blue-900' : 'text-gray-500'}`}>Online Payment</span>
                   </div>
                   {paymentMethod === 'bank' && <div className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
                 </button>

                 <button onClick={() => setPaymentMethod('cod')} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-50 bg-gray-50 hover:bg-gray-100'}`}>
                   <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${paymentMethod === 'cod' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 shadow-sm'}`}><DollarSign size={16}/></div>
                     <span className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-blue-900' : 'text-gray-500'}`}>Cash on Delivery</span>
                   </div>
                   {paymentMethod === 'cod' && <div className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
                 </button>
              </div>

              <button
                disabled={isProcessing}
                onClick={handlePlaceOrder}
                className={`w-full mt-8 py-4 rounded-2xl font-black text-sm text-white transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-blue-600 hover:shadow-lg active:scale-95'}`}
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : "COMPLETE PURCHASE"}
              </button>
              
              <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <p className="text-[10px] leading-relaxed text-amber-800 font-bold uppercase">
                  Orders cannot be cancelled once shipping process begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F3F4F6; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E5E7EB; }
      `}</style>
    </div>
  );
};

export default Checkout;