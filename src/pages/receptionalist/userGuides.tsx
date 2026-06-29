import receptionalistImg        from '../../assets/images/receptionslist/receptionalist.png';
import vistorImg                from '../../assets/images/receptionslist/vistor.png';
import addvisitorImg            from '../../assets/images/receptionslist/addvisitor.png';
import checkInImg               from '../../assets/images/receptionslist/checkIn.png';
import paymentImg               from '../../assets/images/receptionslist/payment.png';
import paynowImg                from '../../assets/images/receptionslist/paynow.png';
import deliversImg              from '../../assets/images/receptionslist/delivers.png';
import recordDeriveredImg       from '../../assets/images/receptionslist/recordDerivered.png';
import boutiqueImg              from '../../assets/images/receptionslist/boutique.png';
import tradeImg                 from '../../assets/images/receptionslist/trade.png';
import addQuantityImg           from '../../assets/images/receptionslist/addQuantity.png';
import checkstockImg            from '../../assets/images/receptionslist/checkstock.png';
import addrequestImg            from '../../assets/images/receptionslist/addrequest.png';
import expenseImg               from '../../assets/images/receptionslist/expense.png';
import addnewexpenseImg         from '../../assets/images/receptionslist/addnewexpense.png';
import yesapproveImg            from '../../assets/images/receptionslist/yesapprove.png';
import leaveImg                 from '../../assets/images/receptionslist/leave.png';
import requestleaveImg          from '../../assets/images/receptionslist/requestleave.png';
import shoprreportsImg          from '../../assets/images/receptionslist/shoprreports.png';
import visitorImg               from '../../assets/images/receptionslist/visitor.png';
import myreportsImg             from '../../assets/images/receptionslist/myreports.png';
import checkingnotifyImg        from '../../assets/images/receptionslist/checkingnotify.png';
import checkandmodifyprofileImg from '../../assets/images/receptionslist/checkandmodifyprofile.png';
import changepassImg            from '../../assets/images/receptionslist/changepass.png';
import logoutImg                from '../../assets/images/receptionslist/logout.png';

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

