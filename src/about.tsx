import { FaMapMarkerAlt, FaUsers, FaStore, FaShoppingBag } from "react-icons/fa";
import africian from "./assets/africian.png"; // <-- add your image path
import { Link } from "react-router-dom";
import  { useEffect,useRef,useState } from "react";

function About() {
  const stats = [
    { icon: <FaMapMarkerAlt size={30} />,number: 33000, text: "Locations" },
    { icon: <FaUsers size={30} />, number: 10500, text: "Sellers" },
    { icon: <FaStore size={30} />, number: 300, text: "Brands" },
    { icon: <FaShoppingBag size={30} />, number: 200, text: "Products" },
  ];
  const [counted, setCounted] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const statsRef = useRef<HTMLDivElement | null>(null);

  // Function to animate counting
  const animateCount = (index: number, target: number) => {
    let start = 0;
    const speed = target / 50; // adjust speed (smaller = slower)
    const interval = setInterval(() => {
      start += speed;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      setCounts((prev) =>
        prev.map((val, i) => (i === index ? Math.floor(start) : val))
      );
    }, 10); // interval speed
  };

  // Start animation when scrolled near stats section
  useEffect(() => {
    const handleScroll = () => {
      if (!statsRef.current || counted) return;
      const top = statsRef.current.getBoundingClientRect().top;
      if (top < window.innerHeight - 20) {
        setCounted(true);
        stats.forEach((item, index) => animateCount(index, item.number));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [counted]);
  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 md:px-20 py-16">
  <div className="text-sm text-gray-500 mb-8">
        <Link to="/home" className="hover:text-blue-600 cursor-pointer font-medium">
          HOME
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-blue-600 font-semibold">ABOUT</span>
      </div>

      {/* ===== Our Story Section ===== */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
       
        {/* Left Content */}
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Story</h2>
          <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
            Launced in 2015, Exclusive is South Asia’s premier online shopping
            marketplace with an active presence in Bangladesh. Supported by a wide
            range of tailored marketing, data, and service solutions, Exclusive has
            10,500 sellers and 300 brands and serves 3 million customers across
            the region.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Exclusive has more than 1 million products to offer, growing very fast.
            Exclusive offers a diverse assortment in categories ranging from
            consumer goods to lifestyle products.
          </p>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-end">
          <img
            src={africian}
            alt="About Exclusive"
            className="w-full max-w-md rounded-2xl shadow-lg object-cover"
          />
        </div>
      </div>

      {/* ===== Stats Boxes ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
        {stats.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-gray-100 rounded-2xl p-6 shadow hover:shadow-lg transition"
          >
            <div className="text-blue-600 mb-3">{item.icon}</div>
          <h3 ref={statsRef} className="text-2xl font-bold text-gray-900">
              {counts[index] >= 1000
                ? `${Math.floor(counts[index] / 1000)}K`
                : counts[index]}
            </h3>
            <span className="text-gray-500 text-sm mt-1">{item.text}</span>
          </div>
        ))}
      </div>
     
    </div>
  );
}

export default About;
