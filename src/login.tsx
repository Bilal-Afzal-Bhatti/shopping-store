import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { AlertCircle, X } from "lucide-react";
import axiosInstance from "./api/axiosInstance";
import Side_image from "./assets/Side_Image.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setModalOpen(true);
  };

  // --- MANUAL LOGIN ---
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        navigate("/");
      }
    } catch (err: any) {
      showError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleSuccess = async (credentialResponse: any) => {
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
    } catch (err: any) {
      console.error("Google Auth Error:", err.response?.data);
      showError(err.response?.data?.message || "Google Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen animate-in fade-in duration-700 relative">
      
      {/* ERROR MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full border border-gray-100 shadow-2xl relative text-center">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-[#DB4444]" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Failed</h3>
            <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full bg-[#DB4444] text-white py-3 rounded-xl font-medium hover:bg-[#c33d3d] transition-all active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Left Image Section */}
      <div className="hidden md:block w-full md:w-[55%] bg-[#CBE4E8]">
        <img
          src={Side_image}
          alt="Shopping Side"
          className="w-full h-full max-h-200 object-contain pt-20"
        />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-100">
          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-3 tracking-tight">Log in to Exclusive</h1>
            <p className="text-black text-sm">Enter your details below</p>
          </div>

          {/* FORM FOR MANUAL USERS */}
          <form onSubmit={handleManualLogin} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                className="w-full bg-[#DB4444] text-white py-4 rounded font-medium hover:bg-red-700 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Processing..." : "Log In"}
              </button>
              <Link
                to="/ForgotPassword"
                className="text-[#DB4444] text-sm hover:underline hover:text-[#c33d3d] text-left w-fit transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm italic">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* GOOGLE BUTTON FOR GOOGLE USERS */}
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showError("Google authentication failed. Please try again.")}
              theme="outline"
              size="large"
              width="200px"
            />
          </div>

          <p className="text-center mt-8 text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium border-b border-gray-500 pb-0.5 ml-2 hover:text-black transition">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;