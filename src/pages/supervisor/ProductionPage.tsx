import { DashboardLayout } from "../../components";
import ProductionDashboard from "./ProductionDashboard";

export default function ProductionPage() {
  return (
    <DashboardLayout
      userRole="supervisor"
      userName="Production Supervisor"
      notificationCount={2}
    >
      <ProductionDashboard />
    </DashboardLayout>
  );
}
