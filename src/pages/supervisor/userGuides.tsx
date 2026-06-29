import supervisorDashboardImg   from '../../assets/images/supervisor/supervisorDashboard.png';
import jobsImg                  from '../../assets/images/supervisor/jobs.png';
import employeeImg              from '../../assets/images/supervisor/employee.png';
import machineImg               from '../../assets/images/supervisor/machine.png';
import editMachineImg           from '../../assets/images/supervisor/editMachine.png';
import assignedWorkerImg        from '../../assets/images/supervisor/assignedWorker.png';
import changeAssignedWorkerImg  from '../../assets/images/supervisor/changeAssignedWorker.png';
import stockImg                 from '../../assets/images/supervisor/stock.png';
import addnewItemImg            from '../../assets/images/supervisor/addnewItem.png';
import editItemImg              from '../../assets/images/supervisor/editItem.png';
import deleteItemImg            from '../../assets/images/supervisor/deleteItem.png';
import addQuantityImg           from '../../assets/images/supervisor/addQuantityToCurrentOne.png';
import requestedStockImg        from '../../assets/images/supervisor/requestedStock.png';
import requestLeaveImg          from '../../assets/images/supervisor/requestLeave.png';
import reportsImg               from '../../assets/images/supervisor/reports.png';
import myReportsImg             from '../../assets/images/supervisor/myreports.png';
import assignedReportsImg       from '../../assets/images/supervisor/assignedreports.png';
import notificationsImg         from '../../assets/images/supervisor/notifications.png';
import profileImg               from '../../assets/images/supervisor/profile.png';
import passImg                  from '../../assets/images/supervisor/pass.png';
import logoutImg                from '../../assets/images/supervisor/logout.png';

const imgStyle: React.CSSProperties = { maxWidth: '100%', height: 'auto', marginTop: '.5rem', borderRadius: '8px', border: '1px solid var(--color-custom-200)' };

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

