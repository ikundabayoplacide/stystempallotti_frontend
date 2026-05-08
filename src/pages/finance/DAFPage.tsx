import { DashboardLayout } from "../../components";
import DAFDashboard from "./DAFDashboard";

export default function DAFPage() {
  return (
    <DashboardLayout
      userRole="daf"
      userName="DAF - Finance Controller"
      notificationCount={8}
    >
      <DAFDashboard />
    </DashboardLayout>
  );
}
