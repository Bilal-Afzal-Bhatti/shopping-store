import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

function Contact() {
  const [loading, setLoading] = useState(false); 
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", });
  const [modal, setModal] = useState<{ open: boolean; message: string; success: boolean }>({
  open: false,
  message: "",
  success: true,
});
   //Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      { setFormData({ ...formData, [e.target.name]: e.target.value }); };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

 const numericPhone = Number(formData.phone);
if (isNaN(numericPhone) || numericPhone <= 0) {
  alert("Phone must be a valid number");
  setLoading(false);
  return;
}



const payload = {
  name: formData.name,
  email: formData.email,
  phone: numericPhone,
  message: formData.message,
  role: "user",
};

  try {
    const res = await fetch("http://192.168.137.6:5713/api/userfeedback/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json(); // fetch server error message
      throw new Error(errData.message || "Failed to send feedback");
    }

    const data = await res.json();
    console.log("✅ Feedback sent:", data);

    // Clear form
    setFormData({ name: "", email: "", phone: "", message: "" });
    // Show success modal
    setModal({ open: true, message: "✅ Feedback submitted successfully!", success: true });
  } catch (error: any) {
    console.error("❌ Error:", error);
  setModal({ open: true, message: `❌ ${error.message}`, success: false });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 md:px-20 py-16">
      {/* ===== Breadcrumb ===== */}
      <div className="text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-blue-600 cursor-pointer font-medium">
          HOME
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-blue-600 font-semibold">CONTACT</span>
      </div>

      {/* ===== Contact Section ===== */}
      <div className="flex flex-col md:flex-row justify-between gap-10">
        {/* ==== Left Side (Contact Info) ==== */}
        <div className="flex flex-col gap-8 w-full md:w-1/2">
          {/* Call to Us */}
          <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white text-blue-600 p-3 rounded-full">
                <FaPhoneAlt size={20} />
              </div>
              <h2 className="text-xl font-semibold">Call To Us</h2>
            </div>
            <p className="text-gray-100 mb-2">We are available 24/7, 7 days a week.</p>
            <p className="text-gray-100 font-medium">
              Phone: <span className="text-white">0283 28234</span>
            </p>
          </div>

          {/* Write to Us */}
          <div className="bg-green-600 text-white p-8 rounded-3xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white text-green-600 p-3 rounded-full">
                <FaEnvelope size={20} />
              </div>
              <h2 className="text-xl font-semibold">Write To Us</h2>
            </div>
            <p className="text-gray-100 mb-2">
              Fill out our form and we will contact you within 24 hours.
            </p>
            <p className="text-gray-100">
              Emails:{" "}
              <span className="text-white">customer@exclusive.com</span>
              <br />
              Emails:{" "}
              <span className="text-white">support@exclusive.com</span>
            </p>
          </div>
        </div>

        {/* ==== Right Side (Contact Form) ==== */}
        <div className="w-full md:w-1/2 bg-gray-50 rounded-3xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Send Us a Message</h2>

          <form   onSubmit={handleSubmit} className="space-y-6">
            {/* Name / Email / Phone (same line on desktop) */}
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                  name="name"
                placeholder="Your Name"
 value={formData.name}
                     onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                 value={formData.email}
                     onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="number"
                name="phone"
                placeholder="Your Phone"
                 value={formData.phone}
                     onChange={handleChange}
                className="flex-1 p-2 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Message Box */}
            <textarea
              placeholder="Your Message"
              rows={6}
              name="message"
               value={formData.message}
                onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            ></textarea>
<button
  type="submit"
  disabled={loading}
  className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {loading ? "Sending..." : "Send Message"}
</button>

          </form>
          {modal.open && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white rounded-2xl p-8 w-11/12 md:w-1/3 text-center shadow-lg">
      <h2 className={`text-xl font-bold mb-4 ${modal.success ? "text-green-600" : "text-red-600"}`}>
        {modal.success ? "Success" : "Error"}
      </h2>
      <p className="mb-6">{modal.message}</p>
      <button
        onClick={() => setModal({ ...modal, open: false })}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Close
      </button>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}

export default Contact;
