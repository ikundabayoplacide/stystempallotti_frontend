import { DashboardLayout } from "../../components";
import ProductionManagerDashboard from "./ProductionManagerDashboard";

export default function ProductionManagerPage() {
  return (
    <DashboardLayout
      userRole="production-manager"
      userName="Production Manager"
      notificationCount={7}
    >
      <ProductionManagerDashboard />
    </DashboardLayout>
  );
}
