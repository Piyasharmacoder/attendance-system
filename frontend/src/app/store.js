import { configureStore } from '@reduxjs/toolkit';

// 🔐 Auth slice
import authReducer from './authSlice';

// 🔥 RTK Query base
import { apiSlice } from '../api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer, // user + token

    [apiSlice.reducerPath]: apiSlice.reducer, // API cache
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),

  devTools: true,
});