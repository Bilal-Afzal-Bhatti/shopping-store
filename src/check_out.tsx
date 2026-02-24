import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

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
    saveInfo: false,
  });
  const [, setStripe] = useState<any>(null);

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
          `https://shoppingstore-backend.vercel.app/api/cart/showcart/?userId=${userId}`,     //192.168.18.40
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

  const handlePlaceOrder = async () => {
  if (!isFormComplete) {
    alert("Please fill all required fields.");
    return;
  }

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    alert("Please login first!");
    return navigate("/login");
  }

  const orderData = {
    items: cartItems.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    billingInfo: billing, // ✅ directly use billing state
    totalPrice: total,
    userId,
  };

  if (paymentMethod === "cod") {
    // ✅ CASH ON DELIVERY
    const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/cod", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Order placed with Cash on Delivery!");
      navigate("/");
    } else {
      alert("❌ Failed: " + data.message);
    }
  } else {
    // 💳 STRIPE PAYMENT
    try {
      console.log("Initiating Stripe payment...");
      const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url; // ✅ direct redirect to Stripe checkout
      } else {
        alert("❌ Stripe session creation failed.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Payment failed. Try again later.");
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
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-18 object-cover rounded-md" />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="font-semibold">${item.price * item.quantity}</div>
            </div>
          ))}

          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="flex justify-between text-lg font-semibold py-2">
            <span>Total</span>
            <span>${total}</span>
          </div>

          {/* Payment Method */}
          <div className="mt-4">
            <p className="font-medium mb-2">Payment Method</p>
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
              />
              <CreditCard size={16} /> Bank Card (VISA/MC)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
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
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
