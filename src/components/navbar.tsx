import search from "../assets/search.png";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Heart,
  Settings,
  Package,
  XCircle,
  Star,
  LogOut,
  Menu,
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
  const [searchQuery, setSearchQuery] = useState(""); // Add search state
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    sessionStorage.clear();
    setDropdownOpen(false);
    navigate("/", { replace: true });
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(
        `http://192.168.18.40:5731/api/cart/showcart/?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCartCount(data.items.length);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  


  // Logic to handle the search action
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.toLowerCase().trim();

    if (!query) return;

    // Mapping search terms to Section IDs
    const sectionMap: Record<string, string> = {
      "flash": "flash-sales",
      "sale": "flash-sales",
      "best": "best-selling",
      "selling": "best-selling",
      "new": "new-arrivals",
      "arrival": "new-arrivals",
      "view":"view_item",
      "browse":"search_cartegories"
    };

    const targetId = Object.keys(sectionMap).find(key => query.includes(key));

    if (targetId) {
      const element = document.getElementById(sectionMap[targetId]);
      if (element) {
        // Option A: If on Home Page, Scroll
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Option B: If on another page, navigate to home with hash
        navigate(`/#${sectionMap[targetId]}`);
      }
    } else {
      // Fallback: Normal search results page (if you have one)
      console.log("Searching for:", query);
      // navigate(`/search?q=${query}`);
    }
    
    setSearchQuery(""); // Clear search
  };

  return (
  <nav
  className={`bg-white z-20 w-full flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 shadow transition-all duration-300 ${
    isSticky ? "fixed top-0 left-0 shadow-md" : "relative"
  }`}
>
      {/* Logo */}
      <h1 className="text-xl sm:text-2xl md:ml-13 font-bold tracking-wide text-black">
        EXCLUSIVE
      </h1>

      {/* Hamburger */}
      <div
        className="md:hidden cursor-pointer ml-auto"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <XCircle className="w-7 h-7 text-gray-800" />
        ) : (
          <Menu className="w-7 h-7 text-gray-800" />
        )}
      </div>

      {/* Menu Items */}
      <ul
        className={`flex flex-col md:flex-row   items-center gap-6 md:gap-8 absolute md:static bg-white md:bg-transparent w-full md:w-auto top-16 left-0 md:top-auto transition-all duration-300 ${menuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-5 md:opacity-100 md:translate-y-0"
          }`}
      >
        {menuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => {
              setActiveIndex(index);
              setMenuOpen(false);
            }}
            className="cursor-pointer  text-black hover:text-gray-500 transition relative"
          >
            <Link
              to={
                item === "Sign Up"
                  ? "/signup"
                  : item === "Home"
                    ? "/"
                    : item === "About"
                      ? "/about"
                      : item === "Contact"
                        ? "/contact"
                        : "#"
              }
            >
              {item}
            </Link>
            {activeIndex === index && (
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#c1a3a3] rounded"></div>
            )}
          </li>
        ))}
      </ul>

 {/* 🔍 Search Bar Updated */}
      <div className="hidden lg:flex items-center bg-[#F5F5F5] rounded-md w-60 xl:w-72 h-10 px-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Enter Key Support
          placeholder="Search (flash, best, new...)"
          className="bg-transparent outline-none text-black flex-1 placeholder-gray-600 text-sm"
        />
        <img
          src={search}
          alt="search"
          onClick={() => handleSearch()} // Click Icon Support
          className="w-5 h-5 cursor-pointer object-contain"
        />
      </div>

      {/* Icons Section */}
      <div className="hidden md:flex md:mr-28 items-center gap-6 lg:gap-8 text-black">
        {/* Heart */}
        <Heart
          className={`w-6 h-6 cursor-pointer transition-colors ${heartActive ? "text-red-500" : "text-gray-500"
            }`}
          onClick={() => setHeartActive(!heartActive)}
        />

        {/* Cart */}
        <div className="relative cursor-pointer">
          <Link to="/cart">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <User
            className="w-6 h-6 text-gray-700 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-4 w-56 border border-gray-200 shadow-lg rounded-md py-2 bg-white">
              {[
                { icon: Settings, label: "Manage My Account", path: "/myaccount" },
                { icon: Package, label: "My Orders", path: "/orders" },
                { icon: XCircle, label: "My Cancellations", path: "/cancellations" },
                { icon: Star, label: "My Reviews", path: "/reviews" },
              ].map(({ icon: Icon, label, path }) => (
                <Link
                  key={label}
                  to={path}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;