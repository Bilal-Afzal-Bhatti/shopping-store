import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import qr from "../assets/qr.png";
import { Send } from "lucide-react"; // ✅ Add Send icon
import playstore_appstore from "../assets/playstore_appstore.png";

import { useState } from "react";

function Footer() {
   const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("http://192.168.137.6:5713/api/useremail/emailsender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "user",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const data = await response.json();
      console.log("✅ Server response:", data);

      setEmail("");
      setShowModal(true); // show success modal
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };
  // Define menu data for each section
  const footerData = {
    Exclusive: ["Subscribe", "Get 10% off your first order"],
    Support: ["Help Center", "Returns", "Privacy Policy", "Terms of Service"],
    Account: ["My Account", "Login / Register", "Cart", "Wishlist"],
    QuickLink: ["FAQs", "Size Guide", "Order Tracking", "Gift Cards"],
  };

  return (
    <footer className="bg-black text-white py-12 px-6 md:px-20 w-101 md:max-w-full  sm:w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        {/* Loop through footerData object */}
        {Object.entries(footerData).map(([sectionTitle, items]) => (
          <div key={sectionTitle}>
            <h3 className="text-lg font-semibold mb-4">{sectionTitle}</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              {items.map((item, index) => (
                <li key={index} className="hover:text-gray-400 cursor-pointer transition">
                  {item}
                </li>
              ))}
            </ul>

         {/* Add Subscribe Input under Exclusive */}
{sectionTitle === "Exclusive" && (
        <div className="mt-6">
          <div className="relative w-full max-w-xs">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pr-10 pl-3 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer hover:text-white disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ✅ Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-2">🎉 Subscription Successful!</h2>
            <p className="text-gray-300 mb-4">
              You’ve been subscribed to Exclusive offers.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              OK
            </button>
          </div>

             </div>
            )}
          </div>
        ))}

        {/* Download App */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Download App</h3>
          <p className="text-gray-400 text-sm mb-3">Save $3 with App New User Only</p>

          <div className="flex items-center gap-3 mb-4">
            <img src={qr} alt="QR Code" className="w-20 h-20 bg-white rounded-lg border" />
            <div className="flex flex-col gap-2 bg-black items-center p-4">
              <img
                src={playstore_appstore}
                alt="Google Play"
                className="w-28 cursor-pointer filter invert brightness-0.5"
              />
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 mt-2">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-gray-400" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-gray-400" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-gray-400" />
            <Youtube className="w-5 h-5 cursor-pointer hover:text-gray-400" />
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
        © 2025 Exclusive. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
