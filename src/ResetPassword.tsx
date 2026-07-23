// src/pages/ResetPassword.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import axiosInstance from './api/axiosInstance';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve passed parameters from navigate()
  const email = location.state?.email;
  const resetToken = location.state?.resetToken;
  const verified = location.state?.verified;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Security check: Redirect away if the user didn't complete OTP verification first
  if (!email || !verified) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-xl max-w-sm">
          <ShieldAlert size={48} className="text-[#DB4444] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please verify your OTP code first before trying to reset your password.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-5 py-2.5 bg-[#DB4444] text-white text-sm font-medium rounded-xl hover:bg-[#c33d3d] transition-colors"
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

   try {
  const res = await axiosInstance.post('/auth/reset-password', {
    email,
    otp: resetToken, // 👈 Map resetToken to 'otp'
    newPassword: password,
  });

      if (res.data.success || res.status === 200) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        {!success ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your new password for account <span className="font-semibold text-gray-800">{email}</span>.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-800 transition-all focus:bg-white focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-3.5 text-gray-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-800 transition-all focus:bg-white focus:border-[#DB4444] focus:ring-2 focus:ring-[#DB4444]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 bg-[#DB4444] text-white rounded-xl font-medium text-sm hover:bg-[#c33d3d] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#DB4444]/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success Message Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Password Changed!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your password has been successfully reset. You can now sign in with your new credentials.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full mt-2 py-3.5 bg-[#DB4444] text-white rounded-xl font-medium text-sm hover:bg-[#c33d3d] transition-colors shadow-md shadow-[#DB4444]/20"
            >
              Sign In Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
