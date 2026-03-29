import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<any>(null);

  const [billing, setBilling] = useState({
    name: "", company: "", address: "", apartment: "",
    city: "", phone: "", email: "", zipcode: "",
  });
  
  const [saveInfo, setSaveInfo] = useState(false);

  const resetGlobalCartUI = () => {
    localStorage.setItem("cartCount", "0");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return navigate("/login");

        const res = await fetch(`https://shoppingstore-backend.vercel.app/api/cart/showcart/?userId=${userId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
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
  
  // Validation: Checking if required fields are filled
  const isFormComplete = ["name", "address", "city", "phone", "email", "zipcode"].every(
    (f) => (billing as any)[f]?.trim() !== ""
  );

  const handlePlaceOrder = () => {
    if (!isFormComplete) {
      toast.error("Please fill all required billing fields first.");
      return;
    }

    setIsProcessing(true);
    toast((t) => (
      <div className="flex flex-col items-center p-2 gap-3 min-w-[250px]">
        <div className="flex items-center gap-2 font-bold text-blue-600">
          <Clock size={20} className="animate-pulse" />
          Processing Order...
        </div>
        <p className="text-xs text-gray-500 text-center">
          Finalizing in 20s. You can still cancel.
        </p>
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            toast.dismiss(t.id);
            setIsProcessing(false);
            toast.error("Order Cancelled");
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md"
        >
          CANCEL SHOPPING
        </button>
      </div>
    ), { duration: 20000, position: "top-center" });

    timerRef.current = setTimeout(() => {
      executeOrderAPI();
    }, 20000);
  };

  const executeOrderAPI = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const loadId = toast.loading("Sending to server...");

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
        toast.success("Order Successful!", { id: loadId });
        resetGlobalCartUI();
        if (paymentMethod === "bank" && data.url) {
          window.location.href = data.url;
        } else {
          setCartItems([]);
          navigate("/orderTracking");
        }
      }
    } catch (err) {
      toast.error("Network error occurred.", { id: loadId });
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBilling(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-medium">Loading Checkout...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-20 py-10 text-gray-800">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        Checkout Information
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: FORM */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Billing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.keys(billing).map((key) => (
              <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={(billing as any)[key]}
                  onChange={handleChange}
                  placeholder={`Enter ${key}...`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            ))}
          </div>

          {/* SAVE INFO SECTION */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
            <input 
                type="checkbox" 
                id="saveInfo"
                disabled={!isFormComplete} 
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-blue-600 disabled:opacity-30"
            />
            <label htmlFor="saveInfo" className={`text-sm font-medium ${!isFormComplete ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}>
              Save this information for faster checkout next time
            </label>
            {!isFormComplete && <span className="text-[10px] text-red-400 font-bold uppercase ml-auto">Fill fields to enable</span>}
            {isFormComplete && <CheckCircle2 size={18} className="text-green-500 ml-auto" />}
          </div>
        </div>

        {/* RIGHT: SUMMARY & CUSTOM SLIDER */}
        <div className="bg-white p-6 rounded-2xl shadow-xl h-fit border border-gray-100">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          
          {/* CUSTOM ITEM SLIDER AREA */}
          <div className="max-h-80 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
            {cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 items-center bg-gray-50 p-2 rounded-lg">
                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                </div>
                <span className="font-bold text-sm">${item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-semibold">${subtotal}</span></div>
            <div className="flex justify-between text-green-600"><span>Shipping</span><span className="font-bold">FREE</span></div>
            <div className="flex justify-between text-xl font-black border-t pt-3"><span>Total</span><span>${subtotal}</span></div>
          </div>

          <div className="mt-6 space-y-3">
             <button 
              onClick={() => setPaymentMethod('bank')}
              className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-100 hover:bg-gray-50'}`}
             >
               <div className="flex items-center gap-3"><CreditCard size={20} /> <span className="text-sm font-bold">Online Payment</span></div>
               {paymentMethod === 'bank' && <CheckCircle2 size={16} className="text-blue-600" />}
             </button>
             <button 
              onClick={() => setPaymentMethod('cod')}
              className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-100 hover:bg-gray-50'}`}
             >
               <div className="flex items-center gap-3"><DollarSign size={20} /> <span className="text-sm font-bold">Cash on Delivery</span></div>
               {paymentMethod === 'cod' && <CheckCircle2 size={16} className="text-blue-600" />}
             </button>
          </div>

          <button
            disabled={isProcessing || cartItems.length === 0}
            onClick={handlePlaceOrder}
            className={`w-full mt-6 py-4 rounded-xl font-black text-white shadow-lg transition-all ${isProcessing ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {isProcessing ? "SECURELY PROCESSING..." : "COMPLETE ORDER"}
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default Checkout;