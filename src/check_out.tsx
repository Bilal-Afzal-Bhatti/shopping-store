import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, Clock, Trash2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Timer Reference to allow cancellation
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [billing, setBilling] = useState({
    name: "", company: "", address: "", apartment: "",
    city: "", phone: "", email: "", zipcode: "", saveInfo: false,
  });

  const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXX");

  // Function to force Navbar and LocalStorage to 0
  const resetGlobalCartUI = () => {
    localStorage.setItem("cartCount", "0");
    window.dispatchEvent(new Event("cartUpdated")); // Notifies Navbar
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

  const handlePlaceOrder = () => {
    if (!isFormComplete) {
      toast.error("Please fill all required billing fields.");
      return;
    }

    setIsProcessing(true);

    // 20 Second Toast Timer
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
            toast.error("Shopping Cancelled!", { icon: "🛑", duration: 3000 });
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-transform active:scale-95 shadow-md"
        >
          CANCEL SHOPPING
        </button>
      </div>
    ), { duration: 20000, position: "top-center" });

    // Execute API call after 20 seconds
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
      totalPrice: total,
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
          toast.success("Order Confirmed (COD)!", { id: loadId });
          resetGlobalCartUI(); // Reset Navbar Icon
          setCartItems([]);    // Clear Checkout Screen
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
      toast.error("Network Error. Try again.", { id: loadId });
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Shipping is 0
  const isFormComplete = ["name", "address", "city", "phone", "email"].every(f => (billing as any)[f]?.trim() !== "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBilling(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-400">Loading Checkout...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 md:px-20 py-16 text-gray-800">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-10 text-center md:text-left">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Billing Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm space-y-5">
          <h2 className="text-xl font-semibold border-b pb-4">Billing Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {Object.keys(billing).filter(k => k !== 'saveInfo').map((key) => (
              <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={(billing as any)[key]}
                  onChange={handleChange}
                  placeholder={`Enter ${key}...`}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary & Payment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="font-bold text-lg mb-4">Your Order</h2>
            <div className="max-h-[300px] overflow-y-auto space-y-4 mb-6 pr-2">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-4 items-center">
                  <img src={item.image} className="w-16 h-16 object-cover rounded-lg" alt={item.name} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal}</span></div>
              <div className="flex justify-between text-green-600 font-medium"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-xl font-black pt-2 border-t mt-2"><span>Total</span><span>${total}</span></div>
            </div>

            {/* Payment Selection */}
            <div className="mt-8 space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="hidden" />
                <CreditCard className={paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-400'} />
                <span className="font-medium text-sm">Online Card (Stripe)</span>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                <DollarSign className={paymentMethod === 'cod' ? 'text-blue-600' : 'text-gray-400'} />
                <span className="font-medium text-sm">Cash on Delivery</span>
              </label>
            </div>

            <button
              disabled={isProcessing || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
            >
              {isProcessing ? "WAITING FOR TIMER..." : "PLACE ORDER NOW"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;