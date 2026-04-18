// src/cart.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Trash2, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './redux/store';
import {
  fetchCart,
  removeFromCartAsync,
  updateQuantityAsync,
} from './redux/slices/cartSlice';

const Cart: React.FC = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();
  const { items, totalPrice, loading, synced } = useSelector((s: RootState) => s.cart);

  const [showModal, setShowModal] = useState(false);

  // Fetch from backend on mount — only if not already synced
  useEffect(() => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) { navigate('/login'); return; }
    if (!synced) dispatch(fetchCart());
  }, []);

  const handleQuantityChange = (itemId: string, type: 'inc' | 'dec', currentQty: number) => {
    const newQty = type === 'inc' ? currentQty + 1 : currentQty > 1 ? currentQty - 1 : 1;
    if (newQty === currentQty) return;
    dispatch(updateQuantityAsync({ itemId, quantity: newQty }));
  };

  const handleDelete = (itemId: string) => {
    dispatch(removeFromCartAsync(itemId));
  };

  const handleCheckout = () => {
    if (items.length === 0) { setShowModal(true); return; }
    navigate('/check_out');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-gray-600">
      Loading your cart...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-800 px-6 md:px-20 py-16">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-8 flex justify-between items-center">
        <div>
          <Link to="/" className="hover:text-blue-600 font-medium">HOME</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-blue-600 font-semibold">CART</span>
        </div>
        <Link to="/" className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition">
          ← Return to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items */}
        <div className="lg:col-span-2">
          {items.length > 0 ? (
            <>
              <div className="hidden lg:grid lg:grid-cols-4 bg-gray-100 font-semibold text-gray-700 py-3 px-6 rounded-md">
                <div>Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Subtotal</div>
              </div>

              <div className={`flex flex-col divide-y divide-gray-200 mt-4 ${items.length > 4 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
                {items.map((item) => (
                  <div key={item._id} className="grid grid-cols-1 md:grid-cols-4 items-center py-4 px-4 md:px-6 hover:bg-gray-50 transition gap-2 md:gap-0">

                    {/* Product */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-contain bg-gray-50 rounded-md mx-auto md:mx-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image'; }}
                      />
                      <span className="font-medium text-sm">{item.name}</span>
                      <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 transition p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-center text-sm">${item.price.toFixed(2)}</div>

                    {/* Quantity */}
                    <div className="flex justify-center items-center">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <input
                          type="number"
                          readOnly
                          value={item.quantity}
                          className="w-12 text-center py-1 text-sm outline-none"
                        />
                        <div className="flex flex-col border-l border-gray-300">
                          <button onClick={() => handleQuantityChange(item._id, 'inc', item.quantity)} className="px-1 hover:bg-gray-200">
                            <ChevronUp size={12} />
                          </button>
                          <button onClick={() => handleQuantityChange(item._id, 'dec', item.quantity)} className="px-1 hover:bg-gray-200">
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-center font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-4">Your cart is empty</p>
              <Link to="/" className="inline-block px-5 py-2 bg-[#DB4444] text-white rounded-md hover:bg-[#c33d3d] transition">
                Return to Shop
              </Link>
            </div>
          )}
        </div>

        {/* Cart Total */}
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 h-fit shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Cart Total</h2>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Subtotal</span>
            <span className="font-medium">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span>Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-lg font-semibold py-3">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full mt-4 px-5 py-3 bg-[#DB4444] text-white rounded-md font-medium hover:bg-[#c33d3d] transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Empty cart modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <h3 className="text-lg font-semibold mb-2">Your cart is empty!</h3>
            <p className="text-gray-600 mb-4">Add some products before checking out.</p>
            <Link to="/" onClick={() => setShowModal(false)} className="inline-block px-5 py-2 bg-[#DB4444] text-white rounded-md hover:bg-[#c33d3d] transition">
              Return to Shop
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;