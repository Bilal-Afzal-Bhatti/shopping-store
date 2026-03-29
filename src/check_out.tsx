import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast"; // Added for professional notifications

const Checkout: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");

  const [billing, setBilling] = useState({
    name: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    phone: "",
    email: "",
    zipcode: "",
    saveInfo: false,
  });
  
  // Fixed the 'unused' warning by using it in initialization
  const [stripe, setStripe] = useState<any>(null);
  const stripePromise = loadStripe("pk_test_XXXXXXXXXXXXXXXXXXXX");

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
    };
    initializeStripe();
  }, []);

  // Fetch user cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) return navigate("/login");

        const res = await fetch(
          `https://shoppingstore-backend.vercel.app/api/cart/showcart/?userId=${userId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = await res.json();
        setCartItems(data.items || []);
      } catch (err) {
        console.error("Fetch cart error:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBilling((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const requiredFields = ["name", "address", "city", "phone", "email"];
  const isFormComplete = requiredFields.every(
    (field) => (billing as any)[field]?.trim() !== ""
  );

  // Helper function to clear cart
  const clearUserCart = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    await fetch(`https://shoppingstore-backend.vercel.app/api/cart/clear/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handlePlaceOrder = async () => {
    if (!isFormComplete) {
      toast.error("Please fill all required fields.");
      return;
    }

    // ⚠️ Cancellation Policy Alert
    const confirmMsg = paymentMethod === "bank"
      ? "Policy: Once paid via Stripe, orders cannot be cancelled or returned. Proceed to payment?"
      : "Policy: For COD, you can only cancel while status is 'Processing'. Once 'Shipped', the order is final and your cart will be cleared. Proceed?";

    if (!window.confirm(confirmMsg)) return;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Please login first!");
      return navigate("/login");
    }

    const orderData = {
      items: cartItems.map((item) => ({
        productId: String(item.productId || item._id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        discount: item.discount || ""
      })),
      billingInfo: billing,
      totalPrice: total,
      userId,
      paymentMethod,
    };

    const loadId = toast.loading("Processing Order...");

    if (paymentMethod === "cod") {
      try {
        const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/cod", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await res.json();
        if (res.ok && data.order?._id) {
          toast.success("Order Placed! Move to history once shipped.", { id: loadId, duration: 4000 });
          setTimeout(() => navigate(`/orderTracking/${data.order._id}`), 1000);
        } else {
          toast.error("Failed to place order.", { id: loadId });
        }
      } catch (err) {
        toast.error("Connection error.", { id: loadId });
      }
    } else {
      // 💳 STRIPE LOGIC
      try {
        const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          // Stripe: Clear immediately because it's non-reversible
          await clearUserCart();
          toast.success("Redirecting to Secure Payment...", { id: loadId });
          window.location.href = data.url;
        } else {
          toast.error("Stripe session failed.", { id: loadId });
        }
      } catch (error) {
        toast.error("Payment connection error.", { id: loadId });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 md:px-20 py-16 text-gray-800">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-2xl font-semibold mb-8">Billing Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Billing Form */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { label: "Full Name", name: "name" },
            { label: "Company Name", name: "company" },
            { label: "Street Address", name: "address" },
            { label: "Apartment (Optional)", name: "apartment" },
            { label: "Town/City", name: "city" },
            { label: "Phone Number", name: "phone" },
            { label: "Email Address", name: "email", type: "email" },
            { label: "Zip Code", name: "zipcode", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={(billing as any)[field.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="saveInfo"
              checked={billing.saveInfo}
              disabled={!isFormComplete}
              onChange={handleChange}
              className="mr-2"
            />
            <span className={`text-sm ${!isFormComplete ? "text-gray-400" : ""}`}>
              Save this info for next time
            </span>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 h-fit shadow-sm space-y-4">
          {/* Cancellation Warning Banner */}
          <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-[12px] text-amber-800 mb-2">
            <AlertCircle size={16} className="shrink-0" />
            <p>Note: Stripe orders are final. COD orders clear cart only after admin ships them to history.</p>
          </div>

          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center gap-4">
              {/* IMAGE FIX: using aspect-square and object-contain to show full image */}
              <div className="w-20 h-20 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain p-1" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="font-semibold text-sm">${item.price * item.quantity}</div>
            </div>
          ))}

          <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2 text-sm">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-lg font-semibold py-2">
            <span>Total</span>
            <span>${total}</span>
          </div>

          {/* Payment Method */}
          <div className="mt-4">
            <p className="font-medium mb-2 text-sm">Payment Method</p>
            <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
              />
              <CreditCard size={16} /> Bank Card (Stripe)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <DollarSign size={16} /> Cash on Delivery
            </label>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            Confirm & Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;