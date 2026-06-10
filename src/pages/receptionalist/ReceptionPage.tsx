import { DashboardLayout } from "../../components";
import ReceptionDashboardV2 from "./ReceptionDashboardV2";

export default function ReceptionPage() {
  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={0}
    >
      <ReceptionDashboardV2 />
    </DashboardLayout>
  );
}
