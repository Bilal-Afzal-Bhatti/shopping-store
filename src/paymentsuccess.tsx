import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnim from "./assets/success.json";
import toast from "react-hot-toast";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
// --- ADD THIS HELPER ---
  const resetLocalCartIcon = () => {
    localStorage.setItem("cartCount", "0");
    // This triggers the listener in your Navbar/Header to update the UI
    window.dispatchEvent(new Event("cartUpdated"));
  };
  const updatePaymentStatus = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token"); // Good to have for headers

    if (!sessionId || !userId) {
      setIsProcessing(false);
      return;
    }

    try {
      const res = await fetch("https://shoppingstore-backend.vercel.app/api/orders/update-payment", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ session_id: sessionId, userId }),
      });

      if (res.ok) {
        resetLocalCartIcon();
        const data = await res.json();
        const orderId = data.order?._id; // Get ID from your backend response

        toast.success("Payment Verified!");
        
        // 🚀 Redirect to the Tracking Page after a short delay
        if (orderId) {
          setTimeout(() => navigate(`/orderTracking/${orderId}`), 3000);
        }
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error("Payment Update Error:", err);
      toast.error("There was a sync issue. Contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    updatePaymentStatus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0FDF4]">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center border border-emerald-50">
        <div className="w-48 h-48 mx-auto">
          <Lottie animationData={successAnim} loop={false} />
        </div>

        <h1 className="text-3xl font-black text-emerald-800 mt-6">
          {isProcessing ? "Verifying Payment..." : "Payment Successful 🎉"}
        </h1>
        
        <p className="text-gray-500 mt-3 font-medium">
          {isProcessing 
            ? "Hang tight! We're securing your order details." 
            : "Thank you! Your order has been placed and is now being processed."}
        </p>

        {!isProcessing && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
               <p className="text-emerald-800 text-sm font-bold uppercase tracking-widest">Order Status: Processing</p>
            </div>
            
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 text-sm font-bold text-emerald-700 hover:underline"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;