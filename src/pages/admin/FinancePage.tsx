import { DashboardLayout } from "../../components";
import FinanceDashboard from "./FinanceDashboard";

export default function FinancePage() {
  return (
    <DashboardLayout
      userRole="admin"
      userName="Director"
      notificationCount={3}
    >
      <FinanceDashboard />
    </DashboardLayout>
  );
}
