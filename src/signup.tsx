import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import Side_image from "./assets/Side_Image.png";
import { useGoogleLogin } from "@react-oauth/google"; // 1. Import the hook
import axios from "axios"; // 2. Ensure axios is installed

function Signup() {
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- GOOGLE OAUTH LOGIC ---
const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // 1. Ensure your .env has VITE_BACKEND_URL=https://your-backend.vercel.app
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        
        console.log("Token Response:", tokenResponse);

        // 2. KEY CHANGE: Send 'token' to match your backend's req.body destructuring
        const res = await axios.post(`${backendUrl}/api/auth/google`, {
          token: tokenResponse.access_token, 
        });

        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userId", res.data.user._id);
          alert("Authentication Successful!");
          navigate("/"); 
        }
      } catch (error) {
        console.error("Connection Error:", error);
        // This was the confusing error message! Let's make it more accurate:
        const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : "Google Authentication Failed at Backend";
        alert(errorMessage || "Google Authentication Failed at Backend");
      } finally {
        setLoading(false);
      }
    },
    onError: () => alert("Google Login Failed"),
  });
  // --- MANUAL SIGNUP LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://shoppingstore-backend.vercel.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emailOrPhone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Failed to create account");
      }
    } catch (error) {
      alert("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 80, behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen animate-in fade-in duration-700">

      {/* Left Image Section */}
      <div className="hidden md:block w-full md:w-[55%] bg-[#CBE4E8]">
        <img
          src={Side_image}
          alt="Create Account"
          className="w-full h-full max-h-[800px] object-contain pt-20"
        />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[400px]">

          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-3 tracking-tight">Create an account</h1>
            <p className="text-black text-sm">Enter your details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
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

            <button
              type="submit"
              className="w-full bg-[#DB4444] text-white py-4 rounded font-medium hover:bg-red-700 transition-all active:scale-[0.98] mt-4"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* 3. UPDATED GOOGLE BUTTON */}
          <div className="w-full">
            <button
              type="button" // Important to prevent form submission
              onClick={() => loginWithGoogle()}
              disabled={loading}
              className="w-full border-4 border-black flex items-center justify-center gap-3 py-4 rounded-none mt-4 
                         bg-white text-black font-black uppercase italic text-sm
                         shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                         hover:shadow-none hover:translate-x-1 hover:translate-y-1 
                         transition-all active:scale-[0.98]"
            >
              <FcGoogle size={24} />
              <span>{loading ? "Verifying..." : "Sign up with Google"}</span>
            </button>

            <p className="text-[9px] text-center mt-4 font-bold text-gray-400 uppercase tracking-widest">
              Identity verified via Google OAuth 2.0
            </p>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-medium border-b border-gray-500 pb-0.5 ml-3 hover:text-black transition">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;