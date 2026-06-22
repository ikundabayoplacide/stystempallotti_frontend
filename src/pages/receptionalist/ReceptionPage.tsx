import { DashboardLayout } from "../../components";
import ReceptionDashboardV2 from "./ReceptionDashboardV2";
import { useGetUnreadCountQuery } from "../../store/services/notificationsService";

export default function ReceptionPage() {
  const { data: unreadCount = 0 } = useGetUnreadCountQuery();
  return (
    <DashboardLayout
      userRole="receptionist"
      userName="Reception Desk"
      notificationCount={unreadCount}
    >
      <ReceptionDashboardV2 />
    </DashboardLayout>
  );
}
