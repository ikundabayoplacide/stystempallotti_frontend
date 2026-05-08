import { DashboardLayout } from "../../components";
import SupervisorDashboard from "./SupervisorDashboard";

export default function SupervisorPage() {
  return (
    <DashboardLayout
      userRole="supervisor"
      userName="Production Supervisor"
      notificationCount={4}
    >
      <SupervisorDashboard />
    </DashboardLayout>
  );
}
