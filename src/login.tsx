import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google"; // Import official component
import axios from "axios"; 
import Side_image from "./assets/Side_Image.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    window.scrollTo({ top: 80, behavior: "smooth" });
  }, []);

  // --- MANUAL LOGIN (For Email/Password users) ---
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        navigate("/cart");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE LOGIN (For Google users - NO PASSWORD REQUIRED) ---
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      // credentialResponse.credential is the ID Token (JWT)
      const res = await axios.post(`${backendUrl}/api/auth/google`, {
        token: credentialResponse.credential, 
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        alert("Login Successful!");
        navigate("/"); 
      }
    } catch (err: any) {
      console.error("Google Login Error:", err.response?.data);
      alert("This account might require a password. Try manual login or check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen animate-in fade-in duration-700">
      
      {/* Left Image Section */}
      <div className="hidden md:block w-full md:w-[55%] bg-[#CBE4E8]">
        <img
          src={Side_image}
          alt="Shopping Side"
          className="w-full h-full max-h-[800px] object-contain pt-20"
        />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-3 tracking-tight">Log in to Exclusive</h1>
            <p className="text-black text-sm">Enter your details below</p>
          </div>

          {/* FORM FOR MANUAL USERS */}
          <form onSubmit={handleManualLogin} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Email "
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
              <button type="button" className="text-[#DB4444] text-sm hover:underline text-left w-fit">
                Forget Password?
              </button>
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
              onError={() => alert("Google Login Failed")}
              theme="outline"
              size="large"
              width="400px" // Makes it look uniform with the form
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