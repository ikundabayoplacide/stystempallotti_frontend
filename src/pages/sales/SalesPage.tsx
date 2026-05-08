import { DashboardLayout } from "../../components";
import SalesDashboard from "./SalesDashboard";

export default function SalesPage() {
  return (
    <DashboardLayout
      userRole="sales"
      userName="Sales Officer"
      notificationCount={4}
    >
      <SalesDashboard />
    </DashboardLayout>
  );
}
