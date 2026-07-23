import { useState, useEffect, useRef} from "react";
import { useNavigate, Link } from "react-router-dom";
import Side_image from "./assets/Side_Image.png";

import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from "./api/axiosInstance";
import type { AxiosError } from "axios";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP Verification State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Refs to manage focus shifting across OTP boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Smooth scroll effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 80, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handler: Step 1 Registration (Sends OTP to backend)
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");
    try {
      await axiosInstance.post("/auth/register", { name, email, password });
      // Transition to OTP screen without native alerts
      setShowOtpScreen(true);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(err.response?.data?.message || "Something went wrong. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Handles standard OTP inputs, pastes, and auto-submit
  const handleOtpChange = async (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, ""); // Accept digits only
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Extract latest character
    setOtp(newOtp);
    setOtpError("");

    // Move focus to the next field forward
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Automatically submit once the 6th box (index 5) is entered
    if (index === 5 && newOtp.every((digit) => digit !== "")) {
      await verifyOtpCode(newOtp.join(""));
    }
  };

  // Handler: Handle backspace movements between the OTP blocks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

const verifyOtpCode = async (completeOtp: string) => {
  setLoading(true);
  try {
    // Force conversion of payload data to string
    const payload = { 
      email: email.trim().toLowerCase(), 
      otp: String(completeOtp).trim() 
    };
    
    const res = await axiosInstance.post("/auth/verify-otp", payload);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    setShowSuccessModal(true);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    setOtpError(err.response?.data?.message || "Invalid verification code.");
    setOtp(new Array(6).fill("")); // Reset
    inputRefs.current[0]?.focus(); // Refocus first field
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen animate-in fade-in duration-700">
      
      {/* CUSTOM SUCCESS POPUP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-100 rounded-lg bg-white p-8 text-center shadow-xl animate-in zoom-in duration-300">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Verified!</h3>
            <p className="mt-2 text-sm text-gray-500">Your account has been verified and registered successfully.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-[#DB4444] py-3.5 font-medium text-white rounded hover:bg-red-700 transition-all"
            >
              Continue to Shop
            </button>
          </div>
        </div>
      )}

      {/* Left Image Section */}
      <div className="hidden md:block w-full md:w-[55%] bg-[#CBE4E8]">
        <img src={Side_image} alt="Signup" className="w-full h-full max-h-200 object-contain pt-20" />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-100">
          
          {!showOtpScreen ? (
            /* --- ORIGINAL FORM INTERFACE --- */
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-medium mb-3">Create an account</h1>
                <p className="text-sm">Enter your details below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full border-b py-3 outline-none focus:border-black" 
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full border-b py-3 outline-none focus:border-black" 
                  autoComplete="username"
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full border-b py-3 outline-none focus:border-black" 
                  autoComplete="new-password"
                  required 
                />
                <button 
                  type="submit" 
                  className="w-full bg-[#DB4444] text-white py-4 rounded font-medium hover:bg-red-700 transition-all" 
                  disabled={loading}
                >
                  {loading ? "Sending Code..." : "Create Account"}
                </button>
              </form>

              {/* OAuth & Login Links */}
              <div className="w-full flex flex-col items-center mt-4">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    setLoading(true);
                    try {
                    
                      const res = await axiosInstance.post("/auth/google", {
                        token: credentialResponse.credential, 
                      });

                      if (res.data.success) {
                        localStorage.setItem("token", res.data.token);
                        localStorage.setItem("userId", res.data.user._id);
                        navigate("/"); 
                      }
                    } catch (error) {
                      const axiosError = error as AxiosError;
                      console.error("Auth Error:", axiosError.response?.data);
                      alert((axiosError.response?.data as any)?.message || "Google Auth Failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => alert("Google Login Failed")}
                  useOneTap
                />
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">
                  Identity verified via Google OAuth 2.0
                </p>
              </div>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  Already have an account? <Link to="/login" className="font-medium border-b border-gray-500 ml-2">Log in</Link>
                </p>
              </div>
            </>
          ) : (
            /* --- OTP ENTRY INTERFACE --- */
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h1 className="text-3xl font-medium mb-3">Verify your email</h1>
                <p className="text-sm text-gray-500">
                  We've sent a 6-digit confirmation code to <span className="font-medium text-black">{email}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* 6 Grid Box inputs matching your design system */}
                <div className="flex justify-between gap-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={data}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-14 w-12 rounded border border-neutral-300 text-center text-xl font-semibold outline-none focus:border-black focus:ring-1 focus:ring-black"
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Inline Red Warn-Box (Replaces standard Alerts) */}
                {otpError && (
                  <p className="text-sm font-medium text-red-600 text-center bg-red-50 py-2.5 rounded">
                    {otpError}
                  </p>
                )}

                <div className="text-center text-sm mt-4">
                  <p className="text-gray-500">
                    Didn't receive code?{" "}
                    <button 
                      onClick={handleSubmit} 
                      className="font-medium text-[#DB4444] hover:underline"
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Signup;