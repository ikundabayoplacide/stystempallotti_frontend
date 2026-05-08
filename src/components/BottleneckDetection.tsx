import { HiOutlineExclamation, HiOutlineTrendingDown } from "react-icons/hi";
import { Card } from "./ui";

interface Bottleneck {
  department: string;
  queuedJobs: number;
  avgProcessingTime: string;
  utilizationRate: number;
  severity: "high" | "medium" | "low";
  recommendation: string;
}

const bottlenecks: Bottleneck[] = [
  {
    department: "Printing",
    queuedJobs: 12,
    avgProcessingTime: "4.5 hours",
    utilizationRate: 95,
    severity: "high",
    recommendation: "Consider adding overtime or temporary staff",
  },
  {
    department: "Binding",
    queuedJobs: 8,
    avgProcessingTime: "3.2 hours",
    utilizationRate: 85,
    severity: "medium",
    recommendation: "Monitor closely, may need additional resources",
  },
  {
    department: "Composition",
    queuedJobs: 6,
    avgProcessingTime: "5.1 hours",
    utilizationRate: 78,
    severity: "medium",
    recommendation: "Optimize workflow to reduce processing time",
  },
];

export default function BottleneckDetection() {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineTrendingDown className="w-5 h-5 text-orange-500" />
        <h2 className="font-bold text-secondary-100">Bottleneck Detection</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
          {bottlenecks.filter((b) => b.severity === "high").length} Critical
        </span>
      </div>
      <div className="space-y-3">
        {bottlenecks.map((bottleneck) => (
          <div
            key={bottleneck.department}
            className={`p-3 rounded-xl border-2 transition-all ${
              bottleneck.severity === "high"
                ? "border-red-300 bg-red-50"
                : "border-orange-300 bg-orange-50"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <HiOutlineExclamation
                  className={`w-4 h-4 flex-shrink-0 ${
                    bottleneck.severity === "high" ? "text-red-600" : "text-orange-600"
                  }`}
                />
                <h3 className="text-sm font-bold text-secondary-100">{bottleneck.department}</h3>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  bottleneck.severity === "high"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {bottleneck.utilizationRate}% Load
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
              <div>
                <span className="text-custom-700">Queued Jobs:</span>
                <span className="ml-1 font-bold text-secondary-100">{bottleneck.queuedJobs}</span>
              </div>
              <div>
                <span className="text-custom-700">Avg Time:</span>
                <span className="ml-1 font-bold text-secondary-100">
                  {bottleneck.avgProcessingTime}
                </span>
              </div>
            </div>
            <div className="w-full bg-custom-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full ${
                  bottleneck.severity === "high" ? "bg-red-500" : "bg-orange-500"
                }`}
                style={{ width: `${bottleneck.utilizationRate}%` }}
              />
            </div>
            <div className="text-xs bg-white p-2 rounded-lg">
              <span className="font-semibold text-custom-700">💡 Recommendation:</span>
              <p className="text-secondary-100 mt-1">{bottleneck.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-semibold">
        View Detailed Analysis
      </button>
    </Card>
  );
}
