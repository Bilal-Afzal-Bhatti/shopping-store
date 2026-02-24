// src/pages/PaymentSuccess.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnim from "./assets/success.json"; // ✅ Download from lottiefiles.com

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();


  const updatePaymentStatus = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
   // const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");  

     if (!sessionId || !userId) return;

  await fetch("https://shoppingstore-backend.vercel.app/orders/update-payment", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, userId }),
  });
};

useEffect(() => {
  updatePaymentStatus();
}, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-40 h-40 mx-auto">
          <Lottie animationData={successAnim} loop={false} />
        </div>
        <h1 className="text-3xl font-bold text-emerald-700 mt-4">
          Payment Successful 🎉
        </h1>
        <p className="text-gray-600 mt-2">
          Thank you for your purchase! Your payment has been received.
        </p>

        <div className="mt-6 border-t pt-4">
          <p className="text-gray-700 text-sm">
            <strong>Payment Method:</strong> Stripe
          </p>
          <p className="text-gray-700 text-sm">
            <strong>Status:</strong> Paid ✅
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
