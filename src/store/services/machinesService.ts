import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MachineStatus = "active" | "maintenance" | "inactive";

export interface Machine {
  id: string;
  name: string;
  description?: string;
  status: MachineStatus;
  note?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  // populated via include
  workers?: MachineWorker[];
}

export interface MachineWorker {
  id: string;          // employee id
  fullName: string;
  phoneNumber?: string;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  MachineAssignment?: { id: string; assignedAt: string; note?: string };
}

export interface MachineAssignment {
  id: string;
  machineId: string;
  employeeId: string;
  assignedById?: string;
  assignedAt: string;
  note?: string;
  machine?: Machine;
  employee?: MachineWorker;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const machinesApi = createApi({
  reducerPath: "machinesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Machine", "MachineAssignment"],
  endpoints: (builder) => ({

    // GET /machines
    getMachines: builder.query<Machine[], void>({
      query: () => "/machines",
      transformResponse: (res: any) => {
        const d = res?.data ?? res;
        return Array.isArray(d) ? d : [];
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Machine" as const, id })), { type: "Machine", id: "LIST" }]
          : [{ type: "Machine", id: "LIST" }],
    }),

    // GET /machines/:id
    getMachineById: builder.query<Machine, string>({
      query: (id) => `/machines/${id}`,
      transformResponse: (res: any) => res?.data ?? res,
      providesTags: (_r, _e, id) => [{ type: "Machine", id }],
    }),

    // POST /machines  (admin, supervisor)
    createMachine: builder.mutation<Machine, { name: string; description?: string; status?: MachineStatus; note?: string }>({
      query: (body) => ({ url: "/machines", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: [{ type: "Machine", id: "LIST" }],
    }),

    // PUT /machines/:id  (admin, supervisor)
    updateMachine: builder.mutation<Machine, { id: string; name?: string; description?: string; status?: MachineStatus; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/machines/${id}`, method: "PUT", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Machine", id }, { type: "Machine", id: "LIST" }],
    }),

    // DELETE /machines/:id  (admin only — sets inactive)
    deleteMachine: builder.mutation<void, string>({
      query: (id) => ({ url: `/machines/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Machine", id }, { type: "Machine", id: "LIST" }],
    }),

    // GET /machine-assignments/machine/:machineId
    getMachineAssignments: builder.query<MachineAssignment[], string>({
      query: (machineId) => `/machine-assignments/machine/${machineId}`,
      transformResponse: (res: any) => {
        // Backend returns { data: { machine, assignments: [...] } }
        const d = res?.data;
        if (d && Array.isArray(d.assignments)) return d.assignments;
        // Fallback: maybe it returns the array directly
        if (Array.isArray(d)) return d;
        return [];
      },
      providesTags: (_r, _e, machineId) => [{ type: "MachineAssignment", id: machineId }],
    }),

    // GET /machine-assignments/employee/:employeeId
    getEmployeeMachines: builder.query<MachineAssignment[], string>({
      query: (employeeId) => `/machine-assignments/employee/${employeeId}`,
      transformResponse: (res: any) => {
        const d = res?.data ?? res;
        return Array.isArray(d) ? d : [];
      },
      providesTags: (_r, _e, employeeId) => [{ type: "MachineAssignment", id: `emp-${employeeId}` }],
    }),

    // POST /machine-assignments  (admin, supervisor)
    assignWorker: builder.mutation<MachineAssignment, { machineId: string; employeeId: string; note?: string }>({
      query: (body) => ({ url: "/machine-assignments", method: "POST", body }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { machineId }) => [
        { type: "MachineAssignment", id: machineId },
        { type: "Machine", id: machineId },
        { type: "Machine", id: "LIST" },
      ],
    }),

    // DELETE /machine-assignments/:id  (admin, supervisor)
    removeWorker: builder.mutation<void, { assignmentId: string; machineId: string }>({
      query: ({ assignmentId }) => ({ url: `/machine-assignments/${assignmentId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { machineId }) => [
        { type: "MachineAssignment", id: machineId },
        { type: "Machine", id: machineId },
        { type: "Machine", id: "LIST" },
      ],
    }),

    // PUT /machine-assignments/:id/reassign  (admin, supervisor)
    reassignWorker: builder.mutation<MachineAssignment, { assignmentId: string; machineId: string; newEmployeeId: string }>({
      query: ({ assignmentId, newEmployeeId }) => ({
        url: `/machine-assignments/${assignmentId}/reassign`,
        method: "PUT",
        body: { newEmployeeId },
      }),
      transformResponse: (res: any) => res?.data ?? res,
      invalidatesTags: (_r, _e, { machineId }) => [
        { type: "MachineAssignment", id: machineId },
        { type: "Machine", id: machineId },
        { type: "Machine", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMachinesQuery,
  useGetMachineByIdQuery,
  useCreateMachineMutation,
  useUpdateMachineMutation,
  useDeleteMachineMutation,
  useGetMachineAssignmentsQuery,
  useGetEmployeeMachinesQuery,
  useAssignWorkerMutation,
  useRemoveWorkerMutation,
  useReassignWorkerMutation,
} = machinesApi;
