import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Side_image from "./assets/Side_Image.png";
import axios, { AxiosError } from "axios";
import { GoogleLogin } from '@react-oauth/google';

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    try {
     const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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
        <img src={Side_image} alt="Signup" className="w-full h-full max-h-[800px] object-contain pt-20" />
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-medium mb-3">Create an account</h1>
            <p className="text-sm">Enter your details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-b py-3 outline-none focus:border-black" required />
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-b py-3 outline-none focus:border-black" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-b py-3 outline-none focus:border-black" required />
            <button type="submit" className="w-full bg-[#DB4444] text-white py-4 rounded font-medium hover:bg-red-700 transition-all" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="w-full flex flex-col items-center mt-4">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL;
                  const res = await axios.post(`${backendUrl}/api/auth/google`, {
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
        </div>
      </div>
    </div>
  );
}

export default Signup;