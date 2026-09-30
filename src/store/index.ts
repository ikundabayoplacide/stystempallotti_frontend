import { configureStore } from "@reduxjs/toolkit";
import { annualLeaveApi } from "./services/annualLeaveService";
import { authApi } from "./services/authService";
import { bindingStockApi } from "./services/bindingStockService";
import { boutiqueApi } from "./services/boutiqueService";
import { boutiqueStockApi } from "./services/boutiqueStockService";
import { casualWorkersApi } from "./services/casualWorkersService";
import { customersApi } from "./services/customersService";
import { departmentSamplesApi } from "./services/departmentSamplesService";
import { departmentsApi } from "./services/departmentsService";
import { employeesApi } from "./services/employeesService";
import { extraWorkersApi } from "./services/extraWorkersService";
import { generalStockApi } from "./services/generalStockService";
import { hobeApi } from "./services/hobeService";
import { invoicesApi } from "./services/invoicesService";
import { jobAssignmentsApi } from "./services/jobAssignmentsService";
import { jobDocumentsApi } from "./services/jobDocumentsService";
import { jobSpecsApi } from "./services/jobSpecsService";
import { jobsApi } from "./services/jobsService";
import { leaveApi } from "./services/leaveService";
import { machinesApi } from "./services/machinesService";
import { notificationsApi } from "./services/notificationsService";
import { outstandsApi } from "./services/outstandsService";
import { overtimeApi } from "./services/overtimeService";
import { paymentsApi } from "./services/paymentsService";
import { payrollApi } from "./services/payrollService";
import { permissionsApi } from "./services/permissionsService";
import { procurementApi } from "./services/procurementService";
import { proformasApi } from "./services/proformasService";
import { receptionRequestsApi } from "./services/receptionRequestsService";
import { recoveryApi } from "./services/recoveryService";
import { reportsApi } from "./services/reportsService";
import { rolesApi } from "./services/rolesService";
import { sheetsApi } from "./services/sheetsService";
import { stockReportsApi } from "./services/stockReportsService";
import { stockRequestsApi } from "./services/stockRequestsService";
import { stockApi } from "./services/stockService";
import { usersApi } from "./services/usersService";
import { visitsApi } from "./services/visitsService";
import { withdrawalsApi } from "./services/withdrawalsService";
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
    [reportsApi.reducerPath]: reportsApi.reducer,
    [hobeApi.reducerPath]: hobeApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [recoveryApi.reducerPath]: recoveryApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [outstandsApi.reducerPath]: outstandsApi.reducer,
    [casualWorkersApi.reducerPath]: casualWorkersApi.reducer,
    [payrollApi.reducerPath]: payrollApi.reducer,
    [boutiqueStockApi.reducerPath]: boutiqueStockApi.reducer,
    [generalStockApi.reducerPath]: generalStockApi.reducer,
    [bindingStockApi.reducerPath]: bindingStockApi.reducer,
    [machinesApi.reducerPath]: machinesApi.reducer,
    [jobSpecsApi.reducerPath]: jobSpecsApi.reducer,
    [departmentSamplesApi.reducerPath]: departmentSamplesApi.reducer,
    [withdrawalsApi.reducerPath]: withdrawalsApi.reducer,
    [sheetsApi.reducerPath]: sheetsApi.reducer,
    [stockRequestsApi.reducerPath]: stockRequestsApi.reducer,
    [receptionRequestsApi.reducerPath]: receptionRequestsApi.reducer,
    [extraWorkersApi.reducerPath]: extraWorkersApi.reducer,
    [overtimeApi.reducerPath]: overtimeApi.reducer,
    [annualLeaveApi.reducerPath]: annualLeaveApi.reducer,
    [stockReportsApi.reducerPath]: stockReportsApi.reducer,
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
      .concat(reportsApi.middleware)
      .concat(hobeApi.middleware)
      .concat(notificationsApi.middleware)
      .concat(recoveryApi.middleware)
      .concat(leaveApi.middleware)
      .concat(outstandsApi.middleware)
      .concat(casualWorkersApi.middleware)
      .concat(payrollApi.middleware)
      .concat(boutiqueStockApi.middleware)
      .concat(generalStockApi.middleware)
      .concat(bindingStockApi.middleware)
      .concat(machinesApi.middleware)
      .concat(jobSpecsApi.middleware)
      .concat(departmentSamplesApi.middleware)
      .concat(withdrawalsApi.middleware)
      .concat(sheetsApi.middleware)
      .concat(stockRequestsApi.middleware)
      .concat(receptionRequestsApi.middleware)
      .concat(extraWorkersApi.middleware)
      .concat(overtimeApi.middleware)
      .concat(annualLeaveApi.middleware)
      .concat(stockReportsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
