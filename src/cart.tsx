import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartUpdated, setCartUpdated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setCartTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.warn("⚠️ No user logged in. Redirecting...");
          navigate("/login");
          return; // 🧭 stop execution here
        } else {
          navigate("/cart");
        }
        console.warn(" USER ID", userId);
        const res = await fetch(
          `http://192.168.18.40:5731/api/cart/showcart/?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setCartItems(data.items || []);
        } else {
          console.error("Error fetching cart:", data);
          setCartItems([]);
        }
      } catch (err) {
        console.error("Error:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleQuantityChange = (id: string, type: "inc" | "dec") => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
            ...item,
            quantity:
              type === "inc"
                ? (item.quantity || 1) + 1
                : item.quantity > 1
                  ? item.quantity - 1
                  : 1,
          }
          : item
      )
    );
    setCartUpdated(false);
  };


  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = 0;
  const orderTotal = subtotal + shipping;

  const handleDeleteItem = async (itemId: string) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) return alert("User not logged in!");
    console.warn(" DELETE ITEM ID", itemId);
    try {
      const res = await fetch(
        `http://10.16.21.240:5731/api/cart/delete/${userId}/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to delete item:", data);
        return;
      }

      // Remove item from frontend state
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("❌ Failed to delete item:", error);
    }
  };
  // 🔹 UPDATE single Cart Item API
  const handleUpdateCart = async (itemId: string) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // take from frontend

    if (!token || !userId) return alert("User not logged in!");

    try {
      // Find the item to update
      const itemToUpdate = cartItems.find((item) => item._id === itemId);
      if (!itemToUpdate) return;

      // Prepare payload
      const updatedData = {
        quantity: itemToUpdate.quantity,
      };

      const res = await fetch(
        `http://192.168.18.40:5731/api/cart/update/${userId}/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Update the item total locally
        setCartItems((prev) =>
          prev.map((item) =>
            item._id === itemId
              ? { ...item, totalPrice: item.price * item.quantity }
              : item
          )
        );

        // Update cart total
        const newTotal = cartItems.reduce(
          (sum, item) =>
            sum + (item._id === itemId ? item.price * item.quantity : item.price * item.quantity),
          0
        );
        setCartTotal(newTotal);

        setCartUpdated(true);
      } else {
        console.error("❌ Failed to update cart:", data.message);
      }
    } catch (err) {
      console.error("❌ Error updating cart:", err);
    }
  };


  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setShowModal(true);
      return;
    }
    navigate("/check_out");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading your cart...
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 md:px-20 py-16">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-8 flex justify-between items-center">
        <div>
          <Link to="/" className="hover:text-blue-600 font-medium">
            HOME
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-blue-600 font-semibold">CART</span>
        </div>

        <Link
          to="/"
          className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
        >
          ← Return to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🛒 Cart Items Section */}
        <div className="lg:col-span-2">
          {cartItems.length > 0 ? (
            <>
            <div className="hidden lg:grid lg:grid-cols-4 bg-gray-100 font-semibold text-gray-700 py-3 px-6 rounded-md">
              <div>Product</div>
              <div className="text-center">Price</div>
              <div className="text-center">Quantity</div>
              <div className="text-center">Subtotal</div>
            </div>

              {/* Scrollable list */}
              <div
                className={`flex flex-col divide-y divide-gray-200 mt-4 ${cartItems.length > 4 ? "max-h-[400px] overflow-y-auto scrollbar-thin" : ""
                  }`}
              >
                {cartItems.map((item) => (
                 <div
    key={item._id}
    className="grid grid-cols-1 md:grid-cols-4 items-center py-4 px-4 md:px-6 hover:bg-gray-50 transition gap-2 md:gap-0"
  >
   {/* Product */}
<div className="flex  flex-col md:flex-row md:items-center gap-2 md:gap-4">
  <img
    src={item.image}
    alt={item.name}
    className="w-full max-w-[150px]  h-auto md:w-20 md:h-20 object-cover rounded-md mx-auto md:mx-0"
  />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        {item.discount && (
                          <span className="text-green-600 text-sm">
                            {item.discount}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        aria-label="Delete item"
                        className="text-red-500 hover:text-red-700 transition mt-1 md:mt-0 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mt-2 md:mt-0 text-center">
                      ${item.price}
                    </div>

                    {/* Quantity */}
                    <div className="flex justify-center items-center mt-2 md:mt-0">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <input
                          type="number"
                          readOnly
                          value={item.quantity || 1}
                          className="w-12 text-center py-1 text-sm outline-none"
                        />
                        <div className="flex flex-col border-l border-gray-300">
                          <button
                            onClick={() => handleQuantityChange(item._id, "inc")}
                            className="px-1 hover:bg-gray-200"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => handleQuantityChange(item._id, "dec")}
                            className="px-1 hover:bg-gray-200"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-center font-semibold text-gray-900 mt-2 md:mt-0">
                      ${item.price * (item.quantity || 1)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500 text-lg">
              Your cart is empty 😢
              <br />
              <Link
                to="/"
                className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Return to Shop
              </Link>
            </div>
          )}
        </div>

        {/* 💰 Cart Total Box */}
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 h-fit shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Cart Total
          </h2>

          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal}</span>
          </div>

          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>

          <div className="flex justify-between text-lg font-semibold py-3">
            <span>Total</span>
            <span>${orderTotal}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => cartItems.forEach(item => handleUpdateCart(item._id))}
              className="flex-1 px-5 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition"
            >
              Update Cart
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              Checkout
            </button>
          </div>

          {cartUpdated && (
            <p className="text-sm text-green-600 mt-2 text-center">
              ✅ Cart updated successfully!
            </p>
          )}
        </div>
      </div>

      {/* Empty cart modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Your cart is empty!
            </h3>
            <p className="text-gray-600 mb-4">
              Looks like you haven’t added any items yet. Return to the shop and
              grab your favorite products! 🎉
            </p>
            <Link
              to="/"
              onClick={() => setShowModal(false)}
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
