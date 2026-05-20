import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authService";
import { boutiqueApi } from "./services/boutiqueService";
import { customersApi } from "./services/customersService";
import { departmentsApi } from "./services/departmentsService";
import { jobsApi } from "./services/jobsService";
import { paymentsApi } from "./services/paymentsService";
import { quotationsApi } from "./services/quotationsService";
import { stockApi } from "./services/stockService";
import { usersApi } from "./services/usersService";
import { visitsApi } from "./services/visitsService";
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
    [boutiqueApi.reducerPath]: boutiqueApi.reducer,
    [stockApi.reducerPath]: stockApi.reducer,
    [quotationsApi.reducerPath]: quotationsApi.reducer,
    [visitsApi.reducerPath]: visitsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(departmentsApi.middleware)
      .concat(customersApi.middleware)
      .concat(jobsApi.middleware)
      .concat(paymentsApi.middleware)
      .concat(boutiqueApi.middleware)
      .concat(stockApi.middleware)
      .concat(quotationsApi.middleware)
      .concat(visitsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
