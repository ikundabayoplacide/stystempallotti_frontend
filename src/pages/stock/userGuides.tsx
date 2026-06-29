import dashboardImg        from '../../assets/images/stock/dashboard.png';
import boutiqueItemsImg    from '../../assets/images/stock/boutiqueItems.png';
import boutiqueRequestImg  from '../../assets/images/stock/boutiqueRequest.png';
import boutiqueReportImg   from '../../assets/images/stock/boutiqueReport.png';
import generalStockImg     from '../../assets/images/stock/generalStock.png';
import generalStockReqImg  from '../../assets/images/stock/generalStockRequest.png';
import generalStockRptImg  from '../../assets/images/stock/generalstockReport.png';
import myReportImg         from '../../assets/images/stock/myReport.png';
import receivedReportImg   from '../../assets/images/stock/receivedReport.png';
import myLeaveImg          from '../../assets/images/stock/myleavepage.png';
import completeLeaveImg    from '../../assets/images/stock/completetorequestLeave.png';
import notificationImg     from '../../assets/images/stock/notification.png';
import passImg             from '../../assets/images/stock/pass.png';
import profileImg          from '../../assets/images/stock/profile.png';

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

function Field({ children }: { children: React.ReactNode }) {
  return <span className="lbl-field">{children}</span>;
}

