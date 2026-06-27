import receptionalistImg from '../../assets/images/receptionslist/receptionalist.png';
import vistorImg from '../../assets/images/receptionslist/vistor.png';
import addvisitorImg from '../../assets/images/receptionslist/addvisitor.png';
import checkInImg from '../../assets/images/receptionslist/checkIn.png';
import paymentImg from '../../assets/images/receptionslist/payment.png';
import paynowImg from '../../assets/images/receptionslist/paynow.png';
import deliversImg from '../../assets/images/receptionslist/delivers.png';
import recordDeriveredImg from '../../assets/images/receptionslist/recordDerivered.png';
import boutiqueImg from '../../assets/images/receptionslist/boutique.png';
import tradeImg from '../../assets/images/receptionslist/trade.png';
import addQuantityImg from '../../assets/images/receptionslist/addQuantity.png';
import expenseImg from '../../assets/images/receptionslist/expense.png';
import addnewexpenseImg from '../../assets/images/receptionslist/addnewexpense.png';
import yesapproveImg from '../../assets/images/receptionslist/yesapprove.png';
import leaveImg from '../../assets/images/receptionslist/leave.png';
import requestleaveImg from '../../assets/images/receptionslist/requestleave.png';
import shoprreportsImg from '../../assets/images/receptionslist/shoprreports.png';
import visitorImg from '../../assets/images/receptionslist/visitor.png';
import myreportsImg from '../../assets/images/receptionslist/myreports.png';
import checkingnotifyImg from '../../assets/images/receptionslist/checkingnotify.png';
import checkandmodifyprofileImg from '../../assets/images/receptionslist/checkandmodifyprofile.png';
import changepassImg from '../../assets/images/receptionslist/changepass.png';

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

