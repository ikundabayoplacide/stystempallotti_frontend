import dashboardImg          from '../../assets/images/PR/dashboard.png';
import jobsImg               from '../../assets/images/PR/jobs.png';
import assignJobImg          from '../../assets/images/PR/assignJobTodepartment.png';
import departmentsImg        from '../../assets/images/PR/departments.png';
import leaveImg              from '../../assets/images/PR/leave.png';
import requestLeaveImg       from '../../assets/images/PR/requestLeave.png';
import generateReportImg     from '../../assets/images/PR/generateReport.png';
import productionReportImg   from '../../assets/images/PR/productionReport.png';
import departmentReportsImg  from '../../assets/images/PR/departmentReports.png';
import completeJobReportsImg from '../../assets/images/PR/completeJobReports.png';
import myReportsImg          from '../../assets/images/PR/myReports.png';
import sharedReportsImg      from '../../assets/images/PR/sharedReports.png';
import notificationsImg      from '../../assets/images/PR/notifications.png';
import profileImg          from '../../assets/images/PR/profile.png';
import passwordImg         from '../../assets/images/PR/password.png';
import logoutImg           from '../../assets/images/PR/logout.png';

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
          <p>Job planning, departments, general stock &amp; production oversight</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As a Production Manager you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>View the Dashboard — a live snapshot of all jobs, departments, and workforce.</li>
            <li>Assign confirmed jobs to departments, reassign them, complete them, edit them, or reject them.</li>
            <li>Inspect all production departments — their workers and active jobs.</li>
            <li>View the General Stock — see available items, quantities, and stock status.</li>
            <li>Request leave and check your leave history.</li>
            <li>Generate production and department reports, and review reports shared with you.</li>
            <li>Check notifications, update your profile, and change your password.</li>
          </ul>
        </div>
      </div>

      <p style={{ fontSize: '.85rem', color: 'var(--color-custom-700)', marginBottom: '1rem' }}>
        Your sidebar: <strong>Dashboard · Job Planning · Departments · General Stock · My Leave · Reports ▾ · Notifications · Settings.</strong>
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
            Four KPI cards at the top: <strong>Jobs in Production · Pending Assignment · Completed Today · Delayed Jobs</strong>.
            Below: a <strong>Production Departments</strong> panel showing active job counts per department,
            and a <strong>Workforce</strong> panel with total / active / inactive employee counts plus job summaries.
            A <strong>Jobs by Stage</strong> breakdown card appears when jobs are active.
            Click any KPI card or panel to navigate directly to that section.
            A <strong>Refresh</strong> button in the top right updates all counts.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">🔗 Using the KPI cards</div>
            <StepItem>Each card is a shortcut — click to go straight to the relevant section:</StepItem>
            <StepItem><Lbl>Jobs in Production</Lbl> → Job Planning page.</StepItem>
            <StepItem><Lbl>Pending Assignment</Lbl> → Job Planning page (look for jobs with Confirmed status).</StepItem>
            <StepItem><Lbl>Completed Today</Lbl> → Job Planning page.</StepItem>
            <StepItem><Lbl>Delayed Jobs</Lbl> → Job Planning page (look for jobs past their due date).</StepItem>
            <StepItem><Lbl>Production Departments</Lbl> panel → Departments page.</StepItem>
            <StepItem><Lbl>Workforce</Lbl> panel → Job Planning page.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 2. JOB PLANNING ──────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📋</div>
          <div>
            <div className="pc-title">Job Planning</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Assign jobs to departments, track their progress, and complete or reject them.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={jobsImg} alt="Job Planning page" style={imgStyle} />

          <ScreenMock>
            A table listing all jobs. Summary cards at the top show <strong>Pending · In Production · Assigned · Total</strong> counts.
            Columns: Job #, Client, Status, Dept State, Priority, Department, Due Date, Actions.
            Each row has a <strong>👁 eye icon</strong> to view full job details and a <strong>⋮ three-dot menu</strong> for actions.
            A search bar at the top filters by job number, title, or client name.
            Use <strong>Previous / Next</strong> buttons to paginate through jobs.
          </ScreenMock>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>Available actions per job (shown in the ⋮ menu based on job state):</strong></p>
              <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
                <li><strong>Assign</strong> — send a Confirmed job to a department for the first time.</li>
                <li><strong>Reassign</strong> — move a job already in production to a different department.</li>
                <li><strong>Complete</strong> — mark the job as fully completed (only available when dept state ends in <em>-done</em>).</li>
                <li><strong>Edit</strong> — update the job title or due date (Confirmed jobs only).</li>
                <li><strong>Reject</strong> — reject a Confirmed job with a reason (before it enters production).</li>
              </ul>
            </div>
          </div>

          <div className="step-box">
            <div className="step-box-title">➕ How to assign a job to a department</div>
            <StepItem num={1}>
              Find a job in the table with a <strong>Confirmed</strong> status — these are ready to enter production.
            </StepItem>
            <StepItem num={2}>Click the <Lbl>⋮</Lbl> three-dot icon in the Actions column → select <Lbl>Assign</Lbl>.</StepItem>
            <img src={assignJobImg} alt="Assign job to department modal" style={imgStyle} />
            <StepItem num={3}>In the modal, select the target department from the <strong>Department</strong> dropdown.</StepItem>
            <StepItem num={4}>Click <Lbl>Assign to Department</Lbl>. The job moves into that department's queue and the supervisor can start managing it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔄 How to reassign a job to a different department</div>
            <StepItem num={1}>Find a job already in production. The current department is shown in the Department column.</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → select <Lbl>Reassign</Lbl>.</StepItem>
            <StepItem num={3}>The modal shows the current department. Select the <strong>New Department</strong> from the dropdown.</StepItem>
            <StepItem num={4}>Click <Lbl>Assign to Department</Lbl>. The job moves to the new department immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ How to complete a job</div>
            <StepItem num={1}>
              A job can only be completed when its <strong>Dept State</strong> shows a <em>-done</em> value
              (e.g., Binding Done, Printing Done). This means the supervisor has marked their department's work as done.
            </StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → select <Lbl>Complete</Lbl>.</StepItem>
            <StepItem num={3}>Confirm in the modal. The job status changes to <strong>Completed</strong> and it is ready for delivery.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit a job</div>
            <StepItem num={1}>Only <strong>Confirmed</strong> jobs (not yet in production) can be edited.</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → select <Lbl>Edit</Lbl>.</StepItem>
            <StepItem num={3}>Update the <strong>Title</strong> and/or <strong>Due Date</strong> fields.</StepItem>
            <StepItem num={4}>Click <Lbl>Save Changes</Lbl>. The table updates immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">❌ How to reject a job</div>
            <StepItem num={1}>Only <strong>Confirmed</strong> jobs that have not yet entered production can be rejected.</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → select <Lbl>Reject</Lbl>.</StepItem>
            <StepItem num={3}>Enter the reason for rejection in the text field.</StepItem>
            <StepItem num={4}>Click <Lbl>Reject Job</Lbl>. The job is marked as rejected.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👁 How to view full job details</div>
            <StepItem num={1}>Click the <Lbl>👁</Lbl> eye icon on any job row.</StepItem>
            <StepItem num={2}>
              A <strong>Job Details</strong> modal opens showing: client info, job specifications,
              materials needed, financial details, current department state, and assigned workers.
            </StepItem>
            <StepItem num={3}>Click <Lbl>Close</Lbl> to dismiss the modal.</StepItem>
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
            A table listing all departments. Summary cards at the top show <strong>Total Departments · Total Workers · Active Jobs</strong>.
            Columns: Department, Description, Active Jobs, Workers, Actions.
            A search box in the top bar filters departments by name.
            Each row has a <strong>👁 eye icon</strong> to open a side drawer with more details.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">👁 How to inspect a department</div>
            <StepItem num={1}>Find the department row in the table. Click the <Lbl>👁</Lbl> eye icon on the right.</StepItem>
            <StepItem num={2}>
              A side drawer opens with two tabs:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><strong>Workers</strong> — all employees assigned to this department with their status and contract type.</li>
                <li><strong>Jobs</strong> — all jobs currently assigned to this department.</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click the <Lbl>✕</Lbl> button or outside the drawer to close it.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 4. GENERAL STOCK ─────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--orange-100, #fff7ed)' }}>📦</div>
          <div>
            <div className="pc-title">General Stock</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View all general stock items, their current quantities, and stock status.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <ScreenMock>
            Four summary cards at the top: <strong>Total Items · Available · Low Stock · Out of Stock</strong>.
            A yellow alert bar appears when any items are running low or out of stock.
            A table shows all stock items with columns: Item Name, Category, Unit, Current Stock, Alarm Level, Status badge.
            Status badges: <strong>Available</strong> (green) · <strong>Low Stock</strong> (yellow) · <strong>Out of Stock</strong> (red).
            A search bar filters by name or category. A status dropdown filters by Available / Low Stock / Out of Stock.
            Use the <strong>Prev / Next</strong> buttons or page numbers to navigate through items.
          </ScreenMock>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>This page is read-only for the Production Manager.</strong> You can view stock levels
                and check what materials are available, but adding or restocking items is managed by the Stock department.
                If an item is low or out of stock, contact the Stock Manager.</p>
            </div>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔍 How to find a specific stock item</div>
            <StepItem num={1}>Click <Lbl>General Stock</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Type the item name or category in the <strong>search bar</strong> — the table filters as you type.</StepItem>
            <StepItem num={3}>Use the <strong>All statuses</strong> dropdown to filter by Available, Low Stock, or Out of Stock.</StepItem>
            <StepItem num={4}>Click the <Lbl>↺</Lbl> refresh icon to reload the latest stock data from the server.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 5. MY LEAVE ──────────────────────────────────────────────────── */}
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
            A list of all your leave requests showing leave type, start date, end date, reason, and status
            badge: <strong>Pending</strong> (yellow) / <strong>Approved</strong> (green) / <strong>Rejected</strong> (red).
            A <strong>Request Leave</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to request leave</div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl> in the top-right corner.</StepItem>
            <img src={requestLeaveImg} alt="Request leave form" style={imgStyle} />
            <StepItem num={3}>Fill in the form: leave type, start date, end date, and reason.</StepItem>
            <StepItem num={4}>Click <Lbl>Submit</Lbl>. Your request appears in the list with a <strong>Pending</strong> status until HR approves or rejects it.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 6. REPORTS ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Reports</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Generate production reports, view saved reports, and review reports shared with you.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <p style={{ fontSize: '.85rem', color: 'var(--color-custom-700)', marginBottom: '.75rem' }}>
            The Reports section has four sub-pages accessible from the sidebar submenu:
            <strong> Reports (generate) · Production Report · My Reports · Shared Reports.</strong>
          </p>

          <div className="step-box">
            <div className="step-box-title">📤 How to generate a report</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar (the top item in the submenu).</StepItem>
            <img src={generateReportImg} alt="Generate report form" style={imgStyle} />
            <StepItem num={2}>Select the report type and set the date range.</StepItem>
            <StepItem num={3}>Optionally select who the report should be sent to.</StepItem>
            <StepItem num={4}>Click <Lbl>Generate Report</Lbl>. The report is saved and appears in My Reports.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🏭 Production Report</div>
            <img src={productionReportImg} alt="Production report" style={imgStyle} />
            <StepItem>
              Click <Lbl>Production Report</Lbl> in the sidebar submenu to see a full breakdown of all jobs
              across the production pipeline — how many are in each stage, completed, and delivered.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🏢 Department Reports</div>
            <img src={departmentReportsImg} alt="Department reports" style={imgStyle} />
            <StepItem>
              Shows job counts and performance data per department — useful for identifying bottlenecks
              and tracking which departments have the most active or delayed jobs.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ Completed Jobs Report</div>
            <img src={completeJobReportsImg} alt="Completed jobs report" style={imgStyle} />
            <StepItem>
              A list of all jobs that have been completed, with their completion dates and details.
              Use this to audit throughput over a given period.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📁 My Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → then click <Lbl>My Reports</Lbl> in the submenu.</StepItem>
            <img src={myReportsImg} alt="My Reports" style={imgStyle} />
            <StepItem num={2}>All reports you have generated are listed here. Click a report to view or download it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📨 Shared Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → then click <Lbl>Shared Reports</Lbl> in the submenu.</StepItem>
            <img src={sharedReportsImg} alt="Shared reports" style={imgStyle} />
            <StepItem num={2}>Reports sent to you by others (e.g., Finance or HR) appear here. Open a report, review it, and take any required action.</StepItem>
          </div>

        </div>
      </div>

      {/* ── 7. NOTIFICATIONS ─────────────────────────────────────────────── */}
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
            A list of all notifications. Unread items are highlighted. A red badge on the
            Notifications icon in the sidebar shows the number of unread notifications.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">🔔 How to check notifications</div>
            <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar. The red badge shows how many are unread.</StepItem>
            <img src={notificationsImg} alt="Notifications page" style={imgStyle} />
            <StepItem num={2}>Click any notification to mark it as read and see its full details.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 8. SETTINGS ──────────────────────────────────────────────────── */}
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
            <StepItem num={2}>Enter your current password, then your new password, and confirm the new password.</StepItem>
            <StepItem num={3}>Click <Lbl>Update Password</Lbl>. You will stay logged in with the new password active immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🚪 How to log out</div>
            <StepItem num={1}>Click your <strong>avatar / name</strong> in the top-right corner of the page header. A dropdown menu opens.</StepItem>
            <img src={logoutImg} alt="Logout dropdown" style={imgStyle} />
            <StepItem num={2}>Click <Lbl>Logout</Lbl> (shown in red at the bottom of the dropdown).</StepItem>
            <StepItem num={3}>You are immediately signed out and redirected to the login page.</StepItem>
          </div>

        </div>
      </div>

    </div>
  );
}