export default function StockUserGuide() {
  return (
    <div>
      {/* ── Section title ─────────────────────────────────────────── */}
      <div className="sec-title" id="stock">
        <div className="sec-icon sec-icon-blue">📦</div>
        <div className="sec-text">
          <h2>Stock Manager</h2>
          <p>Manage stock items, process requests, and generate reports</p>
        </div>
      </div>
      <div className="sec-divider" />

      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p>
            <strong>On this page you will:</strong> monitor stock levels on the dashboard,
            manage boutique and general stock items (add, edit, restock, delete),
            approve or reject stock-out requests from other departments,
            and generate PDF reports.
          </p>
        </div>
      </div>

      <p>
        Your sidebar:{' '}
        <strong>
          Dashboard · Boutique Stock · General Stock · My Leave · Reports ▾ · Notifications · User Guide · Settings
        </strong>
      </p>

      {/* ═══════════════════════════════════════════════════════════
          1. DASHBOARD
          ═══════════════════════════════════════════════════════════ */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#e0eaff' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <img src={dashboardImg} alt="Stock Dashboard" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <div className="screen-mock">
            <div className="screen-mock-title">What you see</div>
            <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>
              Three KPI cards at the top: <strong>General Stock</strong> (total items),{' '}
              <strong>Boutique Stock</strong> (total items), and{' '}
              <strong>Low / Out of Stock</strong> (items needing reorder).
              Below: two summary panels — General Stock and Boutique Stock — each showing
              Available, Low Stock, Out of Stock, and Pending Sorties counts.
              At the bottom: a red <strong>Needs Restocking</strong> card listing items that are
              low or out of stock.
            </p>
          </div>
          <div className="info-box">
            <span className="box-icon">💡</span>
            <div className="box-content">
              <p>
                Clicking any KPI card or summary panel navigates directly to that stock section
                so you can act on it immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. BOUTIQUE STOCK
          ═══════════════════════════════════════════════════════════ */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#fce7f3' }}>🛍️</div>
          <div>
            <div className="pc-title">Boutique Stock</div>
            <img src={boutiqueItemsImg} alt="Boutique Items" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <div className="screen-mock">
            <div className="screen-mock-title">What you see</div>
            <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>
              Two tabs: <strong>Items</strong> and <strong>Requests</strong> (with a yellow badge
              when requests are pending). The Items tab shows a table with Item Name, Category,
              Unit, Stock, Unit Cost, Total Value, Alarm level, Status badge, and action buttons.
            </p>
          </div>

          {/* Add item */}
          <div className="step-box">
            <div className="step-box-title">➕ Add a new boutique item</div>
            <StepItem num={1}>Click <Lbl>Add Item</Lbl> (top-right of the items list).</StepItem>
            <StepItem num={2}>
              Fill in: <Field>Item Name</Field>, <Field>Category</Field>, <Field>Unit</Field>,{' '}
              <Field>Unit Cost (RWF)</Field>, <Field>Alarm Stock Level</Field>, <Field>Initial Stock</Field>.
              Optionally add a description.
            </StepItem>
            <StepItem num={3}>Click <Lbl>Create Item</Lbl> to save.</StepItem>
          </div>

          {/* Edit item */}
          <div className="step-box">
            <div className="step-box-title">✏️ Edit an existing item</div>
            <StepItem num={1}>
              Find the item in the table and click the blue <Lbl>pencil icon</Lbl> in the Actions column.
            </StepItem>
            <StepItem num={2}>Update the fields you need to change, then click <Lbl>Save Changes</Lbl>.</StepItem>
          </div>

          {/* Restock */}
          <div className="step-box">
            <div className="step-box-title">📦 Restock an item (add quantity)</div>
            <StepItem num={1}>
              Click the green <Lbl>+ icon</Lbl> (Restock) on the item row.
            </StepItem>
            <StepItem num={2}>Enter the <Field>Quantity to Add</Field> and an optional note.</StepItem>
            <StepItem num={3}>Click <Lbl>Add Stock</Lbl> to confirm.</StepItem>
          </div>

          {/* Delete item */}
          <div className="step-box">
            <div className="step-box-title">🗑️ Delete an item</div>
            <StepItem num={1}>
              Click the red <Lbl>trash icon</Lbl> on the item row. Confirm the deletion in the dialog
              that appears by clicking <Lbl>Delete</Lbl>.
            </StepItem>
            <div className="warn-box" style={{ marginTop: '.5rem' }}>
              <span className="box-icon">⚠️</span>
              <div className="box-content"><p>Deletion cannot be undone. Make sure the item is no longer needed before deleting.</p></div>
            </div>
          </div>

          {/* Requests tab */}
          <div className="step-box">
            <div className="step-box-title">📋 Process stock-out requests (Requests tab)</div>
            <img src={boutiqueRequestImg} alt="Boutique Requests" style={imgStyle} />
            <StepItem num={1}>Click the <Lbl>Requests</Lbl> tab. Pending requests have a yellow badge count.</StepItem>
            <StepItem num={2}>
              Review each request: it shows the item name, requested quantity, reason, and who requested it.
            </StepItem>
            <StepItem num={3}>
              Click <Lbl>Approve</Lbl> (green) to approve — stock is deducted automatically.{' '}
              Click <Lbl>Reject</Lbl> (red) to decline — you must enter a reason before confirming.
            </StepItem>
            <div className="info-box" style={{ marginTop: '.5rem' }}>
              <span className="box-icon">��</span>
              <div className="box-content">
                <p>
                  Use the <Field>status filter</Field> dropdown to view only Pending, Approved, or
                  Rejected requests. Click the <Lbl>refresh icon</Lbl> to reload the latest requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. GENERAL STOCK
          ═══════════════════════════════════════════════════════════ */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#ffedd5' }}>📦</div>
          <div>
            <div className="pc-title">General Stock</div>
            <img src={generalStockImg} alt="General Stock" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <div className="screen-mock">
            <div className="screen-mock-title">What you see</div>
            <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>
              Same two-tab layout as Boutique Stock: <strong>Items</strong> and{' '}
              <strong>Requests</strong>. General stock covers office and production supplies
              used internally (paper, binding materials, etc.).
            </p>
          </div>

          <div className="step-box">
            <div className="step-box-title">➕ Add a new general item</div>
            <StepItem num={1}>Click <Lbl>Add Item</Lbl>.</StepItem>
            <StepItem num={2}>
              Fill in: <Field>Item Name</Field>, <Field>Category</Field>, <Field>Unit</Field>,{' '}
              <Field>Alarm Stock Level</Field>, <Field>Initial Stock</Field>, and optional Description.
            </StepItem>
            <StepItem num={3}>Click <Lbl>Create Item</Lbl>.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📦 Restock / Edit / Delete</div>
            <StepItem>
              Same as Boutique Stock — use the <Lbl>+ icon</Lbl> to restock, the{' '}
              <Lbl>pencil icon</Lbl> to edit, and the <Lbl>trash icon</Lbl> to delete an item.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📋 Process general stock requests (Requests tab)</div>
            <img src={generalStockReqImg} alt="General Stock Requests" style={imgStyle} />
            <StepItem num={1}>Click the <Lbl>Requests</Lbl> tab to see incoming sortie requests.</StepItem>
            <StepItem num={2}>
              Click <Lbl>Approve</Lbl> to grant the request (stock quantity is deducted automatically),
              or click <Lbl>Reject</Lbl> to decline.
            </StepItem>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. REPORTS
          ═══════════════════════════════════════════════════════════ */}
      <div className="step-box-title">📊 REPORTS</div>

      <div className="step-box">
        <div className="step-box-title">📋 Boutique Stock Report</div>
        <img src={boutiqueReportImg} alt="Boutique Report" style={imgStyle} />
        <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar, then click <Lbl>Generate Reports</Lbl>.</StepItem>
        <StepItem num={2}>The page opens on the <Lbl>Boutique Stock</Lbl> tab by default.</StepItem>
        <StepItem num={3}>
          Use the <strong>Items</strong> sub-tab to see all boutique items with stock levels and values.
          Use the <strong>Stock Requests</strong> sub-tab to see all sorties (filter by status).
        </StepItem>
        <StepItem num={4}>
          Click <Lbl>PDF</Lbl> to download the report as a PDF, or click <Lbl>Generate Report</Lbl> to
          send the report through the reporting system.
        </StepItem>
      </div>

      <div className="step-box">
        <div className="step-box-title">📋 General Stock Report</div>
        <img src={generalStockRptImg} alt="General Stock Report" style={imgStyle} />
        <StepItem num={1}>On the Reports page, click the <Lbl>General Stock</Lbl> tab.</StepItem>
        <StepItem num={2}>
          Use the <strong>Items</strong> sub-tab for stock levels, or the <strong>Stock Requests</strong>
          sub-tab for sortie history.
        </StepItem>
        <StepItem num={3}>
          Filter by status using the dropdown, then click <Lbl>PDF</Lbl> or <Lbl>Generate Report</Lbl>.
        </StepItem>
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title">View reports sent to you</div>
        <img src={receivedReportImg} alt="Received Reports" style={imgStyle} />
        <StepItem num={1}>
          Click <Lbl>Reports</Lbl> in the sidebar, then click <Lbl>My Reports</Lbl>.
        </StepItem>
        <img src={myReportImg} alt="My Reports" style={imgStyle} />
        <StepItem num={2}>Here you can view all reports that have been submitted or received.</StepItem>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          5. MY LEAVE
          ═══════════════════════════════════════════════════════════ */}
      <div className="step-box-title">🌴 MY LEAVE</div>

      <div className="step-box">
        <div className="step-box-title">View your leave balance and history</div>
        <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar.</StepItem>
        <img src={myLeaveImg} alt="My Leave Page" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title">Submit a leave request</div>
        <StepItem num={1}>
          On the My Leave page, click <Lbl>Request Leave</Lbl>.
        </StepItem>
        <StepItem num={2}>
          Fill in: <Field>Leave Type</Field>, <Field>Start Date</Field>, <Field>End Date</Field>, and{' '}
          <Field>Reason</Field>.
        </StepItem>
        <StepItem num={3}>Click <Lbl>Submit Request</Lbl> to send it for approval.</StepItem>
        <img src={completeLeaveImg} alt="Request Leave Form" style={imgStyle} />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          6. NOTIFICATIONS & SETTINGS
          ═══════════════════════════════════════════════════════════ */}
      <div className="step-box-title">🔔 NOTIFICATIONS</div>
      <div className="step-box">
        <StepItem num={1}>
          Click <Lbl>Notifications</Lbl> in the sidebar footer. A red badge shows unread count.
          Here you can see alerts for low-stock items, approved/rejected requests, and system messages.
        </StepItem>
        <img src={notificationImg} alt="Notifications" style={imgStyle} />
      </div>

      <div className="step-box-title">⚙️ SETTINGS</div>
      <div className="step-box">
        <div className="step-box-title">Update your profile</div>
        <StepItem num={1}>Click <Lbl>Settings</Lbl> in the sidebar footer, then click <Lbl>Profile</Lbl>.</StepItem>
        <StepItem num={2}>Update your name, email, or phone number, then click <Lbl>Save Changes</Lbl>.</StepItem>
        <img src={profileImg} alt="Profile Settings" style={imgStyle} />
      </div>
      <div className="step-box">
        <div className="step-box-title">Change your password</div>
        <StepItem num={1}>Click <Lbl>Settings</Lbl>, then click <Lbl>Password</Lbl>.</StepItem>
        <StepItem num={2}>Enter your current password, then your new password, and click <Lbl>Update Password</Lbl>.</StepItem>
        <img src={passImg} alt="Change Password" style={imgStyle} />
      </div>
    </div>
  );
}
