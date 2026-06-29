import dashboardImg        from '../../assets/images/hr/dashboard.png';
import employeeImg         from '../../assets/images/hr/employee.png';
import assigToDeptImg      from '../../assets/images/hr/assigToDepartment.png';
import checkWhoLinkedImg   from '../../assets/images/hr/checkWhoLinkedTo.png';
import casualWorkersImg    from '../../assets/images/hr/casualWorkers.png';
import addNewCasualImg     from '../../assets/images/hr/addNewCasual.png';
import jobApprovalsImg     from '../../assets/images/hr/jobapprovals.png';
import produrementImg      from '../../assets/images/hr/produrement.png';
import newMarketImg        from '../../assets/images/hr/newMarket.png';
import payrollImg          from '../../assets/images/hr/payroll.png';
import newPayrollImg       from '../../assets/images/hr/newPayroll.png';
import manageLeaveImg      from '../../assets/images/hr/manageLeave.png';
import myLeaveImg          from '../../assets/images/hr/myleave.png';
import generateReportImg   from '../../assets/images/hr/generateReport.png';
import reportsImg          from '../../assets/images/hr/reports.png';
import myReportsImg        from '../../assets/images/hr/myReports.png';
import receiveReportImg    from '../../assets/images/hr/receiveReport.png';
import notifyImg           from '../../assets/images/hr/notify.png';
import profileImg          from '../../assets/images/hr/profile.png';
import passwordImg         from '../../assets/images/hr/password.png';

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

function Field({ children }: { children: React.ReactNode }) {
  return <span className="lbl-field">{children}</span>;
}

