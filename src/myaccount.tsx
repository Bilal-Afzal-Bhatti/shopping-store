import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
function Account() {
    // ✅ States for the form fields
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 

  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  const token = localStorage.getItem("token");
   console.log("Token:", token); // Debug: Check if token is retrieved
    try {
      const res = await fetch("https://shoppingstore-backend.vercel.app/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, emailOrPhone, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        navigate("/"); // redirect to home or profile page
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 md:px-20 py-16">
      {/* Breadcrumb Row */}
      <div className="flex justify-between items-center mb-8">
        {/* Left Side */}
        <div className="text-sm">
          <Link to="/" className="hover:text-blue-600 font-medium">
            HOME /
          </Link>
          <span className="ml-2 text-blue-600 font-semibold">MY ACCOUNT</span>
        </div>

        {/* Right Side */}
        <div className="text-gray-700 font-semibold">
          Welcome! <span className="text-blue-600">Bilal</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-50 rounded-2xl p-6 shadow">
          <h3 className="text-gray-900 font-bold mb-4">Manage My Account</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="font-semibold text-blue-600 cursor-pointer">
              My Profile
            </li>
            <li className="hover:text-blue-600 cursor-pointer">Address Book</li>
            <li className="hover:text-blue-600 cursor-pointer">
              My Payment Options
            </li>
          </ul>

          <h3 className="text-gray-900 font-bold mt-8 mb-4">My Orders</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="hover:text-blue-600 cursor-pointer">My Returns</li>
            <li className="hover:text-blue-600 cursor-pointer">
              My Cancellations
            </li>
          </ul>

          <h3 className="text-gray-900 font-bold mt-8 mb-4">My Wishlist</h3>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-3/4 bg-gray-50 rounded-2xl p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Your Profile
          </h2>

          <form className="space-y-6" onSubmit={handleUpdate}>
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
             
             
            </div>
         {/* Password Section */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Current Password */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Current Password
    </label>
    <input
      type="password"
      placeholder="Enter current password"
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
    />
  </div>
  {/* New Password */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      New Password
    </label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter new password"
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
    />
  </div>
</div>


            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;
