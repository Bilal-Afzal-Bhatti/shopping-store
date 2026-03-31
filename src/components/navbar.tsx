import searchIcon from "../assets/search.png"; // Renamed to avoid confusion with function names
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Heart,

  Package,


  LogOut,

} from "lucide-react";

function Navbar() {
  const menuItems = ["Home", "Contact", "About", "Sign Up"];
  const [isSticky, setIsSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heartActive, setHeartActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // --- Logic remains identical ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    sessionStorage.clear();
    setDropdownOpen(false);
    navigate("/", { replace: true });
    localStorage.clear();

    // 2. Trigger the event (Optional, but good for other components)
    window.dispatchEvent(new Event("cartUpdated"));

    // 3. Show a quick toast or alert if you want, then reload
    // Using window.location.href forces a full browser refresh to the login page
    window.location.href = "/login";
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // If no user, reset to 0 immediately
    if (!token || !userId) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(
        `https://shoppingstore-backend.vercel.app/api/cart/showcart/?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();

      // Set the count and sync localStorage for backup
      const count = data.items?.length || 0;
      setCartCount(count);
      localStorage.setItem("cartCount", count.toString());
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // 1. Run immediately when Chrome loads/refreshes the page
    fetchCartCount();

    // 2. Listen for the "cartUpdated" event we trigger in Checkout.tsx
    window.addEventListener("cartUpdated", fetchCartCount);

    // 3. Listen for "storage" changes (e.g., user logs out or clears data)
    window.addEventListener("storage", fetchCartCount);

    // Cleanup listeners when component unmounts
    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
      window.removeEventListener("storage", fetchCartCount);
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;
    const sectionMap: Record<string, string> = {
      "flash": "flash-sales", "sale": "flash-sales", "best": "best-selling",
      "new": "new-arrivals", "view": "view_item", "browse": "search_cartegories"
    };
    const targetId = Object.keys(sectionMap).find(key => query.includes(key));
    if (targetId) {
      const element = document.getElementById(sectionMap[targetId]);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      else navigate(`/#${sectionMap[targetId]}`);
    }
    setSearchQuery("");
    setMenuOpen(false); // Close mobile menu on search
  };

  return (
    <header
      className={`bg-white z-50 w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 shadow-md" : "relative border-b border-gray-100"
        }`}
    >
      <nav className="max-w-[1440px] mx-auto flex items-center justify-between px-6 py-4 md:px-12">

        {/* 1. Logo */}
        <Link to="/" className="z-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-black">
            EXCLUSIVE
          </h1>
        </Link>

        {/* 2. Hamburger Button (SEO & Accessibility Optimized) */}
        <button
          className="md:hidden z-50 p-2 focus:outline-none aria-label='Toggle Menu'"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          <div className="relative w-6 h-5 transition-all duration-300">
            <span className={`absolute block h-0.5 w-full bg-black transition-all duration-300 ${menuOpen ? "rotate-45 top-2" : "top-0"}`}></span>
            <span className={`absolute block h-0.5 w-full bg-black top-2 transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
            <span className={`absolute block h-0.5 w-full bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 top-2" : "top-4"}`}></span>
          </div>
        </button>

        {/* 3. MOBILE SIDE DRAWER */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className={`absolute top-0 left-0 h-full w-[280px] bg-white shadow-xl p-6 flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center bg-[#F5F5F5] rounded-md h-10 px-3 mt-12 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent outline-none text-black flex-1 text-sm"
              />
              <img src={searchIcon} alt="" className="w-5 h-5 opacity-60" onClick={() => handleSearch()} />
            </form>
{/* Mobile Nav Links */}
<ul className="flex flex-col gap-5 border-b border-gray-100 pb-6">
  {menuItems.map((item, index) => (
    <li key={index}>
      <Link
        to={
          item === "Sign Up" ? "/signup" :
          item === "Home" ? "/" :
          item === "About" ? "/about" : "/contact"
        }
        className={`text-base font-medium transition-colors ${
          activeIndex === index ? "text-red-500" : "text-black hover:text-red-500"
        }`}
        onClick={() => {
          setActiveIndex(index);
          setMenuOpen(false);
        }}
      >
        {item}
      </Link>
    </li>
  ))}

  {/* My Orders - Unique Index 99 */}
  <li>
    <Link
      to="/myOrder"
      className={`text-base font-medium transition-colors ${
        activeIndex === 99 ? "text-red-500" : "text-black hover:text-red-500"
      }`}
      onClick={() => {
        setActiveIndex(99); 
        setMenuOpen(false);
      }}
    >
      My Orders
    </Link>
  </li>

  {/* Wishlist - Unique Index 100 (Changed from 99 to 100) */}
  <li>
    <Link 
      to="/wishlist"   
      className={`text-base font-medium transition-colors ${
        activeIndex === 100 ? "text-red-500" : "text-black hover:text-red-500"
      }`}
      onClick={() => {
        setActiveIndex(100); // Now matches the className check
        setMenuOpen(false);
      }}
    >
      Wishlist
    </Link>
  </li>
</ul>
            {/* Mobile Action Icons Row */}
            <div className="flex items-center justify-between py-6">
              <button onClick={() => setHeartActive(!heartActive)} className="p-2">
                <Heart className={`w-6 h-6 ${heartActive ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
              </button>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="p-2 relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/myaccount" onClick={() => setMenuOpen(false)} className="p-2">
                <User className="w-6 h-6 text-gray-700" />
              </Link>

            </div>

            {/* Mobile Logout (Sticky to bottom) */}
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 text-red-600 font-semibold border-t border-gray-100 pt-4"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </aside>
        </div>

        {/* 4. LAPTOP MENU ITEMS (Hidden on Mobile) */}
        <ul className="hidden md:flex items-center gap-8">
          {menuItems.map((item, index) => (
            <li key={index} className="relative group">
              <Link
                to={item === "Sign Up" ? "/signup" : item === "Home" ? "/" : item === "About" ? "/about" : "/contact"}
                className={`text-base transition-colors hover:text-gray-500 ${activeIndex === index ? "font-medium" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                {item}
              </Link>
              {activeIndex === index && (
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#c1a3a3]"></span>
              )}
            </li>
          ))}
        </ul>

        {/* 5. LAPTOP SEARCH & ICONS (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-5">
          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-[#F5F5F5] rounded-md w-64 h-10 px-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="bg-transparent outline-none text-black flex-1 text-sm placeholder:text-gray-400"
            />
            <button type="submit">
              <img src={searchIcon} alt="search" className="w-5 h-5 opacity-80" />
            </button>
          </form>

          {/* Desktop Icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => setHeartActive(!heartActive)} className="hover:scale-110 transition">
              <Heart className={`w-6 h-6 ${heartActive ? "fill-red-500 text-red-500" : "text-black"}`} />
            </button>

            <Link to="/cart" className="relative hover:scale-110 transition">
              <ShoppingCart className="w-6 h-6 text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="hover:scale-110 transition flex items-center">
                <User className="w-6 h-6 text-black" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 border border-gray-100 shadow-xl rounded-lg py-2 bg-white transform origin-top-right animate-in fade-in zoom-in duration-200">
                  <Link to="/myaccount" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm"><User size={18} /> Manage My Account</Link>
                  <Link to="/myOrder" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm"><Package size={18} /> My Orders</Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm"><Heart size={18} /> Wishlist</Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-red-600 text-left text-sm font-medium">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;