import dashboardImg        from '../../assets/images/PR/dashboard.png';
import jobsImg             from '../../assets/images/PR/jobs.png';
import assignJobImg        from '../../assets/images/PR/assignJobTodepartment.png';
import departmentsImg      from '../../assets/images/PR/departments.png';
import leaveImg            from '../../assets/images/PR/leave.png';
import requestLeaveImg     from '../../assets/images/PR/requestLeave.png';
import generateReportImg   from '../../assets/images/PR/generateReport.png';
import productionReportImg from '../../assets/images/PR/productionReport.png';
import departmentReportsImg from '../../assets/images/PR/departmentReports.png';
import completeJobReportsImg from '../../assets/images/PR/completeJobReports.png';
import myReportsImg        from '../../assets/images/PR/myReports.png';
import sharedReportsImg    from '../../assets/images/PR/sharedReports.png';
import notificationsImg    from '../../assets/images/PR/notifications.png';
import profileImg          from '../../assets/images/PR/profile.png';
import passwordImg         from '../../assets/images/PR/password.png';

const imgStyle: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  marginTop: '.5rem',
  borderRadius: '8px',
  border: '1px solid var(--color-custom-200)',
};

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
      <div className="screen-mock-title">What you see on screen</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function ProductionManagerUserGuide() {
  return (
    <div>

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="sec-title" id="production-manager">
        <div className="sec-icon sec-icon-blue">🏭</div>
        <div className="sec-text">
          <h2>Production Manager</h2>
          <p>Job planning, departments &amp; production oversight</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As a Production Manager you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>View the dashboard — a live overview of all jobs in production.</li>
            <li>Assign confirmed jobs to departments, reassign them, complete them, or reject them.</li>
            <li>Monitor all production departments — their workers and active jobs.</li>
            <li>Request leave and check your leave history.</li>
            <li>Generate production and department reports, and review reports assigned to you.</li>
            <li>Check notifications, update your profile, and change your password.</li>
          </ul>
        </div>
      </div>

      <p style={{ fontSize: '.85rem', color: 'var(--color-custom-700)', marginBottom: '1rem' }}>
        Your sidebar: <strong>Dashboard, Job Planning, Departments, General Stock, My Leave, Reports ▾, Notifications, Settings.</strong>
      </p>

      {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Your home page — a live overview of the entire production pipeline.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={dashboardImg} alt="Production Manager Dashboard" style={imgStyle} />
          <ScreenMock>
            KPI cards at the top showing job counts by status: <strong>Total · Pending · In Production ·
            Completed · Delivered</strong>. Below the cards: a jobs table showing recent activity across
            all departments with Job #, Client, Status, Priority, and Due Date.
          </ScreenMock>
        </div>
      </div>

      {/* ── 2. JOB PLANNING ──────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📋</div>
          <div>
            <div className="pc-title">Job Planning</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Assign jobs to departments, track their progress through production, and complete or reject them.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={jobsImg} alt="Job Planning page" style={imgStyle} />

          <ScreenMock>
            A table of all jobs with summary cards at the top: <strong>Pending · In Production · Assigned · Total</strong>.
            Columns: Job #, Client, Status, Dept State, Priority, Department, Due Date, Actions.
            Each row has a <strong>👁 View</strong> icon to see full job details and a <strong>⋮ Actions</strong> menu.
          </ScreenMock>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>What each action does:</strong></p>
              <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
                <li><strong>Assign</strong> — send a confirmed job to a department for the first time.</li>
                <li><strong>Reassign</strong> — move a job already in production to a different department.</li>
                <li><strong>Complete</strong> — mark the job as fully completed once all department states are done.</li>
                <li><strong>Edit</strong> — update the job title or due date (only available for confirmed jobs).</li>
                <li><strong>Reject</strong> — reject a confirmed job with a reason.</li>
              </ul>
            </div>
          </div>

          <div className="step-box">
            <div className="step-box-title">➕ How to assign a job to a department</div>
            <StepItem num={1}>Find the job row in the table. Look for jobs with a <strong>Confirmed</strong> status (these are ready to be assigned).</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> in the Actions column → select <Lbl>Assign</Lbl>.</StepItem>
            <img src={assignJobImg} alt="Assign job to department modal" style={imgStyle} />
            <StepItem num={3}>Select the department from the dropdown.</StepItem>
            <StepItem num={4}>Click <Lbl>Assign to Department</Lbl>. The job moves to that department's queue and the supervisor can start managing it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔄 How to reassign a job to a different department</div>
            <StepItem num={1}>Find the job already in production. Click <Lbl>⋮</Lbl> → select <Lbl>Reassign</Lbl>.</StepItem>
            <StepItem num={2}>Select the new department from the dropdown.</StepItem>
            <StepItem num={3}>Click <Lbl>Assign to Department</Lbl>. The job is moved to the new department.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ How to complete a job</div>
            <StepItem num={1}>A job can be completed only when its department state ends in <strong>-done</strong> (e.g., binding-done, printing-done).</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → select <Lbl>Complete</Lbl>.</StepItem>
            <StepItem num={3}>Confirm in the modal. The job status changes to Completed and is ready for delivery.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">❌ How to reject a job</div>
            <StepItem num={1}>Only confirmed jobs that have not yet entered production can be rejected.</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → select <Lbl>Reject</Lbl>.</StepItem>
            <StepItem num={3}>Enter the reason for rejection, then click <Lbl>Reject Job</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👁 How to view full job details</div>
            <StepItem num={1}>Click the <Lbl>👁</Lbl> eye icon on any job row.</StepItem>
            <StepItem num={2}>A details panel opens showing: client info, job specs, materials needed, financial details, current department state, and assigned workers.</StepItem>
            <StepItem num={3}>Click <Lbl>Close</Lbl> to dismiss.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 3. DEPARTMENTS ───────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>🏢</div>
          <div>
            <div className="pc-title">Departments</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Monitor all production departments — see their active jobs and current workers.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={departmentsImg} alt="Departments page" style={imgStyle} />

          <ScreenMock>
            A table listing all departments with columns: Department, Description, Active Jobs, Workers, Actions.
            Summary cards show: Total Departments, Total Workers, Active Jobs. A search box filters by name.
            Each row has a <strong>👁 View</strong> icon to open a side drawer.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">👁 How to inspect a department</div>
            <StepItem num={1}>Find the department row. Click the <Lbl>👁</Lbl> eye icon on the right.</StepItem>
            <StepItem num={2}>
              A side drawer opens with two tabs:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><strong>Workers</strong> — lists all employees assigned to this department with their status and contract type.</li>
                <li><strong>Jobs</strong> — lists all jobs currently assigned to this department.</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click outside the drawer or the <Lbl>✕</Lbl> button to close it.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 4. MY LEAVE ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🌴</div>
          <div>
            <div className="pc-title">My Leave</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View your leave history and submit a new leave request.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={leaveImg} alt="Leave history page" style={imgStyle} />
          <ScreenMock>
            A list of all your leave requests showing leave type, start and end dates, reason, and status
            (Pending / Approved / Rejected). A <strong>Request Leave</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to request leave</div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl> in the top-right corner.</StepItem>
            <img src={requestLeaveImg} alt="Request leave form" style={imgStyle} />
            <StepItem num={3}>Fill in leave type, start date, end date, and reason.</StepItem>
            <StepItem num={4}>Click <Lbl>Submit</Lbl>. Your request appears as Pending until approved by HR.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 5. REPORTS ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Reports</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Generate production reports, review department reports, and access your saved reports.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">📤 How to generate a report</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar.</StepItem>
            <img src={generateReportImg} alt="Generate report form" style={imgStyle} />
            <StepItem num={2}>Select the report type, date range, and who should receive it.</StepItem>
            <StepItem num={3}>Click <Lbl>Generate Report</Lbl>. The report is saved and appears in My Reports.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🏭 Production Report</div>
            <img src={productionReportImg} alt="Production report" style={imgStyle} />
            <StepItem>Shows a full breakdown of all jobs across the production pipeline — how many are in each stage, completed, and delivered.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🏢 Department Reports</div>
            <img src={departmentReportsImg} alt="Department reports" style={imgStyle} />
            <StepItem>Shows job counts and performance data per department — useful for identifying bottlenecks.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ Completed Jobs Report</div>
            <img src={completeJobReportsImg} alt="Completed jobs report" style={imgStyle} />
            <StepItem>A list of all jobs that have been completed, with their completion dates and details.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📁 My Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → click <Lbl>My Reports</Lbl> in the submenu.</StepItem>
            <img src={myReportsImg} alt="My Reports" style={imgStyle} />
            <StepItem num={2}>All reports you have generated are listed here. Click one to view or download it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📨 Shared / Assigned Reports</div>
            <StepItem num={1}>Reports sent to you by others (e.g., by Finance or HR) appear here.</StepItem>
            <img src={sharedReportsImg} alt="Shared reports" style={imgStyle} />
            <StepItem num={2}>Open a report, review it, and take any required action.</StepItem>
          </div>

        </div>
      </div>

      {/* ── 6. NOTIFICATIONS ─────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🔔</div>
          <div>
            <div className="pc-title">Notifications</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Stay informed about new job confirmations, department completions, and system alerts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            A list of all notifications. Unread items are highlighted. A red badge on the sidebar
            Notifications icon shows how many are unread.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">🔔 How to check notifications</div>
            <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar.</StepItem>
            <img src={notificationsImg} alt="Notifications page" style={imgStyle} />
            <StepItem num={2}>Click any notification to mark it as read and see its full details.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 7. SETTINGS ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>⚙️</div>
          <div>
            <div className="pc-title">Settings</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Update your profile information or change your password.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">👤 How to update your profile</div>
            <StepItem num={1}>Click the <Lbl>⚙️ Settings</Lbl> icon at the bottom of the sidebar.</StepItem>
            <img src={profileImg} alt="Profile settings page" style={imgStyle} />
            <StepItem num={2}>Edit your name, email, or other personal details.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to apply your changes.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔑 How to change your password</div>
            <StepItem num={1}>Click <Lbl>⚙️ Settings</Lbl> in the sidebar → select the <Lbl>Password</Lbl> tab.</StepItem>
            <img src={passwordImg} alt="Change password page" style={imgStyle} />
            <StepItem num={2}>Enter your current password, then your new password, and confirm it.</StepItem>
            <StepItem num={3}>Click <Lbl>Update Password</Lbl>. You will stay logged in with the new password.</StepItem>
          </div>

        </div>
      </div>

    </div>
  );
}
