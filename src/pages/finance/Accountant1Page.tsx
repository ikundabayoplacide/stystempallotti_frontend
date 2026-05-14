import { DashboardLayout } from "../../components";
import Accountant1Dashboard from "./Accountant1Dashboard";

export default function Accountant1Page() {
  return (
    <DashboardLayout
      userRole="accountant"
      userName="Accountant"
      notificationCount={5}
    >
      <Accountant1Dashboard />
    </DashboardLayout>
  );
}
