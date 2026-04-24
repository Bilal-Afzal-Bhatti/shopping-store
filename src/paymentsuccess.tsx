import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import successAnim from "./assets/success.json";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./redux/store";

import axiosInstance from "./api/axiosInstance";
import { fetchCart } from "./redux/slices/cartSlice";
// import Swal from 'sweetalert2';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isProcessing, setIsProcessing] = useState(true);
  const verificationStarted = useRef(false);

  // // ─── 1. CHROME BACK BUTTON TRAP ──────────────────────────────────────────
  // useEffect(() => {
  //   // Push dummy state to create the history trap
  //   window.history.pushState(null, "", window.location.href);

  //   const handlePopState = () => {
  //     // Re-trap the user
  //     window.history.pushState(null, "", window.location.href);
      
  //     Swal.fire({
  //       title: 'PAYMENT COMPLETED',
  //       text: 'Your order is confirmed. Navigation is restricted during processing.',
  //       icon: 'warning',
  //       confirmButtonColor: '#000',
  //       background: '#fff',
  //       color: '#000'
  //     });
  //   };

  //   window.addEventListener('popstate', handlePopState);
  //   return () => window.removeEventListener('popstate', handlePopState);
  // }, []);

  // ─── 2. VERIFICATION LOGIC ────────────────────────────────────────────────
// PaymentSuccess.tsx
useEffect(() => {
  const verifyPayment = async () => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const params    = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const userId    = localStorage.getItem("userId");

    if (!sessionId || !userId) {
      navigate('/', { replace: true });
      return;
    }

    try {
      const res = await axiosInstance.put('/orders/update-payment', {
        session_id: sessionId,
        userId,
      });

      if (res.data.success) {
        const orderId = res.data.order?._id;

        // ✅ backend already cleared cart in DB
        // just re-fetch so Redux reflects empty cart
        await dispatch(fetchCart());

        // ✅ clear legacy UI counter
        localStorage.setItem("cartCount", "0");
        window.dispatchEvent(new Event("cartUpdated"));

        toast.success("Payment Verified!");
        setIsProcessing(false);

        setTimeout(() => {
          navigate('/order/tracking', {
            state:   { orderId },
            replace: true,
          });
        }, 2000);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Verification failed.");
      setIsProcessing(false);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
  };

  verifyPayment();
}, [dispatch, navigate]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0FDF4] px-4 font-sans">
      <div className="bg-white border-2 border-black p-10 w-full max-w-md text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        {/* ✅ Lottie Animation Container */}
        <div className="w-48 h-48 mx-auto mb-6">
          <Lottie 
            animationData={successAnim} 
            loop={isProcessing} 
            autoplay={true}
          />
        </div>

        <h1 className="text-3xl font-black text-black uppercase tracking-tighter">
          {isProcessing ? "Verifying..." : "Payment Success"}
        </h1>

        <p className="text-gray-500 mt-4 text-xs font-bold uppercase tracking-widest leading-loose">
          {isProcessing
            ? "Syncing with Stripe gateways"
            : "Generating your order tracking profile"}
        </p>

        {isProcessing && (
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-black animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {!isProcessing && (
          <div className="mt-8 animate-bounce">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
              Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;