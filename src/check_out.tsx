import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, ShoppingBag, Circle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const [isProcessing, setIsProcessing] = useState(false);

  const [billing, setBilling] = useState({
    name: "", company: "", address: "", apartment: "",
    city: "", phone: "", email: "", zipcode: "",
  });
  
  const [saveInfo, setSaveInfo] = useState(false);

  // Sync Navbar UI
  const resetGlobalCartUI = () => {
    localStorage.setItem("cartCount", "0");
    window.dispatchEvent(new Event("cartUpdated"));
  };
const clearDatabaseCart = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  try {
    await fetch(`https://shoppingstore-backend.vercel.app/api/cart/clearcart?userId=${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error("Failed to clear backend cart:", err);
  }
};
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const isFormComplete = ["name", "address", "city", "phone", "email", "zipcode"].every(
    (f) => (billing as any)[f]?.trim() !== ""
  );

  // THE NEW CONFIRMATION TOAST
  const handlePlaceOrder = () => {
    if (!isFormComplete) {
      toast.error("Please fill all required billing fields first.");
      return;
    }

    toast((t) => (
      <div className="flex flex-col p-1 min-w-[280px]">
        <div className="flex items-center gap-3 mb-3 text-blue-700">
          <ShoppingBag size={24} />
          <span className="font-bold text-lg">Confirm Your Order</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Are you sure you want to place this order? 
          <span className="block mt-2 font-bold text-red-500 items-center gap-1">
            <AlertCircle size={14} /> 
            Note: No cancellations once shipping begins.
          </span>
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeOrderAPI();
            }}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-all text-sm"
          >
            CONFIRM
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.error("Order Cancelled");
            }}
            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
          >
            CANCEL
          </button>
        </div>
      </div>
    ), { duration: 6000, position: "top-center", style: { padding: '16px', borderRadius: '16px' } });
  };

 const executeOrderAPI = async () => {
  setIsProcessing(true);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const loadId = toast.loading("Processing your request...");

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

  try {
    const endpoint = paymentMethod === "cod" ? "cod" : "create-checkout-session";
    const res = await fetch(`https://shoppingstore-backend.vercel.app/api/orders/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderData),
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // 1. DELETE THE CART FROM DB IMMEDIATELY
      // This runs for both COD and Bank to ensure database is clean
      await clearDatabaseCart(); 

      // 2. RESET NAVBAR ICON (Sets localStorage to 0 and triggers event)
      resetGlobalCartUI(); 
      
      if (paymentMethod === "cod") {
        // COD SPECIFIC SUCCESS FLOW
        toast.success("Order Placed! Your cart has been cleared.", { id: loadId });
        setCartItems([]); // Clear local UI state
         await clearDatabaseCart();
        // Navigate to tracking after a short delay
        setTimeout(() => {
          navigate("/orderTracking");
        }, 2000);
      } else {
        // BANK/STRIPE FLOW
        toast.success("Redirecting to secure payment...", { id: loadId });
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } else {
      throw new Error(data.message || "Server error");
    }
  } catch (err) {
    toast.error("Failed to process order. Cart remains saved.", { id: loadId });
    setIsProcessing(false);
  }
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBilling(prev => ({ ...prev, [name]: value }));
  };

  // Inside your return, before the main grid
if (!loading && cartItems.length === 0 && !isProcessing) {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <ShoppingBag size={64} className="text-gray-300" />
      <h2 className="text-xl font-bold">Your cart is empty</h2>
      <button 
        onClick={() => navigate("/shop")}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Go Shopping
      </button>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-20 py-10 text-gray-800">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-2">Checkout</h1>
        <p className="text-gray-500 mb-8 font-medium">Complete your details to finish the purchase.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BILLING FORM */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6">1. Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(billing).map((key) => (
                <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={(billing as any)[key]}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder={`Your ${key}...`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-blue-50 rounded-2xl flex items-center gap-4 border border-blue-100">
              <input 
                  type="checkbox" 
                  id="saveInfo"
                  disabled={!isFormComplete} 
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="w-6 h-6 cursor-pointer accent-blue-600"
              />
              <label htmlFor="saveInfo" className={`text-sm font-bold ${!isFormComplete ? 'text-gray-400' : 'text-blue-900 cursor-pointer'}`}>
                Save info for next time
              </label>
              {!isFormComplete && <span className="text-[10px] text-red-500 font-black ml-auto bg-white px-3 py-1 rounded-full border border-red-100">FORM INCOMPLETE</span>}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>
              
              <div className="max-h-64 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center border-b border-gray-50 pb-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-2xl" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate">{item.name}</p>
                      <p className="text-xs font-bold text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-sm text-blue-600">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-dashed">
                <div className="flex justify-between text-gray-500 font-bold"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-green-600 font-bold"><span>Shipping</span><span>FREE</span></div>
                <div className="flex justify-between text-2xl font-black pt-3"><span>Total</span><span>${subtotal}</span></div>
              </div>

              <div className="mt-8 space-y-3">
                 <button onClick={() => setPaymentMethod('bank')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}>
                   <div className="flex items-center gap-3"><CreditCard className={paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-400'} /> <span className="font-bold">Online Card</span></div>
                   {paymentMethod === 'bank' && <CheckCircle2 size={18} className="text-blue-600" />}
                 </button>
                 <button onClick={() => setPaymentMethod('cod')} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}>
                   <div className="flex items-center gap-3"><DollarSign className={paymentMethod === 'cod' ? 'text-blue-600' : 'text-gray-400'} /> <span className="font-bold">Cash Delivery</span></div>
                   {paymentMethod === 'cod' && <CheckCircle2 size={18} className="text-blue-600" />}
                 </button>
              </div>

              <button
                disabled={isProcessing || cartItems.length === 0}
                onClick={handlePlaceOrder}
                className={`w-full mt-8 py-5 rounded-2xl font-black text-white shadow-xl transition-all tracking-widest ${isProcessing ? 'bg-gray-200 cursor-not-allowed' : 'bg-black hover:bg-blue-700'}`}
              >
                {isProcessing ? "PROCESSING..." : "PLACE ORDER"}
              </button>
              
              {/* POLICY MESSAGE */}
              <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                 <AlertCircle className="text-orange-500 shrink-0" size={18} />
                 <p className="text-[11px] font-bold text-orange-800 leading-tight">
                   Once your order is processed and the shipping cycle starts, cancellation is no longer possible. Please verify your details.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Checkout;