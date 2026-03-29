import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, Clock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // FIXED: Changed type to any to avoid NodeJS namespace error
  const timerRef = useRef<any>(null);

  const [billing, setBilling] = useState({
    name: "", company: "", address: "", apartment: "",
    city: "", phone: "", email: "", zipcode: "",
  });

  // Helper to sync Navbar
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
  const isFormComplete = ["name", "address", "city", "phone", "email"].every(f => (billing as any)[f]?.trim() !== "");

  const handlePlaceOrder = () => {
    if (!isFormComplete) {
      toast.error("Please fill all required billing fields.");
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
          Order will be placed in 20 seconds. <br/> This is your **one chance** to cancel.
        </p>
        <button
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            toast.dismiss(t.id);
            setIsProcessing(false);
            toast.error("Shopping Cancelled!", { icon: "🛑" });
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md"
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
    const loadId = toast.loading("Finalizing with Server...");

    const orderData = {
      items: cartItems.map((item) => ({
        productId: String(item.productId || item._id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      billingInfo: billing,
      totalPrice: subtotal,
      userId,
      paymentMethod,
    };

    try {
      if (paymentMethod === "cod") {
        const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(orderData),
        });
        if (res.ok) {
          toast.success("Order Confirmed!", { id: loadId });
          resetGlobalCartUI();
          setCartItems([]);
          navigate("/orderTracking");
        }
      } else {
        const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (data.url) {
          resetGlobalCartUI();
          window.location.href = data.url;
        }
      }
    } catch (err) {
      toast.error("Network Error.", { id: loadId });
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBilling(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-20 py-16 text-gray-800">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-10">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm space-y-5">
          <h2 className="text-xl font-semibold border-b pb-4">Billing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {Object.keys(billing).map((key) => (
              <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={(billing as any)[key]}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="font-bold text-lg mb-4">Summary</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center text-sm">
                <span>{item.name} (x{item.quantity})</span>
                <span className="font-bold">${item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 text-xl font-black flex justify-between">
            <span>Total</span>
            <span>${subtotal}</span>
          </div>

          <div className="mt-8 space-y-3">
             <button 
              onClick={() => setPaymentMethod('bank')}
              className={`w-full flex items-center gap-3 p-4 border rounded-xl ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50' : ''}`}
             >
               <CreditCard size={18} /> Online Payment
             </button>
             <button 
              onClick={() => setPaymentMethod('cod')}
              className={`w-full flex items-center gap-3 p-4 border rounded-xl ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : ''}`}
             >
               <DollarSign size={18} /> Cash on Delivery
             </button>
          </div>

          <button
            disabled={isProcessing}
            onClick={handlePlaceOrder}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-white ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isProcessing ? "PLEASE WAIT..." : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;