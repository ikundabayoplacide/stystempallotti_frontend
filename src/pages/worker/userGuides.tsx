import dashboardImg      from '../../assets/images/worker/dashboard.png';
import taskBoardImg      from '../../assets/images/worker/taskBoard.png';
import thewayRequestImg  from '../../assets/images/worker/thewayrequest.png';
import itemsImg          from '../../assets/images/worker/items.png';
import requestPageImg    from '../../assets/images/worker/requestpage.png';
import leavePageImg      from '../../assets/images/worker/leavepage.png';
import requestLeaveImg   from '../../assets/images/worker/requestleave.png';
import reportPageImg     from '../../assets/images/worker/reportpage.png';
import materialReportImg from '../../assets/images/worker/materialreport.png';
import myReportsImg      from '../../assets/images/worker/myreports.png';
import reportAssignedImg from '../../assets/images/worker/reportAssigned.png';
import generateReportImg from '../../assets/images/worker/generatereport.png';
import notificationsImg  from '../../assets/images/worker/notifications.png';
import profileImg        from '../../assets/images/worker/profile.png';
import passwordImg       from '../../assets/images/worker/password.png';

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

function ScreenMock({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="screen-mock">
      <div className="screen-mock-title">{title ?? 'What you see on screen'}</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function WorkerUserGuide() {
  return (
    <div>

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="sec-title" id="worker">
        <div className="sec-icon sec-icon-blue">🔧</div>
        <div className="sec-text">
          <h2>Worker</h2>
          <p>Task board, material requests, leave &amp; reports</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As a Worker you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>View your Dashboard — a summary of your assigned jobs and status.</li>
            <li>Work through jobs on your Task Board (start, pause, resume, complete).</li>
            <li>Request materials from the general stock.</li>
            <li>Request leave and check your leave history.</li>
            <li>Generate, view, and review reports.</li>
            <li>Check notifications.</li>
            <li>Update your profile and change your password.</li>
          </ul>
        </div>
      </div>

      <div className="warn-box">
        <span className="box-icon">⚠️</span>
        <div className="box-content">
          <p><strong>Account must be linked:</strong> Your employee record must be linked to your login account by
            the Administrator or HR. If you see "Employee profile not linked", contact your administrator immediately.</p>
        </div>
      </div>

      {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard (My Jobs)</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Your home page — a quick overview of all your assigned jobs and their current state.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={dashboardImg} alt="Worker Dashboard" style={imgStyle} />
          <ScreenMock>
            Summary cards showing your job counts by status. Below the cards, a list of all jobs assigned to you
            with their title, due date, priority badge, and current progress. Click any job to see its details.
          </ScreenMock>
          <p style={{ fontSize: '.8rem', margin: '.75rem 0 0', color: 'var(--color-custom-700)' }}>
            Your sidebar: <strong>My Jobs, Task Board, Material Requests, My Leave, Reports ▾, Notifications, Settings.</strong>
          </p>
        </div>
      </div>

      {/* ── 2. TASK BOARD ────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🗂️</div>
          <div>
            <div className="pc-title">Task Board</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              A Kanban-style board where you manage your active jobs — start, pause, resume, and complete them.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={taskBoardImg} alt="Task Board" style={imgStyle} />

          <ScreenMock title="Kanban board — 4 columns">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.5rem', fontSize: '.75rem' }}>
              <div style={{ background: 'var(--blue-pale)', border: '1px solid var(--blue-100)', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: 'var(--blue2)' }}>📋 To Do</strong><br /><span style={{ color: 'var(--gray-500)' }}>Assigned, not started</span>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: '#a16207' }}>⚡ In Progress</strong><br /><span style={{ color: 'var(--gray-500)' }}>Currently working</span>
              </div>
              <div style={{ background: 'var(--orange-pale)', border: '1px solid var(--orange-100)', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: 'var(--orange)' }}>⏸ Paused</strong><br /><span style={{ color: 'var(--gray-500)' }}>Temporarily stopped</span>
              </div>
              <div style={{ background: 'var(--green-pale)', border: '1px solid var(--green-100)', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: 'var(--green2)' }}>✅ Completed</strong><br /><span style={{ color: 'var(--gray-500)' }}>Work finished</span>
              </div>
            </div>
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">📋 How to work through a job</div>
            <StepItem num={1}><strong>To start a job:</strong> Find it in the <strong>To Do</strong> column. Click <Lbl>Start</Lbl>. The card moves to <strong>In Progress</strong>. Your Supervisor can see you have started.</StepItem>
            <StepItem num={2}><strong>To pause:</strong> In the <strong>In Progress</strong> column, click <Lbl>Pause</Lbl>. The card moves to <strong>Paused</strong>.</StepItem>
            <StepItem num={3}><strong>To resume:</strong> In the <strong>Paused</strong> column, click <Lbl>Resume</Lbl>. The card returns to <strong>In Progress</strong>.</StepItem>
            <StepItem num={4}><strong>To complete:</strong> In <strong>In Progress</strong>, click <Lbl>Complete</Lbl>. The card moves to <strong>Completed</strong>. Your Supervisor can now mark the department as Done.</StepItem>
            <StepItem num={5}>Click any job card to open a detail view with the job description, deadline, and timestamps.</StepItem>
          </div>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p>You <strong>must</strong> click <Lbl>Complete</Lbl> before your Supervisor can mark the
                department's work as Done. Never forget to complete your job cards when you finish.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MATERIAL REQUESTS ─────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>📦</div>
          <div>
            <div className="pc-title">Material Requests</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Request materials from the general stock. The stock manager will approve or reject your request.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={itemsImg} alt="Available stock items" style={imgStyle} />

          <ScreenMock>
            Two panels: <strong>Left</strong> — Available Items in General Stock (item name, category, current
            stock level with OK / Low / Out indicator). <strong>Right</strong> — My Requests (all your requests
            with status: Pending / Approved / Rejected). Summary cards at the top: Pending · Approved · Rejected
            counts. A <strong>New Request</strong> button is in the top-right corner.
          </ScreenMock>

          <img src={requestPageImg} alt="My Requests panel" style={imgStyle} />

          <div className="step-box">
            <div className="step-box-title">➕ How to request materials</div>
            <StepItem num={1}>Click <Lbl>New Request</Lbl>. A modal opens.</StepItem>
            <img src={thewayRequestImg} alt="New request modal" style={imgStyle} />
            <StepItem num={2}>Select a stock item from the dropdown — it shows the current available quantity.</StepItem>
            <StepItem num={3}>Enter the <Field>Quantity</Field> you need, then click the <Lbl>+</Lbl> button to add it to your request list.</StepItem>
            <StepItem num={4}>Add more items the same way if needed.</StepItem>
            <StepItem num={5}>Enter a <Field>Reason</Field> (required — e.g., "Running low on paper for job JOB-045").</StepItem>
            <StepItem num={6}>Click <Lbl>Submit Request</Lbl>. Your request appears in <strong>My Requests</strong> with a Pending status.</StepItem>
          </div>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p>Once submitted, you cannot edit the request. If approved, the quantity is deducted from stock.
                If rejected, you can submit a new request.</p>
            </div>
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
          <img src={leavePageImg} alt="Leave history page" style={imgStyle} />
          <ScreenMock>
            A list of all your leave requests showing leave type, start and end dates, reason, and status
            (Pending / Approved / Rejected). A <strong>Request Leave</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to request leave</div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl> in the top-right corner.</StepItem>
            <img src={requestLeaveImg} alt="Request leave form" style={imgStyle} />
            <StepItem num={3}>Fill in the form: leave type, start date, end date, and reason.</StepItem>
            <StepItem num={4}>Click <Lbl>Submit</Lbl>. Your request appears in the list with a Pending status until your manager approves it.</StepItem>
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
              View your job and material reports, generate new reports, and review reports assigned to you.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">📋 My Jobs Report</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar.</StepItem>
            <img src={reportPageImg} alt="Jobs report page" style={imgStyle} />
            <StepItem num={2}>This page shows a summary of all jobs you have worked on, their status, and completion times.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📦 Material Requests Report</div>
            <img src={materialReportImg} alt="Material requests report" style={imgStyle} />
            <StepItem>A history of all your material requests with their approval status and quantities.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📤 How to generate a report</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → click <Lbl>Generate Report</Lbl>.</StepItem>
            <img src={generateReportImg} alt="Generate report form" style={imgStyle} />
            <StepItem num={2}>Fill in the report form — select the type, date range, and the person who should receive it.</StepItem>
            <StepItem num={3}>Click <Lbl>Submit</Lbl>. The report is saved and appears in My Reports.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📁 My Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → click <Lbl>My Reports</Lbl> in the submenu.</StepItem>
            <img src={myReportsImg} alt="My Reports list" style={imgStyle} />
            <StepItem num={2}>All reports you have generated are listed here. Click one to view or download it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📨 Assigned Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> → <Lbl>Assigned Reports</Lbl> to see reports others have sent to you.</StepItem>
            <img src={reportAssignedImg} alt="Assigned Reports" style={imgStyle} />
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
              Stay informed about job assignments, leave decisions, material request updates, and system alerts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            A list of all notifications. Unread notifications are highlighted. A red badge on the sidebar
            Notifications icon shows how many are unread.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">🔔 How to check notifications</div>
            <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar. The red badge disappears once you open the page.</StepItem>
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
            <StepItem num={2}>Edit your name, email, or other personal details on the profile form.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to apply your changes.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔑 How to change your password</div>
            <StepItem num={1}>Click <Lbl>⚙️ Settings</Lbl> in the sidebar → select the <Lbl>Password</Lbl> tab.</StepItem>
            <img src={passwordImg} alt="Change password page" style={imgStyle} />
            <StepItem num={2}>Enter your <Field>Current Password</Field>, then your <Field>New Password</Field>, and confirm it.</StepItem>
            <StepItem num={3}>Click <Lbl>Update Password</Lbl>. You will stay logged in with the new password.</StepItem>
          </div>

        </div>
      </div>

    </div>
  );
}
