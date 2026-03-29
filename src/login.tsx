import { useState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import Side_image from "./assets/Side_Image.png";

function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. AUTO-SCROLL LOGIC
  useEffect(() => {
    // Slight delay ensures the layout is painted before scrolling
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 80, // Adjust this value to match your Navbar height
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://shoppingstore-backend.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        navigate("/cart");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen animate-in fade-in duration-700">
      
      {/* Left Image Section - Hidden on small mobile for better UX */}
      <div className=" md:block w-full md:w-[55%] bg-[#CBE4E8] flex items-center justify-end">
        <img
          src={Side_image}
          alt="Shopping Side"
          className="w-full h-full max-h-[800px] object-contain pt-20"
        />
      </div>

      {/* Right Form Section */}
      <div 
        ref={formRef}
        className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20"
      >
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-3 tracking-tight">Log in to Exclusive</h1>
            <p className="text-black text-sm">Enter your details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email / Phone */}
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                className="w-full bg-[#DB4444] text-white py-4 rounded font-medium hover:bg-red-700 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
              
              <button 
                type="button"
                className="text-[#DB4444] text-sm font-normal hover:underline text-left"
              >
                Forget Password?
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Login */}
          <button className="w-full border border-gray-300 flex items-center justify-center gap-3 py-4 rounded hover:bg-gray-50 transition active:scale-[0.98]">
            <FcGoogle size={24} />
            <span className="text-sm font-medium">Log in with Google</span>
          </button>

          {/* Footer */}
          <p className="text-center mt-8 text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium border-b border-gray-500 pb-0.5 ml-2 hover:text-black transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;