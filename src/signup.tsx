import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import Side_image from "./assets/Side_Image.png";

function Signup() {
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. AUTO-SCROLL UX
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 80, // Nudge down to center the form
        behavior: "smooth",
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
        navigate("/login"); // Redirect to login after success
      } else {
        alert(data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen animate-in fade-in duration-700">
      
      {/* Left Image Section - High-end layout */}
      <div className="hidden md:block w-full md:w-[55%] bg-[#CBE4E8] flex items-center justify-end">
        <img
          src={Side_image}
          alt="Create Account"
          className="w-full h-full max-h-[800px] object-contain pt-20"
        />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[400px]">
          
          {/* Header Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-3 tracking-tight">Create an account</h1>
            <p className="text-black text-sm">Enter your details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Name Input */}
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />

              {/* Email / Phone Input */}
              <input
                type="text"
                placeholder="Email or Phone Number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />

              {/* Password Input */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#DB4444] text-white py-4 rounded font-medium hover:bg-red-700 transition-all active:scale-[0.98] mt-4"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Google Signup Option */}
          <button className="w-full border border-gray-300 flex items-center justify-center gap-3 py-4 rounded mt-4 hover:bg-gray-50 transition active:scale-[0.98]">
            <FcGoogle size={24} />
            <span className="text-sm font-medium text-black">Sign up with Google</span>
          </button>

          {/* Already have account - Footer */}
          <div className="text-center mt-8">
             <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium border-b border-gray-500 pb-0.5 ml-3 hover:text-black transition"
              >
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