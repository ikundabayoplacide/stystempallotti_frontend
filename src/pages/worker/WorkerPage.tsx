import { DashboardLayout } from "../../components";
import { useAuth } from "../../context/AuthContext";
import WorkerDashboard from "./WorkerDashboard";

export default function WorkerPage() {
  const { userName, userDepartment } = useAuth();
  
  return (
    <DashboardLayout
      userRole="worker"
      userName={userName || "Worker"}
      notificationCount={2}
    >
      <WorkerDashboard department={userDepartment} />
    </DashboardLayout>
  );
}
