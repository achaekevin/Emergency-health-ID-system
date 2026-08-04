import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import mobileReducer from './mobileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    mobile: mobileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
