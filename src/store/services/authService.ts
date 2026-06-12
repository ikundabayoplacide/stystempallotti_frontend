import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

// Matches exactly what the backend returns
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      departmentId?: string | null;
    };
  };
}

export type UserRole =
  | "ADMIN"
  | "RECEPTIONIST"
  | "SALES"
  | "DAF"
  | "ACCOUNTANT"
  | "PRODUCTION_MANAGER"
  | "STOCK"
  | "SUPERVISOR"
  | "WORKER"
  | "HR"
  | "HOBE";

// ─── API Service ──────────────────────────────────────────────────────────────

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      // Attach the token to every request automatically if it exists
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Auto-generated hook — use this in your component
export const { useLoginMutation } = authApi;