function ScreenMock({ children }: { children: React.ReactNode }) {
  return (
    <div className="screen-mock">
      <div className="screen-mock-title">What you see</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

function PageCard({ iconBg, icon, title, img, imgAlt, children }: {
  iconBg: string; icon: string; title?: string; img: string; imgAlt: string; children?: React.ReactNode;
}) {
  return (
    <div className="page-card">
      <div className="pc-header">
        <div className="pc-icon" style={{ background: iconBg }}>{icon}</div>
        <div>
          {title && <div className="pc-title">{title}</div>}
          <img src={img} alt={imgAlt} style={imgStyle} />
        </div>
      </div>
      {children && <div className="pc-body">{children}</div>}
    </div>
  );
}

export default function ReceptionistUserGuide() {
  return (
    <div>
      {/* Section Title */}
      <div className="sec-title" id="reception">
        <div className="sec-icon sec-icon-blue">🏢</div>
        <div className="sec-text">
          <h2>Receptionist</h2>
          <p>Front desk operations</p>
        </div>
      </div>
      <div className="sec-divider" />

      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>On this page you will:</strong> register and check in visitors/customers, collect job payments, record deliveries, make boutique sales, record petty cash expenses, request leave, and generate reports.</p>
        </div>
      </div>

      <p>Your sidebar: <strong>Dashboard, Visitor, Payments, Deliveries, Boutique, Boutique Stock, Expenses, My Leave, Reports ▾.</strong></p>

      {/* Dashboard */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <img src={receptionalistImg} alt="Reception Dashboard" style={imgStyle} />
        </div>
        <div className="pc-body">
          <ScreenMock>
            Job pipeline strip at the top: Total Jobs · Pending · Ready for Delivery · Completed · Delivered · Customers.
            Below: recent jobs list with Job #, Customer, Status badge, Priority badge, Due date. Pagination buttons.
          </ScreenMock>
        </div>
      </div>

      {/* Visitor */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👤</div>
          <img src={vistorImg} alt="Visitor Registration" style={imgStyle} />
        </div>
        <div className="pc-body">
          <ScreenMock>
            Table of today's visitors: Name, Phone, Visiting, Purpose, Time In, Time Out. <strong>Register Visitor</strong> button.
          </ScreenMock>
          <div className="step-box">
            <div className="step-box-title">📋 Register a visitor / customer</div>
            <StepItem num={1}>
              Click <Lbl>Register Visitor</Lbl>. Fill: Full Name, Phone, Category, Client Type, Address, Notes.
              Click <Lbl>Add Customer</Lbl>.
            </StepItem>
            <img src={addvisitorImg} alt="Visitor Registration Form" style={imgStyle} />
            <StepItem num={2}>
              To record a visit, find the customer row and click the green <Lbl>Check In</Lbl> icon to check in, or the orange <Lbl>Check Out</Lbl> icon to check out.
            </StepItem>
            <img src={checkInImg} alt="Visitor Check In / Check Out" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* Payments */}
      <PageCard iconBg="var(--green-100)" icon="💵" title="Payments" img={paymentImg} imgAlt="Payments">
        <p>When a job is completed, it will need to be paid at the Reception desk.</p>
        <ScreenMock>
          Table of all jobs: Job #, Title, Customer, Amount, Paid, Balance, Status, Payment. Search box.
        </ScreenMock>
        <div className="step-box">
          <div className="step-box-title">💳 Record a payment</div>
          <img src={paynowImg} alt="Add Payment Form" style={imgStyle} />
          <StepItem num={1}>Find the job in the table, then click <Lbl>Collect Payment</Lbl></StepItem>
          <StepItem num={2}>Select the payment type: <Field>Full Payment</Field> or <Field>Partial Payment</Field></StepItem>
          <StepItem num={3}>Select <Field>Payment Method</Field>: Cash, Mobile Money, Bank Transfer, or Card.</StepItem>
          <StepItem num={4}>Click <Lbl>Confirm Payment</Lbl>. A receipt number is generated automatically.</StepItem>
        </div>
      </PageCard>

      {/* Deliveries */}
      <PageCard iconBg="var(--orange-100)" icon="📦" title="Deliveries" img={deliversImg} imgAlt="Deliveries">
        <p>Jobs that are ready for delivery and fully paid appear here for handoff to the client.</p>
        <ScreenMock>
          Two tables: <strong>Ready for Delivery</strong> (paid jobs) and <strong>Already Delivered</strong>. Each row shows Job #, Title, Customer, Amount, Payment, Due Date.
        </ScreenMock>
        <div className="step-box">
          <div className="step-box-title">📋 Record a delivery</div>
          <img src={recordDeriveredImg} alt="Mark Delivered Form" style={imgStyle} />
          <StepItem num={1}>
            Find the job in the <strong>Ready for Delivery</strong> table and click <Lbl>Mark Delivered</Lbl>.
          </StepItem>
          <StepItem num={2}>
            Select who is receiving it: <Field>Owner</Field> (the customer picks it up) or <Field>Shipper</Field> (a third party). If Shipper, fill in their name and phone number.
          </StepItem>
          <StepItem num={3}>
            Click <Lbl>Confirm Delivery</Lbl>. The job moves to the Already Delivered table.
          </StepItem>
        </div>
      </PageCard>

      {/* Boutique Sales */}
      <PageCard iconBg="var(--purple-100)" icon="🛍️" title="Boutique Sales" img={boutiqueImg} imgAlt="Boutique Sales">
        <ScreenMock>
          Product catalog with prices and stock quantities. <strong>Add Product</strong> button.
        <p>That button will be used when there is a need to add new products to the catalog.</p>
        </ScreenMock>
        <div className="step-box">
          <div className="step-box-title">🛒 Make a boutique sale</div>
          <StepItem num={1}>
            Click on any <Lbl>product card</Lbl> to open the sale form.
            <img src={tradeImg} alt="Boutique Sale Form" style={imgStyle} />
            <div className="step-item">
              <span className="step-text">Enter quantity and amount paid, select payment method. Click <Lbl>Confirm Sale</Lbl>. A receipt summary is shown.</span>
            </div>
          </StepItem><br />
          <StepItem num={2}>To restock a product, click <Lbl>Add Qty</Lbl> on its card.</StepItem>
          <img src={addQuantityImg} alt="Add Quantity Form" style={imgStyle} />
        </div>
     
      </PageCard>

      {/* Expenses */}
      <PageCard iconBg="var(--gold-pale)" icon="💸" title="Expenses (Outstands)" img={expenseImg} imgAlt="Expenses">
        <ScreenMock>
          List of petty cash expenses: Date, Description, Amount, Category. <strong>Add Expense</strong> button.
        </ScreenMock>
        <div className="step-box">
          <div className="step-box-title">➕ Record an expense</div>
          <StepItem num={1}>
            Click <Lbl>New Record</Lbl>. Fill: Description, Category, Recipient Name, Phone, Role, Quantity, Unit Cost, Purpose. Click <Lbl>Record Cash Outflow</Lbl>.
          </StepItem>
          <img src={addnewexpenseImg} alt="Add Expense Form" style={imgStyle} />
        </div>
        <div className="step-box">
          <div className="step-box-title"><Lbl>Approve expense</Lbl></div>
          <StepItem num={1}>Click the <Lbl>⋯ dots menu</Lbl> on the record row, then click <Lbl>Approve</Lbl>. Confirm with <Lbl>Yes, Approve</Lbl>.</StepItem>
          <img src={yesapproveImg} alt="Approve Expense" style={imgStyle} />
        </div>
      </PageCard>

      {/* Leave */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🌴</div>
          <div>
            <div className="pc-title">My Leave</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>View your leave history and submit a leave request.</p>
          </div>
        </div>
        <div className="pc-body">
          <div className="step-box">
            <div className="step-box-title"><Lbl>View Leave</Lbl></div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar to see your leave balance and history.</StepItem>
            <img src={leaveImg} alt="Leave" style={imgStyle} />
          </div>
          <div className="step-box">
            <div className="step-box-title"><Lbl>Request Leave</Lbl></div>
            <StepItem num={1}>Click <Lbl>Request Leave</Lbl>, complete the form (leave type, dates, reason), and submit.</StepItem>
            <img src={requestleaveImg} alt="Request Leave" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Shop Sales Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>Reports</Lbl> in the sidebar, then click the <Lbl>Shop Sales</Lbl> tab to see all boutique transactions.</StepItem>
        <img src={shoprreportsImg} alt="Shop Reports" style={imgStyle} />
      </div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Visitor Reports</Lbl></div>
        <StepItem num={1}>Click the <Lbl>Visitors</Lbl> tab to see a report of all visitors that came in.</StepItem>
        <img src={visitorImg} alt="Visitor Reports" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>my reports</Lbl> on sidebar</StepItem>
        <img src={myreportsImg} alt="My Reports" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Notifications</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Notifications</Lbl></div>
        <StepItem num={1}>Click <Lbl>notifications</Lbl> on sidebar</StepItem>
        <img src={checkingnotifyImg} alt="Notifications" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Settings</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Settings</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then Click <Lbl>profile</Lbl></StepItem>
        <img src={checkandmodifyprofileImg} alt="Settings Profile" style={imgStyle} />
      </div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Change credentials (email and password)</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then Click <Lbl>password</Lbl></StepItem>
        <img src={changepassImg} alt="Change Password" style={imgStyle} />
      </div>
    </div>
  );
}
