// src/cart.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // ✅ useLocation added
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './redux/store';
import {
  fetchCart,
  removeFromCartAsync,
  updateQuantityAsync,
  setItemQuantity,
} from './redux/slices/cartSlice';

const Cart: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch<AppDispatch>();

  const { items, totalPrice, loading, updatingItemId } = useSelector(
    (s: RootState) => s.cart
  );

  // ✅ highlight the product just added from view_item
  const addedProductId = (location.state as any)?.addedProductId as string | undefined;

  const [showModal, setShowModal] = useState(false);

  // useEffect(() => {
  //   const token  = localStorage.getItem('token');
  //   const userId = localStorage.getItem('userId');
  //   if (!token || !userId) { navigate('/login'); return; }
  //   if (!synced) dispatch(fetchCart());
  // }, []);
  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) { navigate('/login'); return; }

  // Force fetch every time we enter the cart to sync with backend
  dispatch(fetchCart());
}, [dispatch]);
// cart.tsx — add inside useEffect
useEffect(() => {
  console.log('🛒 items from backend:', items);
}, [items]);
  // const handleQtyChange = (itemId: string, type: 'inc' | 'dec', current: number) => {
  //   const newQty = type === 'inc' ? current + 1 : current > 1 ? current - 1 : 1;
  //   dispatch(setItemQuantity({ itemId, quantity: newQty }));
  // };
  // cart.tsx
const handleQtyChange = (itemId: string, type: 'inc' | 'dec', current: number) => {
  const newQty = type === 'inc' ? current + 1 : current > 1 ? current - 1 : 1;
  if (newQty === current) return;

  // ✅ update UI instantly
  dispatch(setItemQuantity({ itemId, quantity: newQty }));

  // ✅ sync to backend immediately — no Update button needed
  dispatch(updateQuantityAsync({ itemId, quantity: newQty }));
};

  // const handleUpdate = (itemId: string, quantity: number) => {
  //   dispatch(updateQuantityAsync({ itemId, quantity }));
  // };

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
              <div className="hidden lg:grid lg:grid-cols-5 bg-gray-100 font-semibold text-gray-700 py-3 px-6 rounded-md text-sm">
                <div className="col-span-2">Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Subtotal</div>
              </div>

              <div className={`flex flex-col divide-y divide-gray-200 mt-4 ${items.length > 4 ? 'max-h-[500px] overflow-y-auto' : ''}`}>
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`grid grid-cols-1 lg:grid-cols-5 items-center py-5 px-4 md:px-6 gap-3 lg:gap-0 transition-all duration-500 ${
                      addedProductId === item.productId
                        ? 'bg-green-50 border-l-4 border-green-400' // ✅ highlight newly added
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Product */}
                    <div className="col-span-2 flex items-center gap-3">
                      <img
                        src={item.image} alt={item.name}
                        className="w-16 h-16 object-contain bg-gray-50 rounded-md shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=?'; }}
                      />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-sm truncate">{item.name}</span>
                        <button onClick={() => handleDelete(item._id)}
                          className="text-red-400 hover:text-red-600 transition text-xs flex items-center gap-1 w-fit">
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center text-sm font-medium">
                      ${item.price.toFixed(2)}
                    </div>

                  {/* Quantity — auto syncs on every click */}
<div className="flex flex-col items-center gap-1">
  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
    <button
      onClick={() => handleQtyChange(item._id, 'dec', item.quantity)}
      disabled={updatingItemId === item._id}
      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition text-gray-600 disabled:opacity-40"
    >
      <Minus size={12} />
    </button>
    <span className="w-10 text-center text-sm font-semibold">
      {item.quantity}
    </span>
    <button
      onClick={() => handleQtyChange(item._id, 'inc', item.quantity)}
      disabled={updatingItemId === item._id}
      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition text-gray-600 disabled:opacity-40"
    >
      <Plus size={12} />
    </button>
  </div>
  {/* ✅ show saving indicator instead of Update button */}
  {updatingItemId === item._id && (
    <span className="text-[10px] text-gray-400 font-medium">Saving…</span>
  )}
</div>
                    {/* Subtotal */}
                    <div className="text-center font-bold text-gray-900">
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
        <div className="border border-gray-300 rounded-xl p-6 bg-gray-50 h-fit shadow-sm">
          <h2 className="text-lg font-bold mb-4">Cart Total</h2>
          <div className="flex justify-between border-b border-gray-200 py-2 text-sm">
            <span>Subtotal</span>
            <span className="font-medium">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2 text-sm">
            <span>Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-base font-bold py-3">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout}
            className="w-full mt-4 py-3 bg-[#DB4444] text-white rounded-lg font-semibold
                       hover:bg-[#c33d3d] active:scale-95 transition">
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Empty cart modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center shadow-xl">
            <h3 className="text-lg font-bold mb-2">Your cart is empty!</h3>
            <p className="text-gray-500 text-sm mb-4">Add some products before checking out.</p>
            <Link to="/" onClick={() => setShowModal(false)}
              className="inline-block px-5 py-2 bg-[#DB4444] text-white rounded-lg hover:bg-[#c33d3d] transition text-sm font-medium">
              Return to Shop
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;