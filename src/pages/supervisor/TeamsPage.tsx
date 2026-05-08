import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUsers
} from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Card } from "../../components/ui";

const teams = [
  {
    name: "Team A - Offset Printing",
    leader: "John Doe",
    members: 5,
    activeJobs: 7,
    completedToday: 3,
    efficiency: 94,
  },
  {
    name: "Team B - Digital Printing",
    leader: "Jane Smith",
    members: 4,
    activeJobs: 4,
    completedToday: 5,
    efficiency: 98,
  },
  {
    name: "Team C - Composition",
    leader: "Mike Johnson",
    members: 3,
    activeJobs: 5,
    completedToday: 2,
    efficiency: 87,
  },
  {
    name: "Team D - Binding & Packaging",
    leader: "Sarah Williams",
    members: 4,
    activeJobs: 6,
    completedToday: 4,
    efficiency: 91,
  },
];

const teamMembers = [
  { name: "John Doe", role: "Team Leader", team: "Team A", status: "Active", jobsToday: 3 },
  { name: "Alice Brown", role: "Printer", team: "Team A", status: "Active", jobsToday: 2 },
  { name: "Bob Wilson", role: "Printer", team: "Team A", status: "Active", jobsToday: 2 },
  { name: "Jane Smith", role: "Team Leader", team: "Team B", status: "Active", jobsToday: 5 },
  { name: "Charlie Davis", role: "Designer", team: "Team B", status: "Break", jobsToday: 1 },
  { name: "Mike Johnson", role: "Team Leader", team: "Team C", status: "Active", jobsToday: 2 },
  { name: "Emma Garcia", role: "Designer", team: "Team C", status: "Active", jobsToday: 3 },
  { name: "Sarah Williams", role: "Team Leader", team: "Team D", status: "Active", jobsToday: 4 },
];

export default function TeamsPage() {
  return (
    <DashboardLayout
      userRole="supervisor"
      userName="Production Supervisor"
      notificationCount={4}
    >
      <div className="space-y-8 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Team Management
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            Monitor team performance and manage assignments
          </p>
        </div>

        {/* Teams Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team.name} hoverable className="!p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-secondary-100 mb-1">{team.name}</h3>
                  <p className="text-sm text-custom-700">Led by {team.leader}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  team.efficiency >= 95 ? "bg-green-100 text-green-700" :
                  team.efficiency >= 85 ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {team.efficiency}% Efficiency
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineUsers className="w-4 h-4 text-primary-500" />
                    <span className="text-xs text-custom-700">Members</span>
                  </div>
                  <p className="text-xl font-bold text-secondary-100">{team.members}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineClock className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-custom-700">Active</span>
                  </div>
                  <p className="text-xl font-bold text-secondary-100">{team.activeJobs}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-custom-700">Done</span>
                  </div>
                  <p className="text-xl font-bold text-secondary-100">{team.completedToday}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Team Members */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineUsers className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-secondary-100">All Team Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-custom-300">
                  {["Name", "Role", "Team", "Status", "Jobs Today"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-custom-700 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, idx) => (
                  <tr key={idx} className="border-b border-custom-200 hover:bg-custom-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-secondary-100 whitespace-nowrap">{member.name}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{member.role}</td>
                    <td className="py-3 px-3 text-custom-700 whitespace-nowrap">{member.team}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        member.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-secondary-100 font-semibold">{member.jobsToday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
