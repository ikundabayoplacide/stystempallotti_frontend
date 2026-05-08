import { DashboardLayout } from "../../components";
import ReceptionDashboard from "./ReceptionDashboard";

export default function ReceptionPage() {
  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={6}
    >
      <ReceptionDashboard />
    </DashboardLayout>
  );
}
