import { DashboardLayout } from "../../components";
import SalesDashboard from "./SalesDashboard";

export default function SalesPage() {
  return (
    <DashboardLayout
      userRole="admin"
      userName="Director"
      notificationCount={8}
    >
      <SalesDashboard />
    </DashboardLayout>
  );
}
