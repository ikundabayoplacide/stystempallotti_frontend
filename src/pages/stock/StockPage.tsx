import { DashboardLayout } from "../../components";
import StockDashboard from "./StockDashboard";

export default function StockPage() {
  return (
    <DashboardLayout
      userRole="stock"
      userName="Stock Manager"
      notificationCount={12}
    >
      <StockDashboard />
    </DashboardLayout>
  );
}
