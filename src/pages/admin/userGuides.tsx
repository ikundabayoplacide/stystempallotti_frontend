
import dashboardImg          from '../../assets/images/admin/dashboard.png';
import usersImg              from '../../assets/images/admin/users.png';
import newUserImg            from '../../assets/images/admin/newUser.png';
import customerImg           from '../../assets/images/admin/customer.png';
import newCustomerImg        from '../../assets/images/admin/newCustomer.png';
import departmentImg         from '../../assets/images/admin/department.png';
import newDepartmentImg      from '../../assets/images/admin/newDepartment.png';
import viewDepartmentImg     from '../../assets/images/admin/viewDepartment.png';
import jobsImg               from '../../assets/images/admin/jobs.png';
import createJobStep1Img     from '../../assets/images/admin/createJobStep1.png';
import createJob2StepsImg    from '../../assets/images/admin/createJob2Steps.png';
import jobCreateUploadImg    from '../../assets/images/admin/jobCreateUploadImage.png';
import summarizedJobImg      from '../../assets/images/admin/summarizedJobCreation.png';
import productionImg         from '../../assets/images/admin/productionOverView.png';
import financialImg          from '../../assets/images/admin/financialDaashboard.png';
import generalStockImg       from '../../assets/images/admin/generalStock.png';
import newStockItemImg       from '../../assets/images/admin/newStockItem.png';
import requestsStockImg      from '../../assets/images/admin/requestsOfGeneralStock.png';
import boutiqueStockImg      from '../../assets/images/admin/BoutiqueStock.png';
import addBoutiqueItemImg    from '../../assets/images/admin/addNewBoutiqueItem.png';
import boutiquePendingImg    from '../../assets/images/admin/BoutiquePendingsStockTOapprove.png';
import bindingItemsImg       from '../../assets/images/admin/BIndingItems.png';
import addBindingItemImg     from '../../assets/images/admin/AddItemsInBindingStock.png';
import bindingRequestsImg    from '../../assets/images/admin/bindingRequests.png';
import machineImg            from '../../assets/images/admin/machine.png';
import newMachineImg         from '../../assets/images/admin/newMachine.png';
import salesHobeImg          from '../../assets/images/admin/salesHobe.png';
import salesBoutiqueImg      from '../../assets/images/admin/salesBoutique.png';
import leaveImg              from '../../assets/images/admin/leaveManagement.png';
import allReportsImg         from '../../assets/images/admin/AllReports.png';
import assignedReportsImg    from '../../assets/images/admin/AssignedReports.png';
import permissionsImg        from '../../assets/images/admin/providingPermissionsTorole.png';
import notificationsImg      from '../../assets/images/admin/checkNotification.png';
import systemProfileImg      from '../../assets/images/admin/systemProfile.png';
import logoutImg             from '../../assets/images/admin/logout.png';
import casualWorkerImg       from '../../assets/images/admin/casualWorker.png';
import addCasualImg          from '../../assets/images/admin/addnewCasual.png';

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

