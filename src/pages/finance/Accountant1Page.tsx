import { DashboardLayout } from "../../components";
import Accountant1Dashboard from "./Accountant1Dashboard";

export default function Accountant1Page() {
  return (
    <DashboardLayout
      userRole="accountant1"
      userName="Accountant 1"
      notificationCount={5}
    >
      <Accountant1Dashboard />
    </DashboardLayout>
  );
}