function ScreenMock({ children }: { children: React.ReactNode }) {
  return (
    <div className="screen-mock">
      <div className="screen-mock-title">What you see on screen</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function HRUserGuide() {
  return (
    <div>

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="sec-title" id="hr">
        <div className="sec-icon sec-icon-blue">👥</div>
        <div className="sec-text">
          <h2>Human Resources (HR)</h2>
          <p>Workforce management, payroll &amp; leave</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As HR you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>Monitor the workforce on your Dashboard — employee counts, contract types, gender distribution, and payroll summary.</li>
            <li>Add, edit, and manage employees — assign them to departments and link them to their login accounts.</li>
            <li>Manage casual workers — add, edit, and delete casual worker records.</li>
            <li>Review job approvals and procurement requests.</li>
            <li>Create and manage payroll records — draft, approve, and mark as paid.</li>
            <li>Review and approve or reject all employee leave requests, and submit your own.</li>
            <li>Generate, view, and share reports.</li>
            <li>Check notifications, update your profile, and change your password.</li>
          </ul>
        </div>
      </div>

      <p style={{ fontSize: '.85rem', color: 'var(--color-custom-700)', marginBottom: '1rem' }}>
        Your sidebar: <strong>Dashboard, Employees, Job Approvals, Procurement, Casual Workers, Payroll, Leave Management, Reports ▾, Notifications, Settings.</strong>
      </p>

      {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Your home page — a live workforce overview with clickable KPI cards.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={dashboardImg} alt="HR Dashboard" style={imgStyle} />
          <ScreenMock>
            Four KPI cards: <strong>Total Employees · Active · Inactive · New / Interns</strong> — click any card to go to the Employees page.
            Below: Contract Types breakdown (Full Time / Part Time / Contract / Intern), Gender Distribution, Active vs Inactive,
            Payroll summary for the current period (Draft / Approved / Paid / Net total), and Recently Hired employees table.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">🔗 Quick navigation from the Dashboard</div>
            <StepItem>Click any KPI card to jump directly to the Employees page.</StepItem>
            <StepItem>Click <Lbl>Manage →</Lbl> next to the Payroll section to go to the Payroll page.</StepItem>
            <StepItem>Click <Lbl>View all →</Lbl> next to Recently Hired to see the full employee list.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 2. EMPLOYEES ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👤</div>
          <div>
            <div className="pc-title">Employees</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Add and manage all employees — assign them to departments and link them to their worker login accounts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={employeeImg} alt="Employees page" style={imgStyle} />
          <ScreenMock>
            A searchable table of all employees. Columns: Full Name, Phone, Email, Contract, Salary, Department, Linked (whether linked to a login account), Status, Actions.
            Each row has: <strong>Link / Relink</strong>, <strong>Assign</strong> (department), <strong>✏️ Edit</strong>, and <strong>🗑️ Delete</strong> buttons.
            An <strong>Add Employee</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a new employee</div>
            <StepItem num={1}>Click <Lbl>Add Employee</Lbl> in the top-right corner.</StepItem>
            <StepItem num={2}>
              Fill in the form — required fields are marked with *:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><Field>Full Name</Field>, <Field>Gender</Field>, <Field>Date of Birth</Field>, <Field>Phone Number</Field>, <Field>Address</Field> — required.</li>
                <li><Field>Contract Type</Field> — Full Time, Part Time, Contract, or Intern.</li>
                <li><Field>Contract Salary (RWF)</Field> — required.</li>
                <li><Field>Password</Field> — sets the employee's initial login password (required for new employees).</li>
                <li><Field>Email</Field>, <Field>NID</Field>, <Field>Hired At</Field> — optional.</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click <Lbl>Add Employee</Lbl> to save. The employee appears in the list.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🏢 How to assign an employee to a department</div>
            <StepItem num={1}>Find the employee row. Click the blue <Lbl>Assign</Lbl> button.</StepItem>
            <img src={assigToDeptImg} alt="Assign department modal" style={imgStyle} />
            <StepItem num={2}>Select the department from the dropdown. The current department is shown below for reference.</StepItem>
            <StepItem num={3}>Click <Lbl>Assign</Lbl>. The department badge on the employee row updates immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔗 How to link an employee to their worker login account</div>
            <StepItem num={1}>Find the employee row. Click the orange <Lbl>Link</Lbl> button (or green <Lbl>Relink</Lbl> if already linked).</StepItem>
            <img src={checkWhoLinkedImg} alt="Link user account modal" style={imgStyle} />
            <StepItem num={2}>
              Select the worker's login account from the dropdown. Only accounts with the <strong>Worker</strong> role are shown.
            </StepItem>
            <StepItem num={3}>Click <Lbl>Save Link</Lbl>. The employee's <strong>Linked</strong> badge turns green (Linked ✓).</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit an employee</div>
            <StepItem num={1}>Click the <Lbl>✏️</Lbl> pencil icon on the employee row.</StepItem>
            <StepItem num={2}>Update any field as needed.</StepItem>
            <StepItem num={3}>Click <Lbl>Save Changes</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔄 How to activate or deactivate an employee</div>
            <StepItem num={1}>Find the employee row. Click their <strong>Active</strong> or <strong>Inactive</strong> status badge.</StepItem>
            <StepItem num={2}>The status toggles immediately. Inactive employees cannot log in to the worker dashboard.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 3. CASUAL WORKERS ────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🧑‍🔧</div>
          <div>
            <div className="pc-title">Casual Workers</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Manage casual (temporary) workers who are paid per task or day.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={casualWorkersImg} alt="Casual workers list" style={imgStyle} />
          <ScreenMock>
            A table of all casual worker records with name, phone, role, days worked, and daily rate.
            An <strong>Add Worker</strong> button is in the top-right corner. Each row has <strong>✏️ Edit</strong> and <strong>🗑️ Delete</strong> icons.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a casual worker</div>
            <StepItem num={1}>Click <Lbl>Add Worker</Lbl> in the top-right corner.</StepItem>
            <img src={addNewCasualImg} alt="Add casual worker form" style={imgStyle} />
            <StepItem num={2}>Fill in the name, phone number, role, work period (start and end dates), daily rate, and an optional note.</StepItem>
            <StepItem num={3}>
              The <strong>Days Worked</strong> field is calculated automatically from the dates.
              Click <Lbl>Override ON</Lbl> if you need to enter a different number manually.
            </StepItem>
            <StepItem num={4}>Click <Lbl>Add Worker</Lbl> to save the record.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 4. JOB APPROVALS ─────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📋</div>
          <div>
            <div className="pc-title">Job Approvals</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Review and approve jobs submitted by the Sales team before they enter production.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={jobApprovalsImg} alt="Job approvals page" style={imgStyle} />
          <ScreenMock>
            A list or table of jobs pending approval. Each entry shows job number, client, type, amount, and a status badge.
            Actions: <strong>Approve</strong> and <strong>Reject</strong> buttons per row.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">✅ How to approve or reject a job</div>
            <StepItem num={1}>Find the job in the list. Click <Lbl>Approve</Lbl> to confirm it, or <Lbl>Reject</Lbl> to decline.</StepItem>
            <StepItem num={2}>A confirmation modal appears. For rejections, enter a reason.</StepItem>
            <StepItem num={3}>Confirm the action. Approved jobs move to the Production Manager's queue.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 5. PROCUREMENT ───────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>🏪</div>
          <div>
            <div className="pc-title">Procurement</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Manage market suppliers and procurement records.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={produrementImg} alt="Procurement page" style={imgStyle} />
          <ScreenMock>
            A list of procurement suppliers (markets). Each entry shows the supplier name, contact, and category.
            A <strong>New Market</strong> button is in the top-right corner.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">➕ How to add a new market/supplier</div>
            <StepItem num={1}>Click <Lbl>New Market</Lbl> in the top-right corner.</StepItem>
            <img src={newMarketImg} alt="Add new market form" style={imgStyle} />
            <StepItem num={2}>Fill in the supplier name, contact details, and category.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to add the supplier to the list.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 6. PAYROLL ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--green-100)' }}>💰</div>
          <div>
            <div className="pc-title">Payroll</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Create payroll records for employees and casual workers, then move them through Draft → Approved → Paid.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={payrollImg} alt="Payroll page" style={imgStyle} />
          <ScreenMock>
            A table of payroll records filtered by period, type (Employee / Casual Worker), and status (Draft / Approved / Paid).
            Summary cards at the top show total net salary per status. A <strong>New Payroll</strong> button is in the top-right corner.
            Each row has <strong>Approve</strong>, <strong>Mark Paid</strong>, <strong>✏️ Edit</strong>, and <strong>🗑️ Delete</strong> actions depending on the current status.
          </ScreenMock>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>Payroll workflow:</strong></p>
              <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
                <li><strong>Draft</strong> — created but not yet reviewed. Can be edited or deleted.</li>
                <li><strong>Approved</strong> — reviewed and ready for payment. Cannot be edited.</li>
                <li><strong>Paid</strong> — payment has been made. Final state.</li>
              </ul>
            </div>
          </div>

          <div className="step-box">
            <div className="step-box-title">➕ How to create a new payroll record</div>
            <StepItem num={1}>Click <Lbl>New Payroll</Lbl> in the top-right corner.</StepItem>
            <img src={newPayrollImg} alt="New payroll form" style={imgStyle} />
            <StepItem num={2}>Select the worker type: <Lbl>Employee</Lbl> or <Lbl>Casual Worker</Lbl>.</StepItem>
            <StepItem num={3}>Select the employee or casual worker from the dropdown.</StepItem>
            <StepItem num={4}>Fill in the pay period, base salary, and any deductions or bonuses.</StepItem>
            <StepItem num={5}>Click <Lbl>Create Payroll</Lbl>. The record is created as a Draft.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ How to approve a payroll record</div>
            <StepItem num={1}>Find the Draft record in the table. Click the blue <Lbl>Approve</Lbl> button on that row.</StepItem>
            <StepItem num={2}>A confirmation modal appears. Confirm to move the record to Approved status.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">💵 How to mark a payroll as paid</div>
            <StepItem num={1}>Find the Approved record in the table. Click the green <Lbl>Mark Paid</Lbl> button on that row.</StepItem>
            <StepItem num={2}>Confirm in the modal. The record moves to Paid status and cannot be changed further.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 7. LEAVE MANAGEMENT ──────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🌴</div>
          <div>
            <div className="pc-title">Leave Management</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Review and decide on all employee leave requests. Also manage your own leave.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={manageLeaveImg} alt="Leave management page" style={imgStyle} />
          <ScreenMock>
            Two tabs: <strong>Manage Leave</strong> (all employee requests) and <strong>My Leave</strong> (your own requests).
            The Manage Leave tab shows all requests with employee name, leave type, dates, duration, and status.
            Pending requests have <strong>👍 Approve</strong> and <strong>👎 Reject</strong> buttons.
            Filter buttons: All · Pending · Approved · Rejected.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">✅ How to approve or reject a leave request</div>
            <StepItem num={1}>Click <Lbl>Leave Management</Lbl> in the sidebar. Make sure you are on the <Lbl>Manage Leave</Lbl> tab.</StepItem>
            <StepItem num={2}>Find the pending request. Click <Lbl>👍 Approve</Lbl> to approve it.</StepItem>
            <StepItem num={3}>A confirmation modal appears showing the employee name, leave type, and dates. Click <Lbl>Approve</Lbl> to confirm. The employee is notified automatically.</StepItem>
            <StepItem num={4}>To reject: click <Lbl>👎 Reject</Lbl>. Enter a rejection reason (required), then click <Lbl>Reject</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">➕ How to request your own leave</div>
            <StepItem num={1}>Click the <Lbl>My Leave</Lbl> tab at the top of the Leave Management page.</StepItem>
            <img src={myLeaveImg} alt="My Leave tab" style={imgStyle} />
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl> in the top-right corner.</StepItem>
            <StepItem num={3}>Select leave type, start date, end date, reason, and optionally attach a supporting document (PDF, JPG, PNG — max 5 MB).</StepItem>
            <StepItem num={4}>Click <Lbl>Submit Request</Lbl>. Your request appears as Pending.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 8. REPORTS ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Reports</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Generate HR reports, view your saved reports, and review reports shared with you.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">📤 How to generate a report</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar.</StepItem>
            <img src={generateReportImg} alt="Generate report" style={imgStyle} />
            <StepItem num={2}>Select the report type, date range, and recipient.</StepItem>
            <StepItem num={3}>Click <Lbl>Generate Report</Lbl>. The report is saved and appears in My Reports.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📋 View HR Reports</div>
            <img src={reportsImg} alt="HR reports page" style={imgStyle} />
            <StepItem>The Reports page shows HR-specific data reports — employee counts, leave summaries, payroll totals, and more.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📁 My Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → click <Lbl>My Reports</Lbl> in the submenu.</StepItem>
            <img src={myReportsImg} alt="My Reports" style={imgStyle} />
            <StepItem num={2}>All reports you have generated are listed here. Click one to view or download it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📨 Received / Assigned Reports</div>
            <img src={receiveReportImg} alt="Received reports" style={imgStyle} />
            <StepItem num={1}>Reports sent to you by others appear here. Open a report and review it.</StepItem>
          </div>

        </div>
      </div>

      {/* ── 9. NOTIFICATIONS ─────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🔔</div>
          <div>
            <div className="pc-title">Notifications</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Stay informed about leave requests, job updates, and system alerts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            A list of all notifications. Unread items are highlighted. A red badge on the sidebar shows how many are unread.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">🔔 How to check notifications</div>
            <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar.</StepItem>
            <img src={notifyImg} alt="Notifications page" style={imgStyle} />
            <StepItem num={2}>Click any notification to mark it as read and see its full details.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 10. SETTINGS ─────────────────────────────────────────────────── */}
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
            <img src={profileImg} alt="Profile settings" style={imgStyle} />
            <StepItem num={2}>Edit your name, email, or other personal details.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to apply changes.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔑 How to change your password</div>
            <StepItem num={1}>Click <Lbl>⚙️ Settings</Lbl> in the sidebar → select the <Lbl>Password</Lbl> tab.</StepItem>
            <img src={passwordImg} alt="Change password" style={imgStyle} />
            <StepItem num={2}>Enter your <Field>Current Password</Field>, then your <Field>New Password</Field>, and confirm it.</StepItem>
            <StepItem num={3}>Click <Lbl>Update Password</Lbl>. You will stay logged in with the new password.</StepItem>
          </div>

        </div>
      </div>

    </div>
  );
}