export default function AdminUserGuide() {
  return (
    <div>

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="sec-title" id="admin">
        <div className="sec-icon sec-icon-blue">🛡️</div>
        <div className="sec-text">
          <h2>Administrator</h2>
          <p>Full system access — users, jobs, stock, finance, production &amp; settings</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As an Administrator you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>View the Director Dashboard — live KPIs for jobs, revenue, and operations.</li>
            <li>Create, edit, activate, and deactivate system users.</li>
            <li>Manage customers and departments.</li>
            <li>Create and manage all jobs in the system.</li>
            <li>Monitor production, financial data, and sales.</li>
            <li>Manage all stock: General Stock, Boutique Stock, and Binding Stock.</li>
            <li>Manage machines and casual workers.</li>
            <li>Review and approve all employee leave requests.</li>
            <li>View all reports and reports assigned to you.</li>
            <li>Configure role permissions through UI Permissions.</li>
            <li>Check notifications, update your profile, and change your password.</li>
          </ul>
        </div>
      </div>

      <p style={{ fontSize: '.85rem', color: 'var(--color-custom-700)', marginBottom: '1rem' }}>
        Your sidebar: <strong>Dashboard · Users · Customers · Departments · Jobs · Production ·
        Financial · Sales ▾ · Stock ▾ · Machines · Casual Workers · Leave · Reports ▾ · UI Permissions · Notifications · Settings.</strong>
      </p>


      {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              A real-time overview of all operations across the entire system.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={dashboardImg} alt="Admin Dashboard" style={imgStyle} />

          <ScreenMock>
            Six KPI cards at the top: <strong>Jobs In Progress · Completed Today · Delayed Jobs ·
            Revenue (RWF) · Payments Received · Outstanding</strong>.
            Below: panels for <strong>Production Departments</strong> (active jobs per dept),
            <strong> Low Stock Alerts</strong>, and <strong>Outstanding Balances</strong>.
            A second row shows <strong>Delayed Jobs Tracker</strong> and <strong>Bottleneck Detection</strong>.
            A <strong>Show More Details</strong> button reveals Performance Metrics, Client Overview,
            Upcoming Deadlines, Staff Overview, and Recent Jobs.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">📊 Reading the dashboard</div>
            <StepItem><Lbl>Jobs In Progress</Lbl> — total jobs currently active in any production stage.</StepItem>
            <StepItem><Lbl>Delayed Jobs</Lbl> — jobs that have passed their due date and are not yet completed.</StepItem>
            <StepItem><Lbl>Outstanding</Lbl> — total revenue minus payments received.</StepItem>
            <StepItem>Click <Lbl>Show More Details</Lbl> to expand performance metrics, staff overview, and recent jobs table.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 2. USERS ─────────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👤</div>
          <div>
            <div className="pc-title">Users</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Create and manage all system user accounts and their roles.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={usersImg} alt="User Management page" style={imgStyle} />

          <ScreenMock>
            Four summary cards: <strong>Total Users · Active Users · Inactive Users · Workers</strong>.
            A table lists all users with columns: No, User (name), Phone/Email, Role badge, Department, Status, Actions.
            Filters at the top: search bar, <strong>All Roles</strong> dropdown, <strong>All Status</strong> dropdown.
            Each row has three action icons: <strong>✏️ Edit · ✕ Deactivate (or ✓ Activate) · 🗑️ Delete</strong>.
            A <strong>Create User</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to create a new user</div>
            <StepItem num={1}>Click <Lbl>Create User</Lbl> in the top-right corner.</StepItem>
            <img src={newUserImg} alt="Create user modal" style={imgStyle} />
            <StepItem num={2}>
              Fill in the form:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><strong>Full Name</strong> — required, at least 3 characters.</li>
                <li><strong>Email</strong> — required, must be a valid email address.</li>
                <li><strong>Password</strong> and <strong>Confirm Password</strong> — required, minimum 5 characters.</li>
                <li><strong>Phone</strong> — required.</li>
                <li><strong>Gender</strong> — required (Male / Female / Other).</li>
                <li><strong>Role</strong> — required. Select the role for this user.</li>
                <li><strong>Department</strong> — optional. Assign to a production department (needed for Supervisors and Workers).</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click <Lbl>Create User</Lbl>. The user appears in the table immediately and can log in right away.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit a user</div>
            <StepItem num={1}>Find the user row. Click the <Lbl>✏️</Lbl> pencil icon.</StepItem>
            <StepItem num={2}>Update any field (name, email, phone, gender, role, or department). Password is not required when editing.</StepItem>
            <StepItem num={3}>Click <Lbl>Save Changes</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔒 How to deactivate or activate a user</div>
            <StepItem num={1}>Find the user row. Click the <Lbl>✕</Lbl> yellow icon to deactivate an active user, or the <Lbl>✓</Lbl> green icon to activate an inactive user.</StepItem>
            <StepItem num={2}>A confirmation modal appears. Confirm the action. A deactivated user loses system access immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🗑️ How to delete a user</div>
            <StepItem num={1}>Click the <Lbl>🗑️</Lbl> red trash icon on the user row.</StepItem>
            <StepItem num={2}>A confirmation modal appears. Type the user's name to confirm, then click <Lbl>Delete</Lbl>. This action cannot be undone.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 3. CUSTOMERS ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🏢</div>
          <div>
            <div className="pc-title">Customers</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View and manage all clients in the system.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={customerImg} alt="Customers page" style={imgStyle} />

          <ScreenMock>
            A table of all customers with columns: Name, Company, Phone, Email, and Actions (Edit · Delete).
            A search bar at the top filters customers by name or company.
            A <strong>Add Customer</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a new customer</div>
            <StepItem num={1}>Click <Lbl>Add Customer</Lbl> in the top-right corner.</StepItem>
            <img src={newCustomerImg} alt="Add customer modal" style={imgStyle} />
            <StepItem num={2}>Fill in the customer's Name (required), Company, Phone, and Email.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl>. The customer is immediately available when creating jobs.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 4. DEPARTMENTS ───────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>🏭</div>
          <div>
            <div className="pc-title">Departments</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Manage production departments, view their workers, and track active jobs.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={departmentImg} alt="Departments page" style={imgStyle} />

          <ScreenMock>
            Three summary cards: <strong>Total Departments · Total Active Jobs · Unassigned Jobs</strong>.
            A table lists departments with columns: Name, Description, Workers (clickable badge), Active Jobs, Actions (⋮ menu with Edit · Delete).
            A <strong>New Department</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to create a department</div>
            <StepItem num={1}>Click <Lbl>New Department</Lbl> in the top-right corner.</StepItem>
            <img src={newDepartmentImg} alt="New department modal" style={imgStyle} />
            <StepItem num={2}>Enter the department <strong>Name</strong> (required) and an optional <strong>Description</strong>.</StepItem>
            <StepItem num={3}>Click <Lbl>Create</Lbl>. The department is immediately available for job assignments.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👥 How to view workers in a department</div>
            <StepItem num={1}>Click the green <strong>X workers</strong> badge in the Workers column of any department row.</StepItem>
            <img src={viewDepartmentImg} alt="View department workers drawer" style={imgStyle} />
            <StepItem num={2}>A side drawer opens listing all employees assigned to that department — their name, phone, status (Active/Inactive), and contract type.</StepItem>
            <StepItem num={3}>Click the <Lbl>✕</Lbl> button or outside the drawer to close it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit or delete a department</div>
            <StepItem num={1}>Click the <Lbl>⋮</Lbl> three-dot menu on the right of any department row.</StepItem>
            <StepItem num={2}>Select <Lbl>Edit</Lbl> to update the name or description, then click <Lbl>Save Changes</Lbl>.</StepItem>
            <StepItem num={3}>Select <Lbl>Delete</Lbl> to remove the department. A confirmation modal appears — click <Lbl>Delete</Lbl> to confirm. Jobs assigned to this department will become unassigned.</StepItem>
          </div>
        </div>
      </div>


      {/* ── 5. JOBS ──────────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📋</div>
          <div>
            <div className="pc-title">Jobs</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Create and manage all print jobs from intake to completion.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={jobsImg} alt="Jobs page" style={imgStyle} />

          <ScreenMock>
            A table of all jobs with summary cards at the top showing job counts by status.
            Columns: Job #, Client, Status badge, Priority badge, Due Date, Amount, Actions.
            A search bar and status/priority filters are at the top. Each row has a <strong>👁 View</strong> icon
            and an <strong>✏️ Edit</strong> icon in the Actions column.
            A <strong>Create Job</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to create a job — Step 1: Job details</div>
            <StepItem num={1}>Click <Lbl>Create Job</Lbl> in the top-right corner.</StepItem>
            <img src={createJobStep1Img} alt="Create job step 1" style={imgStyle} />
            <StepItem num={2}>
              Fill in Step 1 — Job Details:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><strong>Customer</strong> — select an existing customer or create a new one.</li>
                <li><strong>Title</strong> — the job name (e.g., "Business Cards 1000pcs").</li>
                <li><strong>Job Type</strong> — the category of print work.</li>
                <li><strong>Quantity, Size, Color Mode, Binding Type</strong> — job specifications.</li>
                <li><strong>Priority</strong> — Low / Normal / High / Urgent.</li>
                <li><strong>Due Date</strong> — the delivery deadline.</li>
                <li><strong>Amount</strong> — the job price in RWF.</li>
                <li><strong>Payment Status</strong> and <strong>Payment Method</strong> — financial details.</li>
                <li><strong>Description / Notes</strong> — optional extra information.</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click <Lbl>Next</Lbl> to proceed to Step 2.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">➕ How to create a job — Step 2: Materials &amp; image</div>
            <img src={createJob2StepsImg} alt="Create job step 2 materials" style={imgStyle} />
            <StepItem num={1}>
              In Step 2, add the materials needed for this job. For each material:
              select the stock item, enter the quantity needed, and optionally add a note.
              Click <Lbl>Add Material</Lbl> to add more rows.
            </StepItem>
            <img src={jobCreateUploadImg} alt="Create job upload image" style={imgStyle} />
            <StepItem num={2}>Optionally upload a reference image or design file for the job.</StepItem>
            <StepItem num={3}>Click <Lbl>Create Job</Lbl> to save. The job is created with a <strong>Pending</strong> status.</StepItem>
            <img src={summarizedJobImg} alt="Job creation summary" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* ── 6. PRODUCTION OVERVIEW ───────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏭</div>
          <div>
            <div className="pc-title">Production</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Monitor the entire production pipeline — all jobs, departments, and stages.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={productionImg} alt="Production Overview page" style={imgStyle} />

          <ScreenMock>
            A high-level view of all jobs currently in production. Shows jobs by department and stage,
            with their current status, assigned department, and progress. Delayed jobs are highlighted.
            Filter by status or department to narrow the view.
          </ScreenMock>
        </div>
      </div>

      {/* ── 7. FINANCIAL DASHBOARD ───────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>💰</div>
          <div>
            <div className="pc-title">Financial</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View financial KPIs — total revenue, payments received, and outstanding balances.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={financialImg} alt="Financial Dashboard" style={imgStyle} />

          <ScreenMock>
            Summary cards showing <strong>Total Revenue · Payments Received · Outstanding Balance · Paid Jobs</strong>.
            Charts and tables break down revenue and payments over time.
            Click any row to see the detailed payment history for a specific job.
          </ScreenMock>
        </div>
      </div>

      {/* ── 8. SALES ─────────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>🛒</div>
          <div>
            <div className="pc-title">Sales</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View Hobe sales and Boutique sales activity.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">📦 Hobe Sales</div>
            <img src={salesHobeImg} alt="Hobe sales" style={imgStyle} />
            <StepItem>Click <Lbl>Sales</Lbl> → <Lbl>Hobe</Lbl> in the sidebar to view Hobe trade records — amounts, dates, and payment status.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🏪 Boutique Sales</div>
            <img src={salesBoutiqueImg} alt="Boutique sales" style={imgStyle} />
            <StepItem>Click <Lbl>Sales</Lbl> → <Lbl>Boutique</Lbl> in the sidebar to view boutique sales transactions — items sold, quantities, and revenue.</StepItem>
          </div>

        </div>
      </div>


      {/* ── 9. STOCK ─────────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--purple-100, #f3e8ff)' }}>📦</div>
          <div>
            <div className="pc-title">Stock</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Full visibility and control over General Stock, Boutique Stock, and Binding Stock.
            </p>
          </div>
        </div>
        <div className="pc-body">

          {/* General Stock */}
          <div className="step-box">
            <div className="step-box-title">📋 General Stock</div>
            <img src={generalStockImg} alt="General stock page" style={imgStyle} />
            <ScreenMock>
              Summary cards: <strong>Total Items · Available · Low Stock · Out of Stock</strong>.
              A table of all general stock items with columns: Item Name, Category, Unit, Current Stock, Alarm Level, Status.
              Each row has actions: <strong>+ Restock · ✏️ Edit · 🗑️ Delete</strong>.
              An <strong>Add Item</strong> button is in the top-right corner.
            </ScreenMock>
            <StepItem num={1}>Click <Lbl>Stock</Lbl> → <Lbl>General Stock</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>To add a new item, click <Lbl>Add Item</Lbl>.</StepItem>
            <img src={newStockItemImg} alt="Add general stock item modal" style={imgStyle} />
            <StepItem num={3}>
              Fill in: <strong>Item Name</strong>, <strong>Category</strong>, <strong>Unit</strong>,
              <strong> Alarm Stock Level</strong> (triggers low-stock alert), <strong>Initial Stock</strong>, and optional Description.
              Click <Lbl>Create Item</Lbl>.
            </StepItem>
            <StepItem num={4}>To restock an existing item, click the <Lbl>+</Lbl> green icon on the item row, enter the quantity, and click <Lbl>Add Stock</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📬 Stock Requests (from workers)</div>
            <img src={requestsStockImg} alt="General stock requests" style={imgStyle} />
            <StepItem num={1}>Click the <Lbl>Requests</Lbl> tab on the General Stock page to see all material requests from workers.</StepItem>
            <StepItem num={2}>Each request shows the item, who requested it, quantity, and reason. Pending requests have <Lbl>Approve</Lbl> and <Lbl>Reject</Lbl> buttons.</StepItem>
            <StepItem num={3}>Click <Lbl>Approve</Lbl> to deduct the quantity from stock, or <Lbl>Reject</Lbl> to decline the request.</StepItem>
          </div>

          {/* Boutique Stock */}
          <div className="step-box">
            <div className="step-box-title">🏪 Boutique Stock</div>
            <img src={boutiqueStockImg} alt="Boutique stock page" style={imgStyle} />
            <ScreenMock>
              Two tabs: <strong>Items</strong> and <strong>Pending Approvals</strong>. The Items tab shows all boutique items with price, quantity, and status. Actions: ✏️ Edit · 🗑️ Delete.
              An <strong>Add Item</strong> button is in the top-right corner.
            </ScreenMock>
            <StepItem num={1}>Click <Lbl>Stock</Lbl> → <Lbl>Boutique Stock</Lbl>.</StepItem>
            <StepItem num={2}>To add an item, click <Lbl>Add Item</Lbl>.</StepItem>
            <img src={addBoutiqueItemImg} alt="Add boutique item modal" style={imgStyle} />
            <StepItem num={3}>Fill in: Item Name, Category, Unit, Price, and Initial Quantity. Click <Lbl>Create Item</Lbl>.</StepItem>
            <StepItem num={4}>Click the <Lbl>Pending Approvals</Lbl> tab to review stock additions submitted by reception staff.</StepItem>
            <img src={boutiquePendingImg} alt="Boutique pending approvals" style={imgStyle} />
            <StepItem num={5}>Click <Lbl>Approve</Lbl> to accept the stock update or <Lbl>Reject</Lbl> to decline it.</StepItem>
          </div>

          {/* Binding Stock */}
          <div className="step-box">
            <div className="step-box-title">🔗 Binding Stock</div>
            <img src={bindingItemsImg} alt="Binding stock items" style={imgStyle} />
            <ScreenMock>
              Two tabs: <strong>Items</strong> and <strong>Requests</strong>. The Items tab shows binding materials with quantity and alarm levels. Actions: + Restock · ✏️ Edit · 🗑️ Delete. An <strong>Add Item</strong> button is in the top-right corner.
            </ScreenMock>
            <StepItem num={1}>Click <Lbl>Stock</Lbl> → <Lbl>Binding Stock</Lbl>.</StepItem>
            <StepItem num={2}>To add a binding stock item, click <Lbl>Add Item</Lbl>.</StepItem>
            <img src={addBindingItemImg} alt="Add binding stock item" style={imgStyle} />
            <StepItem num={3}>Fill in: Item Name, Category, Unit, Alarm Level, Initial Stock, and optional Description. Click <Lbl>Create Item</Lbl>.</StepItem>
            <StepItem num={4}>Click the <Lbl>Requests</Lbl> tab to review binding stock requests from workers.</StepItem>
            <img src={bindingRequestsImg} alt="Binding stock requests" style={imgStyle} />
            <StepItem num={5}>Click <Lbl>Approve</Lbl> to deduct stock or <Lbl>Reject</Lbl> to decline the request.</StepItem>
          </div>

        </div>
      </div>

      {/* ── 10. MACHINES ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>⚙️</div>
          <div>
            <div className="pc-title">Machines</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View and manage all binding machines in the system.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={machineImg} alt="Machines page" style={imgStyle} />

          <ScreenMock>
            A grid of machine cards. Each card shows: machine name, status badge (Active / Maintenance / Inactive),
            assigned workers, a <strong>Workers</strong> button, and an <strong>Edit</strong> button.
            Summary counts at the top: Total · Active · Maintenance · Inactive.
            An <strong>Add Machine</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a machine</div>
            <StepItem num={1}>Click <Lbl>Add Machine</Lbl> in the top-right corner.</StepItem>
            <img src={newMachineImg} alt="Add machine modal" style={imgStyle} />
            <StepItem num={2}>Enter the machine <strong>Name</strong> (required), <strong>Status</strong>, <strong>Description</strong>, and an optional <strong>Note</strong>.</StepItem>
            <StepItem num={3}>Click <Lbl>Create</Lbl>. The machine card appears in the grid immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✏️ How to edit a machine</div>
            <StepItem num={1}>Find the machine card and click <Lbl>Edit</Lbl>.</StepItem>
            <StepItem num={2}>Update the Name, Status, Description, or Note.</StepItem>
            <StepItem num={3}>Click <Lbl>Save Changes</Lbl>.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 11. CASUAL WORKERS ───────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👷</div>
          <div>
            <div className="pc-title">Casual Workers</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Manage non-permanent casual staff records.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={casualWorkerImg} alt="Casual workers page" style={imgStyle} />

          <ScreenMock>
            A table listing all casual workers with their name, phone, department, and contract details.
            An <strong>Add Casual Worker</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to add a casual worker</div>
            <StepItem num={1}>Click <Lbl>Add Casual Worker</Lbl>.</StepItem>
            <img src={addCasualImg} alt="Add casual worker modal" style={imgStyle} />
            <StepItem num={2}>Fill in the worker's details: name, phone, department, and any relevant notes.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl>. The worker is added to the list.</StepItem>
          </div>
        </div>
      </div>


      {/* ── 12. LEAVE MANAGEMENT ─────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🌴</div>
          <div>
            <div className="pc-title">Leave Management</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Review and approve or reject all employee leave requests across the system.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={leaveImg} alt="Leave Management page" style={imgStyle} />

          <ScreenMock>
            Three summary cards: <strong>Pending · Approved · Rejected</strong>.
            A table lists all leave requests with columns: Employee, Type, Period, Duration, Days Remaining, Submitted, Status, Actions.
            Each row has a <strong>👁 View</strong> icon, a <strong>👍 Approve</strong> icon (pending only), and a <strong>👎 Reject</strong> icon (pending only).
            Filter buttons at the top: <strong>All · Pending · Approved · Rejected</strong>.
            A search bar filters by employee name.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">✅ How to approve a leave request</div>
            <StepItem num={1}>Find a request with <strong>Pending</strong> status. Click the <Lbl>👍</Lbl> approve icon in the Actions column.</StepItem>
            <StepItem num={2}>A modal shows the request details. Click <Lbl>Approve</Lbl> to confirm. The employee is notified automatically.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">❌ How to reject a leave request</div>
            <StepItem num={1}>Click the <Lbl>👎</Lbl> reject icon on a pending request.</StepItem>
            <StepItem num={2}>A modal opens. Enter the <strong>Rejection Reason</strong> (required), then click <Lbl>Reject</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👁 How to view full leave details</div>
            <StepItem num={1}>Click the <Lbl>👁</Lbl> eye icon on any request row to open a <strong>Leave Request Details</strong> modal.</StepItem>
            <StepItem num={2}>The modal shows employee name, leave type, dates, duration, reason, and — if rejected — the rejection reason. Pending requests also show <Lbl>Approve</Lbl> and <Lbl>Reject</Lbl> buttons directly in the modal.</StepItem>
            <StepItem num={3}>Click <Lbl>Close</Lbl> to dismiss.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 13. REPORTS ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Reports</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View all reports generated in the system and those assigned to you.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">📁 All Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> → <Lbl>All Reports</Lbl> in the sidebar.</StepItem>
            <img src={allReportsImg} alt="All Reports page" style={imgStyle} />
            <StepItem num={2}>A table lists every report in the system — who generated it, the type, date, and status. Use the search bar and filters to narrow results.</StepItem>
            <StepItem num={3}>Click on a report row to view or download it.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📨 Assigned Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> → <Lbl>Assigned Reports</Lbl> in the sidebar.</StepItem>
            <img src={assignedReportsImg} alt="Assigned Reports page" style={imgStyle} />
            <StepItem num={2}>Reports sent to you by other roles (e.g., Finance, HR, Production Manager) appear here. Open a report, review it, and take any required action.</StepItem>
          </div>

        </div>
      </div>

      {/* ── 14. UI PERMISSIONS ───────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--purple-100, #f3e8ff)' }}>🔐</div>
          <div>
            <div className="pc-title">UI Permissions</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Control what each role can see and do throughout the system.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={permissionsImg} alt="UI Permissions page" style={imgStyle} />

          <ScreenMock>
            A two-panel layout. On the left: a list of all roles (Admin, Receptionist, Sales, DAF, etc.) with their permission count.
            On the right: the permissions panel for the selected role, grouped by resource (Jobs, Users, Customers, Stock, etc.).
            Each resource group shows individual permissions with checkboxes.
            A progress bar at the top of the panel shows what percentage of all permissions are granted.
            Buttons: <strong>Grant all</strong> and <strong>Revoke all</strong> per resource group.
            A <strong>Save Changes</strong> button applies the changes to the backend.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">🔑 How to configure permissions for a role</div>
            <StepItem num={1}>Click <Lbl>UI Permissions</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Select a role from the left panel (e.g., <strong>Receptionist</strong>).</StepItem>
            <StepItem num={3}>
              In the right panel, check or uncheck individual permissions.
              Click <Lbl>Grant all</Lbl> on a resource group to grant all its permissions at once,
              or <Lbl>Revoke all</Lbl> to remove them all.
            </StepItem>
            <StepItem num={4}>
              An orange banner appears when you have unsaved changes.
              Click <Lbl>Save Changes</Lbl> to apply your changes to the backend.
              Click <Lbl>Discard</Lbl> to cancel without saving.
            </StepItem>
          </div>

          <div className="warn-box">
            <span className="box-icon">⚠️</span>
            <div className="box-content">
              <p><strong>Be careful with permissions.</strong> Removing a permission from a role
                immediately prevents all users of that role from accessing that feature.
                Always verify changes before saving.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 15. NOTIFICATIONS ────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🔔</div>
          <div>
            <div className="pc-title">Notifications</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Stay informed about system events, job updates, and alerts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar. A red badge shows the number of unread notifications.</StepItem>
          <img src={notificationsImg} alt="Notifications page" style={imgStyle} />
          <StepItem num={2}>Click any notification to mark it as read and see its full details.</StepItem>
        </div>
      </div>

      {/* ── 16. SETTINGS ─────────────────────────────────────────────────── */}
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
            <img src={systemProfileImg} alt="Admin profile settings" style={imgStyle} />
            <StepItem num={2}>Edit your name, email, or other personal details.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to apply your changes.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔑 How to change your password</div>
            <StepItem num={1}>Click <Lbl>⚙️ Settings</Lbl> in the sidebar → select the <Lbl>Password</Lbl> tab.</StepItem>
            <StepItem num={2}>Enter your current password, then your new password, and confirm it.</StepItem>
            <StepItem num={3}>Click <Lbl>Update Password</Lbl>. You will stay logged in with the new password active immediately.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🚪 How to log out</div>
            <StepItem num={1}>Click your <strong>avatar / name</strong> in the top-right corner of the page header. A dropdown menu opens.</StepItem>
            <img src={logoutImg} alt="Logout dropdown" style={imgStyle} />
            <StepItem num={2}>Click <Lbl>Logout</Lbl> (shown in red at the bottom of the dropdown).</StepItem>
            <StepItem num={3}>You are immediately signed out and redirected to the login page. Your session is cleared.</StepItem>
          </div>

        </div>
      </div>

    </div>
  );
}
