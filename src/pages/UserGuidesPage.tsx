import { DashboardLayout } from '../components';
import { useAuth } from '../context/AuthContext';
import './userGuides.css';
import AccountantUserGuide from './finance/accountantGuides';
import DAFUserGuide from './finance/userGuides';
import HobeUserGuide from './Hobe/userGuides';
import ReceptionistUserGuide from './receptionalist/userGuides';
import SalesUserGuide from './sales/userGuides';
import SupervisorUserGuide from './supervisor/userGuides';
import WorkerUserGuide from './worker/userGuides';

function GuideContent({ role }: { role: string }) {
  switch (role) {
    case 'receptionist': return <ReceptionistUserGuide />;
    case 'sales':        return <SalesUserGuide />;
    case 'accountant':   return <AccountantUserGuide />;
    case 'daf':          return <DAFUserGuide />;
    case 'hobe':         return <HobeUserGuide />;
    case 'supervisor':   return <SupervisorUserGuide />;
    case 'worker':       return <WorkerUserGuide />;
    default: return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--gray-500)' }}>
        No user guide available for your role.
      </div>
    );
  }
}

export default function UserGuidesPage() {
  const { userRole } = useAuth();

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '.75rem .5rem' }}>
        <GuideContent role={userRole ?? ''} />
      </div>
    </DashboardLayout>
  );
}
