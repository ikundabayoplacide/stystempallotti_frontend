import { HiOutlineClock, HiOutlineExclamationCircle } from "react-icons/hi";
import { Card } from "./ui";

interface DelayedJob {
  id: string;
  title: string;
  client: string;
  deadline: string;
  daysOverdue: number;
  currentDepartment: string;
  priority: "High" | "Medium" | "Low";
}

const delayedJobs: DelayedJob[] = [
  {
    id: "JOB-004",
    title: "Annual Report Printing",
    client: "School A",
    deadline: "2026-04-29",
    daysOverdue: 5,
    currentDepartment: "Printing",
    priority: "High",
  },
  {
    id: "JOB-012",
    title: "Marketing Brochures",
    client: "Retail Store",
    deadline: "2026-05-01",
    daysOverdue: 3,
    currentDepartment: "Binding",
    priority: "Medium",
  },
  {
    id: "JOB-018",
    title: "Business Cards",
    client: "Startup Co",
    deadline: "2026-05-02",
    daysOverdue: 2,
    currentDepartment: "Packaging",
    priority: "High",
  },
];

const priorityColor: Record<string, string> = {
  High: "bg-red-500 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-500 text-white",
};

export default function DelayedJobsTracker() {
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
        {delayedJobs.map((job) => (
          <div
            key={job.id}
            className="p-3 rounded-xl border-2 border-red-300 bg-red-50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineExclamationCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-bold text-primary-500">{job.id}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[job.priority]}`}
              >
                {job.priority}
              </span>
            </div>
            <h3 className="text-sm font-bold text-secondary-100 mb-1">{job.title}</h3>
            <p className="text-xs text-custom-700 mb-2">{job.client}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-custom-700">
                Deadline: <span className="font-semibold text-red-600">{job.deadline}</span>
              </span>
              <span className="font-bold text-red-600">{job.daysOverdue} days overdue</span>
            </div>
            <div className="mt-2 text-xs bg-white px-2 py-1 rounded-lg">
              📍 Currently in: <span className="font-semibold">{job.currentDepartment}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-semibold">
        View All Delayed Jobs
      </button>
    </Card>
  );
}
