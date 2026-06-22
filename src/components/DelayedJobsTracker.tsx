import { useMemo } from "react";
import { HiOutlineClock, HiOutlineExclamationCircle } from "react-icons/hi";
import { Card } from "./ui";
import { useGetJobsQuery } from "../store/services/jobsService";

const priorityColor: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-red-500 text-white",
  normal: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
};

export default function DelayedJobsTracker() {
  const { data: jobsData } = useGetJobsQuery({ limit: 500 });
  const jobs = jobsData?.jobs ?? [];

  const delayedJobs = useMemo(() => {
    const now = new Date();
    return jobs
      .filter(
        (j) =>
          j.dueDate &&
          new Date(j.dueDate) < now &&
          j.status !== "completed" &&
          j.status !== "delivered" &&
          j.status !== "rejected"
      )
      .map((j) => ({
        id: j.jobNumber,
        title: j.title,
        client: j.customer?.name ?? "—",
        deadline: j.dueDate!.slice(0, 10),
        daysOverdue: Math.floor((now.getTime() - new Date(j.dueDate!).getTime()) / 86400000),
        currentDepartment: j.department?.name ?? "—",
        priority: j.priority,
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [jobs]);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineClock className="w-5 h-5 text-red-500" />
        <h2 className="font-bold text-secondary-100">Delayed Jobs</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
          {delayedJobs.length} Overdue
        </span>
      </div>
      <div className="space-y-3">
        {delayedJobs.length === 0 && <p className="text-sm text-custom-700 text-center py-4">No delayed jobs 🎉</p>}
        {delayedJobs.slice(0, 5).map((job) => (
          <div key={job.id} className="p-3 rounded-xl border-2 border-red-300 bg-red-50 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-bold text-primary-500">{job.id}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority] ?? "bg-gray-200 text-gray-700"}`}>
                {job.priority}
              </span>
            </div>
            <h3 className="text-sm font-bold text-secondary-100 mb-1">{job.title}</h3>
            <p className="text-xs text-custom-700 mb-2">{job.client}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-custom-700">Deadline: <span className="font-semibold text-red-600">{job.deadline}</span></span>
              <span className="font-bold text-red-600">{job.daysOverdue} days overdue</span>
            </div>
            <div className="mt-2 text-xs bg-white px-2 py-1 rounded-lg">
              📍 Currently in: <span className="font-semibold">{job.currentDepartment}</span>
            </div>
          </div>
        ))}
      </div>
      {delayedJobs.length > 5 && (
        <p className="text-xs text-custom-700 text-center mt-3">+{delayedJobs.length - 5} more delayed jobs</p>
      )}
    </Card>
  );
}
