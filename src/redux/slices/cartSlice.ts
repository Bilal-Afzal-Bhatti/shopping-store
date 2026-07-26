// src/redux/slices/cartSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Product } from '../../api/productsApi';

export interface CartItem {
  _id?: string;
  productId: string;
  variantId: string; // 👈 Added variantId support
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  category?: string;
  discount?: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  loading: boolean;
  synced: boolean;
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
  totalPrice: items.reduce((s, i) => s + (i.price - (i.discount || 0)) * i.quantity, 0),
});

// ─── fetchCart ────────────────────────────────────────────────────────────────
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');
    
    const res = await axiosInstance.get(`/cart/showcart?userId=${userId}`);
    return (res.data.items || []) as CartItem[];
  }
);

// ─── addToCartAsync ───────────────────────────────────────────────────────────
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (
    { 
      product, 
      variantId, 
      quantity = 1,
      discount = 0 
    }: { 
      product: Product; 
      variantId: string; 
      quantity?: number;
      discount?: number;
    },
    { rejectWithValue }
  ) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return rejectWithValue('Not authenticated');

    const payload = {
      userId,
      productId: product._id,
      variantId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      discount
    };

    const res = await axiosInstance.post('/cart/add', payload);

    if (!res.data.success) {
      return rejectWithValue(res.data.message ?? 'Failed to add item');
    }
    
    // Return backend response data or structured fallback object
    return { 
      cartData: res.data.data, // Contains full cart document from backend if returned
      product, 
      variantId, 
      quantity, 
      discount 
    };
  }
);
// ─── updateQuantityAsync ──────────────────────────────────────────────────────
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
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.synced = false;
    },

    // ✅ Instant local update for +/- quantity buttons
    setItemQuantity(
      state, 
      action: { payload: { itemId: string; variantId?: string; quantity: number } }
    ) {
      const { itemId, variantId, quantity } = action.payload;
      
      const item = state.items.find((i) => {
        if (variantId) {
          return (i._id === itemId || i.productId === itemId) && i.variantId === variantId;
        }
        return i._id === itemId || i.productId === itemId;
      });

      if (item && quantity >= 1) {
        item.quantity = quantity;
      }
      Object.assign(state, recalculate(state.items));
    },
  },

  extraReducers: (builder) => {
    // ── fetchCart ────────────────────────────────────────────────────────
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.synced = true;
        Object.assign(state, recalculate(state.items));
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; });

    // ── addToCartAsync ───────────────────────────────────────────────────
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      const { product, variantId, quantity, discount } = action.payload;
      
      // Look for duplicate (Exact Product ID + Exact Variant ID match)
      const existingItem = state.items.find(
        (i) => i.productId === product._id && i.variantId === variantId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id: product._id,
          productId: product._id,
          variantId, // 👈 Added here
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          discount,
          stock: product.stock,
          category: product.category,
        });
      }
      Object.assign(state, recalculate(state.items));
    });

    // ── updateQuantityAsync ──────────────────────────────────────────────
    builder
      .addCase(updateQuantityAsync.pending, (state, action) => {
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
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      state.synced = false;
    });
  },
});

export const { clearCart, setItemQuantity } = cartSlice.actions;
export default cartSlice.reducer;