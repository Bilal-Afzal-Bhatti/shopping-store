import { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // Google icon
import Side_image from "./assets/Side_Image.png";

function Signup() {
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://shopping-backend-nine.vercel.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emailOrPhone, password }),
      });

      const data = await res.json();
      console.log("Signup response:", data);
      alert("Account created successfully!");
      
      // Clear form
      setName("");
      setEmailOrPhone("");
      setPassword("");
    } catch (error) {
      console.error("Signup error:", error);
      alert("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Image */}
      <div className="w-full md:w-1/2 h-64 md:h-200 mt-20 mb-40">
        <img
          src={Side_image}
          alt="Side"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
          <span className="text-gray-500 mb-6 block">
            Enter your details below
          </span>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

             {/* Email / Phone */}
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-300" />
            <span className="mx-2 text-gray-400">or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Google Signup */}
          <button className="w-full border border-gray-300 flex items-center justify-center gap-2 p-3 rounded hover:bg-gray-100 transition">
            <FcGoogle size={24} />
            Sign up with Google
          </button>

          {/* Already have account */}
          <p className="text-center mt-4 text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="underline text-blue-600 hover:text-blue-800">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
