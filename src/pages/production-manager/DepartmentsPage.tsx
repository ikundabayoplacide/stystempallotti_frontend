import { useState } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineUsers,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";
import { useGetDepartmentJobsQuery, useGetDepartmentByIdQuery, useGetDepartmentsQuery } from "../../store/services/departmentsService";
import type { Department } from "../../store/services/departmentsService";

// ─── Jobs Drawer ──────────────────────────────────────────────────────────────

function DepartmentDrawer({ dept, onClose }: { dept: Department; onClose: () => void }) {
  const { data: deptDetail, isLoading: loadingDetail } = useGetDepartmentByIdQuery(dept.id);
  const { data: jobs = [], isLoading: loadingJobs } = useGetDepartmentJobsQuery(dept.id);
  const workers = (deptDetail as any)?.employees ?? [];
  const [tab, setTab] = useState<"workers" | "jobs">("workers");

  return (
    <>
      <div className="fixed inset-0 bg-secondary-100/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-custom-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineUsers className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary-100">{dept.name}</h2>
              {dept.description && <p className="text-xs text-custom-700">{dept.description}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-custom-700 hover:text-secondary-100">
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4 border-b border-custom-300">
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-xs text-custom-700">Active Jobs</p>
            <p className="text-xl font-bold text-blue-600">{loadingJobs ? "…" : jobs.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-3">
            <p className="text-xs text-custom-700">Workers</p>
            <p className="text-xl font-bold text-green-600">{loadingDetail ? "…" : workers.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-custom-200 px-6">
          {(["workers", "jobs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                tab === t
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-custom-500 hover:text-secondary-100"
              }`}
            >
              {t === "workers" ? `Workers (${workers.length})` : `Jobs (${jobs.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Workers tab */}
          {tab === "workers" && (
            loadingDetail ? (
              <div className="flex items-center gap-2 text-custom-700 py-8 justify-center">
                <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading workers…</span>
              </div>
            ) : workers.length === 0 ? (
              <div className="text-center py-12">
                <HiOutlineUsers className="w-10 h-10 text-custom-300 mx-auto mb-2" />
                <p className="text-sm text-custom-700">No workers assigned to this department.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {workers.map((w) => (
                  <li key={w.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-custom-200 hover:bg-custom-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-600">{w.fullName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-secondary-100">{w.fullName}</p>
                        <p className="text-xs text-custom-500">{w.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        w.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {w.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-custom-400">{w.contractType?.replace("_", " ") ?? "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}

          {/* Jobs tab */}
          {tab === "jobs" && (
            loadingJobs ? (
              <div className="flex items-center gap-2 text-custom-700 py-8 justify-center">
                <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading jobs…</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <HiOutlineBriefcase className="w-10 h-10 text-custom-300 mx-auto mb-2" />
                <p className="text-sm text-custom-700">No jobs assigned to this department.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {jobs.map((job) => (
                  <li key={job.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-custom-200 hover:bg-custom-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <HiOutlineBriefcase className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="text-sm font-semibold text-secondary-100">{job.title}</span>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </>
  );
}

// ─── Worker count cell — fetches per-department detail ───────────────────────

function WorkerCountCell({ deptId }: { deptId: string }) {
  const { data, isLoading } = useGetDepartmentByIdQuery(deptId);
  const count = (data as any)?.employees?.length ?? 0;
  return (
    <span className="text-sm font-semibold text-green-600">
      {isLoading ? <HiOutlineRefresh className="w-3.5 h-3.5 animate-spin inline" /> : count}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DepartmentsPage() {
  const { data: departments = [], isLoading, isFetching, refetch } = useGetDepartmentsQuery();
  const [search, setSearch] = useState("");
  const [drawerDept, setDrawerDept] = useState<Department | null>(null);

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalWorkers    = departments.reduce((s, d) => s + (d.workers ?? 0), 0);
  const totalActiveJobs = departments.reduce((s, d) => s + (d.activeJobs ?? 0), 0);

  return (
    <DashboardLayout userRole="production-manager" userName="Production Manager" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Department Management</h1>
            <p className="text-sm text-custom-700 mt-1">Monitor production departments</p>
          </div>
          <button
            onClick={() => refetch()}
            className="self-start sm:self-auto p-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 text-custom-700 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Departments</p>
                <p className="text-xl font-bold text-secondary-100">{departments.length}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <HiOutlineUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Total Workers</p>
                <p className="text-xl font-bold text-blue-600">{totalWorkers}</p>
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-custom-700">Active Jobs</p>
                <p className="text-xl font-bold text-yellow-600">{totalActiveJobs}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-700" />
          <input
            type="text"
            placeholder="Search departments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500 text-sm"
          />
        </div>

        {/* Table */}
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-custom-100 border-b border-custom-300">
                <tr>
                  {["Department", "Description", "Active Jobs", "Workers", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-secondary-100 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-custom-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-custom-700">
                        <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading departments…</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-custom-700 text-sm">
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((dept) => (
                    <tr key={dept.id} className="hover:bg-custom-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <HiOutlineUsers className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-semibold text-secondary-100">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-custom-700">{dept.description ?? "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-yellow-600">{dept.activeJobs ?? 0}</span>
                      </td>
                      <td className="px-4 py-4">
                        <WorkerCountCell deptId={dept.id} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setDrawerDept(dept)}
                          className="p-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                          title="View Jobs"
                        >
                          <HiOutlineEye className="w-4 h-4 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Drawer */}
        {drawerDept && (
          <DepartmentDrawer dept={drawerDept} onClose={() => setDrawerDept(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
