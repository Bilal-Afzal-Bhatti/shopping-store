// src/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import axiosInstance from "./api/axiosInstance";

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 1. Submit Email -> Send OTP via Nodemailer
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email });
      if (res.data.success || res.status === 200) {
        setStep('otp'); // Switch to OTP view on success
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to send OTP. Please check your email.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit OTP -> Verify code on backend
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/auth/verify-reset-otp', { email, otp });
      
      if (res.data.success || res.status === 200) {
        // Navigate to Reset Password page only when OTP is verified
        // Pass resetToken (if your backend generates one) or pass email in state
        const resetToken = res.data.resetToken || undefined;
        
        navigate('/ResetPassword', { 
          state: { email, resetToken, verified: true } 
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid or expired OTP code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#DB4444] transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email address to receive a 6-digit verification OTP code.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-3.5 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-800 transition-all focus:bg-white focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#DB4444] text-white rounded-xl font-medium text-sm hover:bg-[#c33d3d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#DB4444]/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP Code'
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Enter OTP Code */}
        {step === 'otp' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Enter OTP Code</h2>
              <p className="text-sm text-gray-500 mt-1">
                We sent a code to <span className="font-semibold text-gray-800">{email}</span>. Please enter it below.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Verification Code (OTP)
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-3.5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm tracking-widest font-mono text-center outline-none text-gray-800 transition-all focus:bg-white focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#DB4444] text-white rounded-xl font-medium text-sm hover:bg-[#c33d3d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#DB4444]/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="hover:text-gray-800 underline"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#DB4444] hover:underline font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}