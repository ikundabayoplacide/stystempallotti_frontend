import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authService";
import { customersApi } from "./services/customersService";
import { departmentsApi } from "./services/departmentsService";
import { jobsApi } from "./services/jobsService";
import { paymentsApi } from "./services/paymentsService";
import { usersApi } from "./services/usersService";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(departmentsApi.middleware)
      .concat(customersApi.middleware)
      .concat(jobsApi.middleware)
      .concat(paymentsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
