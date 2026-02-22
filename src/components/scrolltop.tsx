// ScrollToTop.tsx
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react"; // Or any icon

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  // Show button only after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });    
  };

  if (!visible) return null; // Hide if not scrolled enough

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-12 h-12 bg-red-500 text-white flex items-center justify-center rounded-full shadow-lg hover:bg-red-600 transition"
    >
      <ArrowUp size={24} />
    </button>
  );
}
