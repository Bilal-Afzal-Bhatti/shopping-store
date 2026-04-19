// src/redux/slices/cartSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
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
  synced: boolean;
  // ✅ tracks which item is currently being updated
  updatingItemId: string | null;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
  synced: false,
  updatingItemId: null,
};

// ─── Recalculate totals ───────────────────────────────────────────────────────
const recalculate = (items: CartItem[]) => ({
  totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
  totalPrice:    items.reduce((s, i) => s + i.price * i.quantity, 0),
});

// ─── fetchCart ────────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const res = await axiosInstance.get(`/cart/showcart?userId=${userId}`);
    return (res.data.items || []) as CartItem[];
  }
);

// ─── addToCartAsync ───────────────────────────────────────────────────────────
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (product: Product, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // 👈 Get userId from storage
    
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const res = await axiosInstance.post('/cart/add', {
      userId, // 👈 MUST send userId to the backend
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    if (!res.data.success) return rejectWithValue(res.data.message);
    return product;
  }
);

// ─── updateQuantityAsync ──────────────────────────────────────────────────────
// ✅ PATCH-style optimization — only sends itemId + new quantity
// No need to send the whole cart — backend updates one subdocument
export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantityAsync',
  async (
    { itemId, quantity }: { itemId: string; quantity: number },
    { rejectWithValue }
  ) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return rejectWithValue('Not authenticated');

    const res = await axiosInstance.put(`/cart/update/${userId}/${itemId}`, { quantity });
    if (!res.data.success) return rejectWithValue(res.data.message);
    return { itemId, quantity };
  }
);

// ─── removeFromCartAsync ──────────────────────────────────────────────────────
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (itemId: string, { rejectWithValue }) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return rejectWithValue('Not authenticated');

    const res = await axiosInstance.delete(`/cart/delete/${userId}/${itemId}`);
    if (!res.data.success) return rejectWithValue('Delete failed');
    return itemId;
  }
);

// ─── clearCartAsync ───────────────────────────────────────────────────────────
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return rejectWithValue('Not authenticated');
    await axiosInstance.delete(`/cart/clear/${userId}`);
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart(state) {
      state.items         = [];
      state.totalQuantity = 0;
      state.totalPrice    = 0;
      state.synced        = false;
    },

    // ✅ optimistic local quantity change — instant UI, no spinner
    // Call this on every +/- click, then call updateQuantityAsync on "Update" button
    setItemQuantity(state, action: { payload: { itemId: string; quantity: number } }) {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((i) => i._id === itemId);
      if (item && quantity >= 1) item.quantity = quantity;
      Object.assign(state, recalculate(state.items));
    },
  },

  extraReducers: (builder) => {
    // ── fetchCart ────────────────────────────────────────────────────────
    builder
      .addCase(fetchCart.pending,   (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items   = action.payload;
        state.loading = false;
        state.synced  = true;
        Object.assign(state, recalculate(state.items));
      })
      .addCase(fetchCart.rejected,  (state) => { state.loading = false; });

    // ── addToCartAsync ───────────────────────────────────────────────────
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      const product      = action.payload as Product;
      const existingItem = state.items.find(
        (i) => i.productId === product._id || i._id === product._id
      );
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

    // ── updateQuantityAsync — only updates the one item ──────────────────
    builder
      .addCase(updateQuantityAsync.pending, (state, action) => {
        // ✅ track which specific item is saving — show spinner only on that row
        state.updatingItemId = action.meta.arg.itemId;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        const { itemId, quantity } = action.payload!;
        const item = state.items.find((i) => i._id === itemId);
        if (item) item.quantity = quantity;
        state.updatingItemId = null;
        Object.assign(state, recalculate(state.items));
      })
      .addCase(updateQuantityAsync.rejected, (state) => {
        state.updatingItemId = null;
      });

    // ── removeFromCartAsync ──────────────────────────────────────────────
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      Object.assign(state, recalculate(state.items));
    });

    // ── clearCartAsync ───────────────────────────────────────────────────
    builder.addCase(clearCartAsync.fulfilled, (state) => {
      state.items         = [];
      state.totalQuantity = 0;
      state.totalPrice    = 0;
      state.synced        = false;
    });
  },
});

export const { clearCart, setItemQuantity } = cartSlice.actions;
export default cartSlice.reducer;