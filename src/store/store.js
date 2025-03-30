import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Auth state
import doubtsReducer from "./doubtSlice"; // Doubts state

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doubts: doubtsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
