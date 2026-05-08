import { useState } from "react";
import {
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlineClipboardList,
    HiOutlineClock,
} from "react-icons/hi";
import { Card } from "../../components/ui";
import type { JobStatus } from "../../types/JobStatus";
import { getNextStatuses, jobStatusConfig } from "../../types/JobStatus";

interface ProductionDepartmentDashboardProps {
  departmentName: string;
  departmentDescription: string;
}

interface Job {
  id: string;
  title: string;
  client: string;
  deadline: string;
  status: JobStatus;
  priority: "High" | "Medium" | "Low";
}

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

export default function ProductionDepartmentDashboard({
  departmentName,
  departmentDescription,
}: ProductionDepartmentDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "JOB-001",
      title: "Print 500 brochures",
      client: "ABC Corp",
      deadline: "2026-05-02",
      status: "in-printing",
      priority: "High",
    },
    {
      id: "JOB-005",
      title: "Print 300 flyers",
      client: "Bank D",
      deadline: "2026-05-04",
      status: "in-printing",
      priority: "High",
    },
    {
      id: "JOB-010",
      title: "Marketing materials",
      client: "Retail Store",
      deadline: "2026-05-06",
      status: "in-printing",
      priority: "Medium",
    },
  ]);

  const handleHandoff = (jobId: string) => {
    setJobs(
      jobs.map((job) => {
        if (job.id === jobId) {
          const nextStatuses = getNextStatuses(job.status);
          if (nextStatuses.length > 0) {
            return { ...job, status: nextStatuses[0] };
          }
        }
        return job;
      })
    );
  };

  const kpis = [
    {
      label: "Assigned Jobs",
      value: jobs.length.toString(),
      icon: HiOutlineClipboardList,
      color: "text-primary-500",
      bg: "bg-primary-100",
    },
    {
      label: "In Progress",
      value: jobs.filter((j) => j.status === "in-printing").length.toString(),
      icon: HiOutlineClock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Completed Today",
      value: "3",
      icon: HiOutlineCheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
          {departmentName} Dashboard
        </h1>
        <p className="text-sm text-custom-700 mt-1">
          {departmentDescription} — Monday, May 4, 2026
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="!p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              <p className="text-2xl font-bold text-secondary-100">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-bold text-secondary-100 mb-4">My Jobs</h2>
        <div className="space-y-3">
          {jobs.map((job) => {
            const statusCfg = jobStatusConfig[job.status];
            const nextStatuses = getNextStatuses(job.status);
            const canHandoff = nextStatuses.length > 0;

            return (
              <div
                key={job.id}
                className="p-4 rounded-xl border-2 border-custom-300 hover:border-primary-400 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-primary-500">{job.id}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority]}`}
                      >
                        {job.priority}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusCfg.bgColor} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-secondary-100">{job.title}</h3>
                    <div className="flex gap-4 text-xs text-custom-700">
                      <span>Client: {job.client}</span>
                      <span>•</span>
                      <span>Deadline: {job.deadline}</span>
                    </div>
                  </div>
                  {canHandoff && (
                    <button
                      onClick={() => handleHandoff(job.id)}
                      className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                      Complete & Handoff
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
