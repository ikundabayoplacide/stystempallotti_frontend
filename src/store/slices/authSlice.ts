import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoginResponse, UserRole } from "../services/authService";

// ─── State shape ──────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

// Rehydrate from localStorage so the user stays logged in on page refresh
const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!localStorage.getItem("token"),
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Called after a successful login API response
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      const { token, user } = action.payload.data;

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    // Called on logout
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
