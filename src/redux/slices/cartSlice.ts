// src/redux/slices/cartSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '../../api/productsApi';

export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  loading: boolean;
  synced: boolean; // ← true once fetched from backend
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  synced: false,
};

// ─── Recalculate totals helper ────────────────────────────────────────────────
const recalculate = (items: CartItem[]) => ({
  totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
  totalPrice:    items.reduce((s, i) => s + i.price * i.quantity, 0),
});

// ─── Async: Fetch cart from backend ──────────────────────────────────────────
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  const token  = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return rejectWithValue('Not authenticated');

  const res = await fetch(
    `https://shoppingstore-backend.vercel.app/api/cart/showcart/?userId=${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return (data.items || []) as CartItem[];
});

// ─── Async: Add to backend cart ───────────────────────────────────────────────
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (product: Product, { rejectWithValue }) => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const res = await fetch('https://shoppingstore-backend.vercel.app/api/cart/add', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId,
        productId: product._id,
        name:      product.name,
        price:     product.price,
        image:     product.image,
        quantity:  1,
      }),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message);
    return product;
  }
);

// ─── Async: Update quantity in backend ───────────────────────────────────────
export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantityAsync',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const res = await fetch(
      `https://shoppingstore-backend.vercel.app/api/cart/update/${userId}/${itemId}`,
      {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      }
    );
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.message);
    return { itemId, quantity };
  }
);

// ─── Async: Remove from backend ──────────────────────────────────────────────
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (itemId: string, { rejectWithValue }) => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const res = await fetch(
      `https://shoppingstore-backend.vercel.app/api/cart/delete/${userId}/${itemId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return rejectWithValue('Delete failed');
    return itemId;
  }
);

// ─── Async: Clear cart ────────────────────────────────────────────────────────
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const res = await fetch(
      `https://shoppingstore-backend.vercel.app/api/cart/clear/${userId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return rejectWithValue('Clear failed');
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Sync-only clear (after order placed)
    clearCart(state) {
      state.items         = [];
      state.totalQuantity = 0;
      state.totalPrice    = 0;
      state.synced        = false;
    },
  },
  extraReducers: (builder) => {
    // ── fetchCart ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items   = action.payload;
        state.loading = false;
        state.synced  = true;
        Object.assign(state, recalculate(state.items));
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; });

    // ── addToCartAsync ─────────────────────────────────────────────────────
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      const product      = action.payload as Product;
      const existingItem = state.items.find((i) => i.productId === product._id || i._id === product._id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.items.push({
          _id:       product._id,
          productId: product._id,
          name:      product.name,
          price:     product.price,
          image:     product.image,
          quantity:  1,
          stock:     product.stock,
          category:  product.category,
        });
      }
      Object.assign(state, recalculate(state.items));
    });

    // ── updateQuantityAsync ────────────────────────────────────────────────
    builder.addCase(updateQuantityAsync.fulfilled, (state, action) => {
      const { itemId, quantity } = action.payload!;
      const item = state.items.find((i) => i._id === itemId);
      if (item) item.quantity = quantity;
      Object.assign(state, recalculate(state.items));
    });

    // ── removeFromCartAsync ────────────────────────────────────────────────
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      Object.assign(state, recalculate(state.items));
    });

    // ── clearCartAsync ─────────────────────────────────────────────────────
    builder.addCase(clearCartAsync.fulfilled, (state) => {
      state.items         = [];
      state.totalQuantity = 0;
      state.totalPrice    = 0;
      state.synced        = false;
    });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;