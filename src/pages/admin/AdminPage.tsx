import { DashboardLayout } from "../../components";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  return (
    <DashboardLayout
      userRole="admin"
      userName="Director"
      notificationCount={5}
    >
      <AdminDashboard />
    </DashboardLayout>
  );
}
