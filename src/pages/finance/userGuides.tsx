import dashboardImg from '../../assets/images/daf/dashboard.png';
import jobApprovalImg from '../../assets/images/daf/jobapproval.png';
import employeesImg from '../../assets/images/daf/employees.png';
import procurementImg from '../../assets/images/daf/produrement.png';
import addMarketImg from '../../assets/images/daf/addmarket.png';
import leaveImg from '../../assets/images/daf/leave.png';
import requestLeaveImg from '../../assets/images/daf/requestleave.png';
import dafReportImg from '../../assets/images/daf/dafreport.png';
import generateReportImg from '../../assets/images/daf/generatereport.png';
import myReportImg from '../../assets/images/daf/myreport.png';
import receivedReportImg from '../../assets/images/daf/receivedreport.png';
import notificationImg from '../../assets/images/daf/notification.png';
import profileImg from '../../assets/images/daf/profile.png';
import passwordImg from '../../assets/images/daf/password.png';

const imgStyle: React.CSSProperties = { maxWidth: '100%', height: 'auto', marginTop: '.5rem' };

function StepItem({ num, children }: { num?: number; children: React.ReactNode }) {
  return (
    <div className="step-item">
      {num !== undefined && <span className="step-num">{num}</span>}
      <span className="step-text">{children}</span>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="lbl-click">{children}</span>;
}

function ScreenMock({ children }: { children: React.ReactNode }) {
  return (
    <div className="screen-mock">
      <div className="screen-mock-title">What you see</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function DAFUserGuide() {
  return (
    <div>
      <div className="sec-title" id="daf">
        <div className="sec-icon sec-icon-blue">🏦</div>
        <div className="sec-text">
          <h2>DAF — Finance Controller</h2>
          <p>Job approvals, HR management, procurement and reports</p>
        </div>
      </div>
      <div className="sec-divider" />
      <p>
        Your sidebar: <strong>Dashboard, Job Approval, HR Management, Procurement, My Leave, Reports ▾.</strong>
      </p>

      {/* Dashboard */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <img src={dashboardImg} alt="DAF Dashboard" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            KPI cards: Total Revenue · Pending Approvals · Active Employees · Confirmed Jobs.
            Below: Pending Job Approvals list (with job #, client, amount, priority) and Recent Payments feed.
            Job Status Overview (Pending / Confirmed / Rejected counts). HR Summary by Department.
          </ScreenMock>
        </div>
      </div>

      {/* Job Approval */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>✅</div>
          <div>
            <div className="pc-title">Job Financial Approval</div>
            <img src={jobApprovalImg} alt="Job Approval" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            Summary cards: Pending · Confirmed · Rejected · Pending Value (RWF).
            Table of all jobs: Job #, Title &amp; Client, Amount, Priority badge, Status badge, Deadline, Actions.
            Search box. Eye icon to view full job details. ⋮ menu on pending jobs for Confirm / Reject actions.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">✅ Confirm a job</div>
            <StepItem num={1}>Find the pending job in the table (highlighted yellow). Click ⋮ → <Lbl>Confirm</Lbl>.</StepItem>
            <StepItem num={2}>A modal opens showing job details (client, amount, status, deadline).</StepItem>
            <StepItem num={3}>Optionally add approval notes. Click <Lbl>Confirm Job</Lbl>. The job moves to production.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">❌ Reject a job</div>
            <StepItem num={1}>Click ⋮ on a pending job → <Lbl>Reject</Lbl>.</StepItem>
            <StepItem num={2}>Enter a <strong>reason for rejection</strong> (required). Click <Lbl>Confirm Rejection</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👁 View job details</div>
            <StepItem num={1}>
              Click the 👁 eye icon on any job row to open a detail modal showing: client info, job information,
              materials needed, financial data, department position, and assigned workers.
            </StepItem>
          </div>
        </div>
      </div>

      {/* HR Management */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👥</div>
          <div>
            <div className="pc-title">HR Management</div>
            <img src={employeesImg} alt="HR Management" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            List of all employees with name, department, role, status (Active/Inactive). Search and filter by department.
            Actions per employee: view details, edit, activate/deactivate.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">👤 Manage employees</div>
            <StepItem num={1}>Click <Lbl>HR Management</Lbl> in the sidebar to see all employees.</StepItem>
            <StepItem num={2}>Use the search box or department filter to find a specific employee.</StepItem>
            <StepItem num={3}>Click on an employee to view their full profile and employment details.</StepItem>
          </div>
        </div>
      </div>

      {/* Procurement */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--purple-100)' }}>📦</div>
          <div>
            <div className="pc-title">Procurement / Market Leads</div>
            <img src={procurementImg} alt="Procurement" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            Pipeline overview cards by stage: Prospect · Contacted · Negotiating · Won · Lost.
            KPI cards: Total Leads · In Progress · Won · Overdue Follow-ups · Won Value.
            Table: Company, Contact, Sector, Stage badge, Estimated Value, Location, Next Follow-up.
            Filter by stage. <strong>Add Market Lead</strong> button.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ Add a market lead</div>
            <StepItem num={1}>Click <Lbl>Add Market Lead</Lbl>.</StepItem>
            <img src={addMarketImg} alt="Add Market Lead" style={imgStyle} />
            <StepItem num={2}>
              Fill in: Company name, Contact Person, Phone, Sector, Stage, Estimated Value (RWF),
              Location, Next Follow-up date. Click <Lbl>Save</Lbl>.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔄 Update a lead's stage</div>
            <StepItem num={1}>Find the lead in the table. Click ✏️ Edit.</StepItem>
            <StepItem num={2}>
              Change the <strong>Stage</strong> to Contacted / Negotiating / Won / Lost as the deal progresses.
              Update the <strong>Next Follow-up</strong> date. Click <Lbl>Save</Lbl>.
            </StepItem>
          </div>
        </div>
      </div>

      {/* Leave */}
      <div className="step-box">
        <div className="step-box-title">Leave</div>
        <StepItem num={1}>Click <Lbl>Leave</Lbl> in the sidebar.</StepItem>
        <img src={leaveImg} alt="Leave" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Ask for Leave</Lbl></div>
        <StepItem num={1}>Click <Lbl>Request</Lbl>, complete the form and submit.</StepItem>
        <img src={requestLeaveImg} alt="Request Leave" style={imgStyle} />
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>DAF Reports</Lbl></div>
        <p>Two tabs: <strong>Job Approval</strong> (filter by day/week/month/year or custom date range) and
          <strong> Procurement</strong> (market leads pipeline by stage).</p>
        <img src={dafReportImg} alt="DAF Reports" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Generate Reports</Lbl></div>
        <StepItem num={1}>
          Click <Lbl>Generate Report</Lbl> — fill the form, select who will receive the report, then submit.
        </StepItem>
        <img src={generateReportImg} alt="Generate Report" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>my reports</Lbl> on sidebar.</StepItem>
        <img src={myReportImg} alt="My Reports" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Received Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>received reports</Lbl> to view reports assigned to you by others.</StepItem>
        <img src={receivedReportImg} alt="Received Reports" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Notifications</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Notifications</Lbl></div>
        <StepItem num={1}>Click <Lbl>notifications</Lbl> on sidebar.</StepItem>
        <img src={notificationImg} alt="Notifications" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Settings</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Settings</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>profile</Lbl>.</StepItem>
        <img src={profileImg} alt="Profile Settings" style={imgStyle} />
      </div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Change credentials (email and password)</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>password</Lbl>.</StepItem>
        <img src={passwordImg} alt="Change Password" style={imgStyle} />
      </div>
    </div>
  );
}
