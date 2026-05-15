import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authService";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,           // manages token + user state
    [authApi.reducerPath]: authApi.reducer, // manages API cache
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware), // required for RTK Query
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
