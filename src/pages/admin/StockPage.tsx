import { DashboardLayout } from "../../components";
import StockDashboard from "./StockDashboard";

export default function StockPage() {
  return (
    <DashboardLayout
      userRole="admin"
      userName="Director"
      notificationCount={12}
    >
      <StockDashboard />
    </DashboardLayout>
  );
}
