import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/authService";
import { boutiqueApi } from "./services/boutiqueService";
import { customersApi } from "./services/customersService";
import { departmentsApi } from "./services/departmentsService";
import { employeesApi } from "./services/employeesService";
import { invoicesApi } from "./services/invoicesService";
import { jobAssignmentsApi } from "./services/jobAssignmentsService";
import { jobDocumentsApi } from "./services/jobDocumentsService";
import { jobsApi } from "./services/jobsService";
import { paymentsApi } from "./services/paymentsService";
import { permissionsApi } from "./services/permissionsService";
import { procurementApi } from "./services/procurementService";
import { proformasApi } from "./services/proformasService";
import { rolesApi } from "./services/rolesService";
import { stockApi } from "./services/stockService";
import { usersApi } from "./services/usersService";
import { visitsApi } from "./services/visitsService";
import { materialRequestsApi } from "./services/materialRequestsService";
import { reportsApi } from "./services/reportsService";
import { hobeApi } from "./services/hobeService";
import { notificationsApi } from "./services/notificationsService";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [jobAssignmentsApi.reducerPath]: jobAssignmentsApi.reducer,
    [jobDocumentsApi.reducerPath]: jobDocumentsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [procurementApi.reducerPath]: procurementApi.reducer,
    [boutiqueApi.reducerPath]: boutiqueApi.reducer,
    [stockApi.reducerPath]: stockApi.reducer,
    [proformasApi.reducerPath]: proformasApi.reducer,
    [visitsApi.reducerPath]: visitsApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [materialRequestsApi.reducerPath]: materialRequestsApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    [hobeApi.reducerPath]: hobeApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(departmentsApi.middleware)
      .concat(customersApi.middleware)
      .concat(jobsApi.middleware)
      .concat(jobAssignmentsApi.middleware)
      .concat(jobDocumentsApi.middleware)
      .concat(paymentsApi.middleware)
      .concat(procurementApi.middleware)
      .concat(boutiqueApi.middleware)
      .concat(stockApi.middleware)
      .concat(proformasApi.middleware)
      .concat(visitsApi.middleware)
      .concat(permissionsApi.middleware)
      .concat(rolesApi.middleware)
      .concat(invoicesApi.middleware)
      .concat(employeesApi.middleware)
      .concat(materialRequestsApi.middleware)
      .concat(reportsApi.middleware)
      .concat(hobeApi.middleware)
      .concat(notificationsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
