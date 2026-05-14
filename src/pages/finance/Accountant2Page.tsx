import { DashboardLayout } from "../../components";
import Accountant2Dashboard from "./Accountant2Dashboard";

export default function Accountant2Page() {
  return (
    <DashboardLayout
      userRole="accountant"
      userName="Accountant"
      notificationCount={4}
    >
      <Accountant2Dashboard />
    </DashboardLayout>
  );
}
