import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";
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

  const resetGlobalCartUI = () => {
    localStorage.setItem("cartCount", "0");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearDatabaseCart = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`https://shoppingstore-backend.vercel.app/api/cart/clearcart?userId=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to clear backend cart:", err);
      return false;
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
        // ALWAYS clear database first
        await clearDatabaseCart(); 
        resetGlobalCartUI(); 

        if (paymentMethod === "cod") {
          toast.success("Order Placed Successfully!", { id: loadId });
          setCartItems([]); // Clears local view
          // Immediate navigation after clearing
          navigate("/orderTracking");
        } else {
          toast.success("Redirecting to payment...", { id: loadId });
          if (data.url) window.location.href = data.url;
        }
      } else {
        throw new Error(data.message || "Order failed");
      }
    } catch (err) {
      toast.error("Process failed. Try again.", { id: loadId });
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!isFormComplete) return toast.error("Please fill required fields.");
    toast((t) => (
      <div className="text-sm">
        <p className="font-bold mb-2">Confirm Order?</p>
        <div className="flex gap-2">
          <button onClick={() => { toast.dismiss(t.id); executeOrderAPI(); }} className="bg-blue-600 text-white px-3 py-1 rounded">Confirm</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 px-3 py-1 rounded">Cancel</button>
        </div>
      </div>
    ));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  };

  if (!loading && cartItems.length === 0 && !isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <ShoppingBag size={48} className="text-gray-200 mb-4" />
        <h2 className="text-lg font-bold text-gray-400">Your cart is empty</h2>
        <button onClick={() => navigate("/home")} className="mt-4 text-blue-600 font-bold underline">Return Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-10 py-6 text-gray-800">
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2"><Circle size={8} className="fill-blue-600 text-blue-600"/> Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.keys(billing).map((key) => (
                <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">{key}</label>
                  <input
                    type="text"
                    name={key}
                    value={(billing as any)[key]}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder={key}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="font-bold text-md mb-4">Summary</h2>
              <div className="max-h-48 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain p-1" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-black">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-3 border-t border-gray-50 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-2xl font-black border-t pt-2 mt-2"><span>Total</span><span>${subtotal}</span></div>
              </div>

              <div className="mt-4 space-y-2">
                 <button onClick={() => setPaymentMethod('bank')} className={`w-full flex items-center justify-between p-3 rounded-xl border ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                   <span className="text-xs font-bold flex items-center gap-2"><CreditCard size={14}/> Card</span>
                   {paymentMethod === 'bank' && <CheckCircle2 size={14} className="text-blue-600" />}
                 </button>
                 <button onClick={() => setPaymentMethod('cod')} className={`w-full flex items-center justify-between p-3 rounded-xl border ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                   <span className="text-xs font-bold flex items-center gap-2"><DollarSign size={14}/> Cash</span>
                   {paymentMethod === 'cod' && <CheckCircle2 size={14} className="text-blue-600" />}
                 </button>
              </div>

              <button
                disabled={isProcessing}
                onClick={handlePlaceOrder}
                className="w-full mt-6 py-3 rounded-xl font-black text-sm text-white bg-black hover:bg-blue-700 transition-all"
              >
                {isProcessing ? "PROCESSING..." : "CONFIRM ORDER"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;