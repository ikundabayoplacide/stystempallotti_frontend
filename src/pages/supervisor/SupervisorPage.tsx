import { useSelector } from "react-redux";
import { DashboardLayout } from "../../components";
import SupervisorDashboard from "./SupervisorDashboard";
import type { RootState } from "../../store";

export default function SupervisorPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  return (
    <DashboardLayout
      userRole="supervisor"
      userName={currentUser?.name ?? "Supervisor"}
      notificationCount={0}
    >
      <SupervisorDashboard />
    </DashboardLayout>
  );
}