export default function ReceptionistUserGuide() {
  return (
    <div>

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <div className="sec-title" id="reception">
        <div className="sec-icon sec-icon-blue">🏢</div>
        <div className="sec-text">
          <h2>Receptionist (PR)</h2>
          <p>Front desk operations</p>
        </div>
      </div>
      <div className="sec-divider" />

      {/* Overview */}
      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>As a Receptionist you can:</strong></p>
          <ul style={{ margin: '.4rem 0 0 1rem', fontSize: '.85rem', lineHeight: 1.8 }}>
            <li>Register and check in / check out visitors and customers.</li>
            <li>Collect job payments and record partial or full payments.</li>
            <li>Record job deliveries to customers or shippers.</li>
            <li>Make boutique sales and restock boutique products.</li>
            <li>Manage boutique stock — check levels and submit restock requests.</li>
            <li>Record petty cash expenses (outstands) and approve them.</li>
            <li>Request leave and check your leave history.</li>
            <li>Generate shop and visitor reports, and view your own reports.</li>
            <li>Check notifications, update your profile, and change your password.</li>
          </ul>
        </div>
      </div>

      <p style={{ fontSize: '.85rem', color: 'var(--color-custom-700)', marginBottom: '1rem' }}>
        Your sidebar: <strong>Dashboard, Visitor, Payments, Deliveries, Boutique, Boutique Stock, Expenses, My Leave, Reports ▾, Notifications, Settings.</strong>
      </p>

      {/* ── 1. DASHBOARD ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🏠</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Your home page — a live snapshot of all jobs and their current status.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={receptionalistImg} alt="Reception Dashboard" style={imgStyle} />
          <ScreenMock>
            Job pipeline strip at the top: <strong>Total Jobs · Pending · Ready for Delivery · Completed ·
            Delivered · Customers</strong>. Below: a recent jobs table with Job #, Customer, Status badge,
            Priority badge, and Due Date. Pagination buttons at the bottom.
          </ScreenMock>
        </div>
      </div>

      {/* ── 2. VISITOR ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👤</div>
          <div>
            <div className="pc-title">Visitor</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Register new visitors or customers, and record when they arrive and leave.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={vistorImg} alt="Visitor list" style={imgStyle} />
          <ScreenMock>
            A table of today's visitors with columns: Name, Phone, Visiting, Purpose, Time In, Time Out.
            A <strong>Register Visitor</strong> button is in the top-right corner.
            Each row has a green <strong>Check In</strong> icon and an orange <strong>Check Out</strong> icon.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to register a new visitor or customer</div>
            <StepItem num={1}>Click <Lbl>Register Visitor</Lbl> in the top-right corner.</StepItem>
            <img src={addvisitorImg} alt="Register visitor form" style={imgStyle} />
            <StepItem num={2}>Fill in: Full Name, Phone, Category, Client Type, Address, and Notes (optional).</StepItem>
            <StepItem num={3}>Click <Lbl>Add Customer</Lbl>. The visitor is added to the list.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ How to check in / check out a visitor</div>
            <img src={checkInImg} alt="Check in / Check out icons" style={imgStyle} />
            <StepItem num={1}>Find the visitor's row in the table.</StepItem>
            <StepItem num={2}>Click the green <Lbl>Check In</Lbl> icon when they arrive — this records their Time In.</StepItem>
            <StepItem num={3}>Click the orange <Lbl>Check Out</Lbl> icon when they leave — this records their Time Out.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 3. PAYMENTS ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--green-100)' }}>💵</div>
          <div>
            <div className="pc-title">Payments</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Collect payments for completed jobs. A job must be paid before it can be delivered.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={paymentImg} alt="Payments page" style={imgStyle} />
          <ScreenMock>
            A table of all jobs with columns: Job #, Title, Customer, Amount, Paid, Balance, Status, and a
            <strong> Collect Payment</strong> button. Use the search box to find a specific job quickly.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">💳 How to collect a payment</div>
            <StepItem num={1}>Find the job in the table. Click <Lbl>Collect Payment</Lbl> on that row.</StepItem>
            <img src={paynowImg} alt="Collect payment modal" style={imgStyle} />
            <StepItem num={2}>Select the payment type: <Field>Full Payment</Field> or <Field>Partial Payment</Field>.</StepItem>
            <StepItem num={3}>Select the <Field>Payment Method</Field>: Cash, Mobile Money, Bank Transfer, or Card.</StepItem>
            <StepItem num={4}>Enter the amount received, then click <Lbl>Confirm Payment</Lbl>. A receipt number is generated automatically.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 4. DELIVERIES ────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--orange-100)' }}>📦</div>
          <div>
            <div className="pc-title">Deliveries</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Hand over completed and fully paid jobs to the client or a shipper.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={deliversImg} alt="Deliveries page" style={imgStyle} />
          <ScreenMock>
            Two tables: <strong>Ready for Delivery</strong> (jobs that are paid and ready to go out) and
            <strong> Already Delivered</strong> (historical records). Each row shows Job #, Title, Customer,
            Amount, Payment status, Due Date, and a <strong>Mark Delivered</strong> button.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">📬 How to record a delivery</div>
            <StepItem num={1}>Find the job in the <strong>Ready for Delivery</strong> table.</StepItem>
            <StepItem num={2}>Click <Lbl>Mark Delivered</Lbl> on that row.</StepItem>
            <img src={recordDeriveredImg} alt="Mark delivered modal" style={imgStyle} />
            <StepItem num={3}>
              Choose who is collecting the job:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><Field>Owner</Field> — the customer is picking it up themselves.</li>
                <li><Field>Shipper</Field> — a third party is collecting it. Fill in their name and phone number.</li>
              </ul>
            </StepItem>
            <StepItem num={4}>Click <Lbl>Confirm Delivery</Lbl>. The job moves to the Already Delivered table.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 5. BOUTIQUE ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--purple-100)' }}>🛍️</div>
          <div>
            <div className="pc-title">Boutique Sales</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Sell boutique products to walk-in customers and restock product quantities.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={boutiqueImg} alt="Boutique product catalog" style={imgStyle} />
          <ScreenMock>
            A product catalog showing all boutique items with their price and current stock quantity.
            Each product is displayed as a card. An <strong>Add Product</strong> button appears in the top-right corner
            (used to add new products to the catalog).
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">🛒 How to make a boutique sale</div>
            <StepItem num={1}>Click on any <Lbl>product card</Lbl> in the catalog to open the sale form.</StepItem>
            <img src={tradeImg} alt="Boutique sale form" style={imgStyle} />
            <StepItem num={2}>Enter the <Field>Quantity</Field> sold and the <Field>Amount Paid</Field>.</StepItem>
            <StepItem num={3}>Select the <Field>Payment Method</Field>: Cash, Mobile Money, or Card.</StepItem>
            <StepItem num={4}>Click <Lbl>Confirm Sale</Lbl>. A receipt summary is shown and the stock is reduced automatically.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📥 How to restock a boutique product</div>
            <StepItem num={1}>Find the product card in the catalog. Click <Lbl>Add Qty</Lbl> on that card.</StepItem>
            <img src={addQuantityImg} alt="Add quantity form" style={imgStyle} />
            <StepItem num={2}>Enter the quantity to add, then click <Lbl>Add Stock</Lbl>. The product's quantity updates immediately.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 6. BOUTIQUE STOCK ────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>📦</div>
          <div>
            <div className="pc-title">Boutique Stock</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Monitor boutique stock levels and submit restock requests to the stock manager.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={checkstockImg} alt="Boutique stock page" style={imgStyle} />
          <ScreenMock>
            A list of all boutique stock items showing item name, category, current quantity, and a
            status badge (Available / Low / Out of Stock). A <strong>Request Stock</strong> button is available
            to submit a restock request to the stock department.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">📋 How to request a stock replenishment</div>
            <StepItem num={1}>Click <Lbl>Request Stock</Lbl> in the top-right corner.</StepItem>
            <img src={addrequestImg} alt="Stock request form" style={imgStyle} />
            <StepItem num={2}>Select the item you need from the dropdown and enter the quantity requested.</StepItem>
            <StepItem num={3}>Add a reason or note if needed, then click <Lbl>Submit Request</Lbl>. The stock manager will review and approve it.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 7. EXPENSES ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>💸</div>
          <div>
            <div className="pc-title">Expenses (Outstands)</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Record petty cash outflows and approve expense records.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <img src={expenseImg} alt="Expenses list" style={imgStyle} />
          <ScreenMock>
            A list of all recorded expenses with columns: Date, Description, Recipient, Amount, Category, and Status.
            A <strong>New Record</strong> button is in the top-right corner. Each row has a <strong>⋯ Actions</strong> menu.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to record a new expense</div>
            <StepItem num={1}>Click <Lbl>New Record</Lbl> in the top-right corner.</StepItem>
            <img src={addnewexpenseImg} alt="Add expense form" style={imgStyle} />
            <StepItem num={2}>
              Fill in the form:
              <ul style={{ margin: '.3rem 0 0 1rem', fontSize: '.83rem', lineHeight: 1.8 }}>
                <li><Field>Description</Field> — what the expense is for.</li>
                <li><Field>Category</Field> — type of expense.</li>
                <li><Field>Recipient Name &amp; Phone</Field> — who received the cash.</li>
                <li><Field>Role</Field> — recipient's role.</li>
                <li><Field>Quantity</Field> and <Field>Unit Cost</Field> — to calculate the total.</li>
                <li><Field>Purpose</Field> — brief explanation.</li>
              </ul>
            </StepItem>
            <StepItem num={3}>Click <Lbl>Record Cash Outflow</Lbl>. The expense is saved with a Pending status.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ How to approve an expense</div>
            <StepItem num={1}>Find the expense row in the list. Click <Lbl>⋯</Lbl> (the dots menu) on that row.</StepItem>
            <StepItem num={2}>Select <Lbl>Approve</Lbl> from the menu.</StepItem>
            <img src={yesapproveImg} alt="Approve expense confirmation" style={imgStyle} />
            <StepItem num={3}>A confirmation modal appears. Click <Lbl>Yes, Approve</Lbl> to confirm. The expense status changes to Approved.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 8. MY LEAVE ──────────────────────────────────────────────────── */}
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
          <img src={leaveImg} alt="Leave history" style={imgStyle} />
          <ScreenMock>
            A list of all your leave requests with leave type, start and end dates, reason, and status
            (Pending / Approved / Rejected). A <strong>Request Leave</strong> button is in the top-right corner.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ How to request leave</div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar.</StepItem>
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl> in the top-right corner.</StepItem>
            <img src={requestleaveImg} alt="Request leave form" style={imgStyle} />
            <StepItem num={3}>Fill in leave type, start date, end date, and reason.</StepItem>
            <StepItem num={4}>Click <Lbl>Submit</Lbl>. Your request appears in the list as Pending until approved.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 9. REPORTS ───────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Reports</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              View boutique sales and visitor reports, and access your generated reports.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">🛍️ Shop Sales Report</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar.</StepItem>
            <img src={shoprreportsImg} alt="Shop sales report" style={imgStyle} />
            <StepItem num={2}>Click the <Lbl>Shop Sales</Lbl> tab to see all boutique transactions — product sold, quantity, amount, date, and payment method.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">👤 Visitor Report</div>
            <StepItem num={1}>Click the <Lbl>Visitors</Lbl> tab in the Reports page.</StepItem>
            <img src={visitorImg} alt="Visitor report" style={imgStyle} />
            <StepItem num={2}>A full list of all registered visitors with their check-in and check-out times.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📁 My Reports</div>
            <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar → click <Lbl>My Reports</Lbl> in the submenu.</StepItem>
            <img src={myreportsImg} alt="My reports list" style={imgStyle} />
            <StepItem num={2}>All reports you have generated are listed here. Click one to view or download it.</StepItem>
          </div>

        </div>
      </div>

      {/* ── 10. NOTIFICATIONS ────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🔔</div>
          <div>
            <div className="pc-title">Notifications</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Stay informed about payments, deliveries, stock updates, and system alerts.
            </p>
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            A list of all notifications. Unread notifications are highlighted. The red badge on the sidebar
            Notifications icon shows the number of unread items.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">🔔 How to check notifications</div>
            <StepItem num={1}>Click <Lbl>Notifications</Lbl> at the bottom of the sidebar.</StepItem>
            <img src={checkingnotifyImg} alt="Notifications page" style={imgStyle} />
            <StepItem num={2}>Click any notification to mark it as read and see its full details.</StepItem>
          </div>
        </div>
      </div>

      {/* ── 11. SETTINGS ─────────────────────────────────────────────────── */}
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
            <img src={checkandmodifyprofileImg} alt="Profile settings page" style={imgStyle} />
            <StepItem num={2}>Edit your name, email, or other personal details.</StepItem>
            <StepItem num={3}>Click <Lbl>Save</Lbl> to apply your changes.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">🔑 How to change your password</div>
            <StepItem num={1}>Click <Lbl>⚙️ Settings</Lbl> in the sidebar → select the <Lbl>Password</Lbl> tab.</StepItem>
            <img src={changepassImg} alt="Change password page" style={imgStyle} />
            <StepItem num={2}>Enter your <Field>Current Password</Field>, then your <Field>New Password</Field>, and confirm it.</StepItem>
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
