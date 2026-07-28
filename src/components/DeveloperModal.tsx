import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code2, Server, Rocket } from "lucide-react";

export default function DeveloperModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the modal
    const hasSeenModal = localStorage.getItem("hasSeenDevModal");
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    // Mark as seen so it won't show again on refresh or future visits
    localStorage.setItem("hasSeenDevModal", "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mt-2">
              <span className="inline-block bg-[#DB4444]/10 text-[#DB4444] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                Full-Stack MERN Developer
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Hi, I'm <span className="text-[#DB4444]">Bilal Bhatti</span>
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Looking for a custom web application or e-commerce platform like this one? Let's build it together!
              </p>
            </div>

            {/* Expertise Grid */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Code2 className="text-[#DB4444] shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Full-Stack MERN Development</h4>
                  <p className="text-xs text-gray-500">React, Next.js, Node.js, Express & MongoDB solutions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Server className="text-[#DB4444] shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Custom Features & API Integration</h4>
                  <p className="text-xs text-gray-500">Cart systems, payment gateways, authentication & admin portals.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Rocket className="text-[#DB4444] shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Deployment & Cloud Operations</h4>
                  <p className="text-xs text-gray-500">Production-ready deployment with CI/CD & optimized performance.</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:your-email@example.com" // Replace with your email or contact link
                onClick={handleClose}
                className="flex-1 text-center bg-[#DB4444] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#c33d3d] transition active:scale-95 text-sm"
              >
                Hire Me for Your Project bilalafzalbhatti@gmail.com
              </a>
              <button
                onClick={handleClose}
                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-sm"
              >
                Explore Website
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}