export default function SupervisorUserGuide() {
  return (
    <div>

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="sec-title" id="supervisor">
        <div className="sec-icon sec-icon-blue">🎯</div>
        <div className="sec-text">
          <h2>Supervisor</h2>
          <p>Department job management, machines &amp; binding stock</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As a Supervisor you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>See your department's KPI cards on the Dashboard and navigate quickly to each section.</li>
            <li>Assign jobs to workers, track their progress, and mark department work as Done.</li>
            <li>View all employees in your department.</li>
            <li><em>(Binding supervisor only)</em> Manage machines — add, edit, assign workers, reassign workers.</li>
            <li><em>(Binding supervisor only)</em> Manage binding stock items — add, edit, restock, delete — and approve or reject stock requests from workers.</li>
            <li>Request leave and check your leave history.</li>
            <li>Generate and review reports assigned to you.</li>
          </ul>
        </div>
      </div>

      <div className="warn-box">
        <span className="box-icon">⚠️</span>
        <div className="box-content">
          <p><strong>Department Required:</strong> Your account must be assigned to a department by an Administrator.
            If you see "Your account is not assigned to a department", contact Admin before continuing.</p>
        </div>
      </div>

      {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Your home page — a snapshot of everything happening in your department right now.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={supervisorDashboardImg} alt="Supervisor Dashboard" style={imgStyle} />

          <ScreenMock>
            Six clickable KPI cards at the top: <strong>Active Jobs · Total Employees · Total Machines ·
            Completed Today · Urgent · Low Stock</strong> (Low Stock only visible to binding supervisors).
            Below the cards: a Workers workload panel and a Jobs in Production table.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">🔗 Using the KPI cards</div>
            <StepItem>Each card is a shortcut. Click any card to go directly to that section:</StepItem>
            <StepItem><Lbl>Active Jobs</Lbl> → takes you to the Jobs page.</StepItem>
            <StepItem><Lbl>Total Employees</Lbl> → takes you to the Employees page.</StepItem>
            <StepItem><Lbl>Total Machines</Lbl> → takes you to the Machines page.</StepItem>
            <StepItem><Lbl>Completed Today</Lbl> → takes you to the Jobs page.</StepItem>
            <StepItem><Lbl>Urgent</Lbl> → takes you to the Jobs page (look for jobs highlighted in red).</StepItem>
            <StepItem><Lbl>Low Stock</Lbl> → takes you to the Binding Stock page.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 2. JOBS ──────────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📋</div>
          <div>
            <div className="pc-title">Jobs</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              See every job assigned to your department, assign workers, and mark work as done.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={jobsImg} alt="Jobs page" style={imgStyle} />

          <ScreenMock>
            A table showing only jobs assigned to <strong>your department</strong>. Columns: Job #, Client,
            Status, Dept State, Progress, Priority, Due Date, Actions. Urgent jobs are highlighted in red.
            Summary cards at the top show Active, Dept Done, Completed, and Urgent counts.
            Each row has a <strong>⋮ Actions</strong> button on the right.
          </ScreenMock>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>Three tracking fields per job:</strong></p>
              <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
                <li><strong>Status</strong> — the overall job stage (e.g., In Production, Completed).</li>
                <li><strong>Dept State</strong> — your department's specific sub-state (e.g., in-binding → binding-done).</li>
                <li><strong>Progress</strong> — the individual worker's progress (Started / Paused / Resumed / Completed).</li>
              </ul>
            </div>
          </div>

          <div className="step-box">
            <div className="step-box-title">👤 How to assign a job to a worker</div>
            <StepItem num={1}>Find the job row in the table.</StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> in the Actions column → select <Lbl>Assign</Lbl>.</StepItem>
            <StepItem num={3}>
              A list of employees in your department appears. Each worker shows their availability status:
              <strong> Available</strong>, <strong>Has other job</strong>, or <strong>Already assigned</strong>.
            </StepItem>
            <StepItem num={4}>Click the worker's name to assign them. The job now appears on their Task Board.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ How to mark your department's work as Done</div>
            <StepItem num={1}>
              The <Lbl>Mark Done</Lbl> option only becomes available after the assigned worker has set their
              progress to <strong>Completed</strong>.
            </StepItem>
            <StepItem num={2}>Click <Lbl>⋮</Lbl> → <Lbl>Mark Done</Lbl>. A confirmation modal appears showing the current Dept State and what it will change to.</StepItem>
            <StepItem num={3}>Click <Lbl>Confirm — Mark Done</Lbl>. The Production Manager can then advance the job to the next department.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 3. EMPLOYEES ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👥</div>
          <div>
            <div className="pc-title">Employees</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View all active employees assigned to your department and their current workload.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={employeeImg} alt="Employees page" style={imgStyle} />
          <ScreenMock>
            A list or grid of employees in your department. Each card shows the worker's name, contract type,
            and a workload bar indicating how many jobs they currently have.
          </ScreenMock>
        </div>
      </div>

      {/* ── 4. MACHINES (binding supervisor only) ───────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--purple-100, #f3e8ff)' }}>⚙️</div>
          <div>
            <div className="pc-title">Machines <span style={{ fontSize: '.75rem', color: 'var(--color-custom-700)', fontWeight: 400 }}>(Binding supervisor only)</span></div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Add and manage binding machines, assign workers to machines, or reassign them.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={machineImg} alt="Machines page" style={imgStyle} />

          <ScreenMock>
            A grid of machine cards. Each card shows the machine name, status badge (Active / Maintenance / Inactive),
            the list of workers currently assigned to that machine, a <strong>Workers</strong> button, and an <strong>Edit</strong> button.
            Summary counts at the top: Total · Active · Maintenance · Inactive.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a new machine</div>
            <StepItem num={1}>Click the <Lbl>Add Machine</Lbl> button in the top-right corner.</StepItem>
            <StepItem num={2}>Fill in the Name (required), Status, Description, and an optional Note.</StepItem>
            <StepItem num={3}>Click <Lbl>Create</Lbl>. The new machine card appears in the grid immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit a machine</div>
            <StepItem num={1}>Find the machine card and click <Lbl>Edit</Lbl>.</StepItem>
            <img src={editMachineImg} alt="Edit machine modal" style={imgStyle} />
            <StepItem num={2}>Change the Name, Status, Description, or Note as needed.</StepItem>
            <StepItem num={3}>Click <Lbl>Save Changes</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👤 How to assign a worker to a machine</div>
            <StepItem num={1}>Click <Lbl>Workers</Lbl> on the machine card.</StepItem>
            <img src={assignedWorkerImg} alt="Assign worker modal" style={imgStyle} />
            <StepItem num={2}>
              The <strong>Manage Workers</strong> modal opens. Under <strong>Assign New Worker</strong>,
              select an employee from the dropdown. Only employees not already assigned to this machine appear.
            </StepItem>
            <StepItem num={3}>Optionally add a note, then click <Lbl>Assign</Lbl>. The worker appears in the Assigned Workers list below.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔄 How to reassign a worker to a different employee</div>
            <StepItem num={1}>Click <Lbl>Workers</Lbl> on the machine card to open the Manage Workers modal.</StepItem>
            <img src={changeAssignedWorkerImg} alt="Reassign worker" style={imgStyle} />
            <StepItem num={2}>
              In the Assigned Workers list, find the worker you want to replace.
              Click the <Lbl>⇄</Lbl> (switch) icon next to their name.
            </StepItem>
            <StepItem num={3}>A dropdown appears. Select the replacement employee, then click <Lbl>Reassign</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🗑️ How to remove a worker from a machine</div>
            <StepItem num={1}>Click <Lbl>Workers</Lbl> → find the worker in the Assigned Workers list.</StepItem>
            <StepItem num={2}>Click the red <Lbl>🗑️</Lbl> trash icon next to their name.</StepItem>
            <StepItem num={3}>A confirmation modal appears. Click <Lbl>Yes, Remove</Lbl> to confirm.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 5. BINDING STOCK (binding supervisor only) ──────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--purple-100, #f3e8ff)' }}>📦</div>
          <div>
            <div className="pc-title">Binding Stock <span style={{ fontSize: '.75rem', color: 'var(--color-custom-700)', fontWeight: 400 }}>(Binding supervisor only)</span></div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Manage binding department stock items and review worker stock requests.
            </p>
          </div>
        </div>
        <div className="pc-body">

          {/* Items tab */}
          <img src={stockImg} alt="Binding Stock items tab" style={imgStyle} />

          <ScreenMock>
            Two tabs: <strong>Items</strong> and <strong>Requests</strong>. The Items tab shows a table of all
            binding stock items with columns: Item Name, Category, Unit, Stock (current quantity), Alarm (alarm level),
            Status badge (Available / Low / Out of Stock), and Actions (+ Restock · ✏️ Edit · 🗑️ Delete).
            Summary cards at the top show Total Items, Available, Low Stock, and Out of Stock counts.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a new stock item</div>
            <StepItem num={1}>Click <Lbl>Add Item</Lbl> in the top-right of the Items tab.</StepItem>
            <img src={addnewItemImg} alt="Add new item modal" style={imgStyle} />
            <StepItem num={2}>
              Fill in the form:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><strong>Item Name</strong> — required (e.g., Binding Wire).</li>
                <li><strong>Category</strong> — required (e.g., Binding Materials).</li>
                <li><strong>Unit</strong> — required (e.g., rolls, pcs, kg).</li>
                <li><strong>Alarm Stock Level</strong> — the quantity at which the item shows as Low Stock.</li>
                <li><strong>Initial Stock</strong> — the starting quantity when creating a new item.</li>
                <li><strong>Description</strong> — optional.</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click <Lbl>Create Item</Lbl>. The item appears in the table immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit a stock item</div>
            <StepItem num={1}>Find the item row in the table. Click the <Lbl>✏️</Lbl> pencil icon in the Actions column.</StepItem>
            <img src={editItemImg} alt="Edit item modal" style={imgStyle} />
            <StepItem num={2}>Update any field (Name, Category, Unit, Alarm Stock Level, Description).</StepItem>
            <StepItem num={3}>Click <Lbl>Save Changes</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📥 How to restock (add quantity to an existing item)</div>
            <StepItem num={1}>Find the item row. Click the <Lbl>+</Lbl> green restock icon in the Actions column.</StepItem>
            <img src={addQuantityImg} alt="Restock modal" style={imgStyle} />
            <StepItem num={2}>Enter the quantity to add and an optional note.</StepItem>
            <StepItem num={3}>Click <Lbl>Add Stock</Lbl>. The item's current stock count updates immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🗑️ How to delete a stock item</div>
            <StepItem num={1}>Find the item row. Click the <Lbl>🗑️</Lbl> red trash icon in the Actions column.</StepItem>
            <img src={deleteItemImg} alt="Delete item confirmation modal" style={imgStyle} />
            <StepItem num={2}>A confirmation modal appears with the item name. Click <Lbl>Yes, Delete</Lbl> to confirm, or <Lbl>Cancel</Lbl> to go back.</StepItem>
          </div>

          {/* Requests tab */}
          <div className="step-box">
            <div className="step-box-title">📬 How to review worker stock requests (Requests tab)</div>
            <img src={requestedStockImg} alt="Stock requests tab" style={imgStyle} />
            <ScreenMock>
              The Requests tab lists all stock requests submitted by workers. Each card shows: item name, who
              requested it, the date, quantity, and reason. Pending requests have <strong>Approve</strong> and
              <strong> Reject</strong> buttons. A yellow badge at the top shows how many requests are pending.
            </ScreenMock>
            <StepItem num={1}>Click the <Lbl>Requests</Lbl> tab. Pending requests appear at the top.</StepItem>
            <StepItem num={2}>
              To approve: click <Lbl>Approve</Lbl>. A confirmation modal shows the request details.
              Click <Lbl>Yes, Approve</Lbl>. The quantity is automatically deducted from stock.
            </StepItem>
            <StepItem num={3}>
              To reject: click <Lbl>Reject</Lbl>. A confirmation modal appears. Click <Lbl>Yes, Reject</Lbl>.
            </StepItem>
            <StepItem>Use the <Lbl>All Requests</Lbl> filter dropdown to view Pending, Approved, or Rejected requests.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 6. MY LEAVE ──────────────────────────────────────────────────── */}
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
          <img src={requestLeaveImg} alt="My Leave page" style={imgStyle} />
          <ScreenMock>
            A list of all your leave requests with their status (Pending / Approved / Rejected), dates, type, and reason.
            A <strong>Request Leave</strong> button is in the top-right corner.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">➕ How to request leave</div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl> in the top-right corner.</StepItem>
            <StepItem num={3}>Fill in the form: leave type, start date, end date, and reason.</StepItem>
            <StepItem num={4}>Click <Lbl>Submit</Lbl>. Your request appears in the list with a Pending status until approved.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 7. REPORTS ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Reports</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Generate department reports and review reports assigned to you.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">📤 Generate Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar.</StepItem>
            <img src={reportsImg} alt="Generate reports" style={imgStyle} />
            <StepItem num={2}>Select the report type and date range, then click <Lbl>Generate</Lbl>.</StepItem>
            <StepItem num={3}>The report is saved and appears in your My Reports list.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📁 My Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → then click <Lbl>My Reports</Lbl> in the submenu.</StepItem>
            <img src={myReportsImg} alt="My Reports" style={imgStyle} />
            <StepItem num={2}>All reports you have generated are listed here. Click a report to view or download it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📨 Assigned Reports</div>
            <StepItem num={1}>Reports assigned to you by others appear here.</StepItem>
            <img src={assignedReportsImg} alt="Assigned Reports" style={imgStyle} />
            <StepItem num={2}>Open a report, review it, and take action as required.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 8. NOTIFICATIONS ─────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🔔</div>
          <div>
            <div className="pc-title">Notifications</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Stay up to date with job updates, approvals, and system alerts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar. A red badge shows the number of unread notifications.</StepItem>
          <img src={notificationsImg} alt="Notifications page" style={imgStyle} />
          <StepItem num={2}>Click a notification to mark it as read and see more details.</StepItem>
        </div>
      </div>

      {/* ── 9. SETTINGS ──────────────────────────────────────────────────── */}
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
            <StepItem num={2}>Edit your name, email, or other profile details.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to apply changes.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔑 How to change your password</div>
            <StepItem num={1}>Click <Lbl>⚙️ Settings</Lbl> in the sidebar → select the <Lbl>Password</Lbl> tab.</StepItem>
            <img src={passImg} alt="Change password" style={imgStyle} />
            <StepItem num={2}>Enter your current password, then your new password, and confirm it.</StepItem>
            <StepItem num={3}>Click <Lbl>Update Password</Lbl>. You will stay logged in with the new password.</StepItem>
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
