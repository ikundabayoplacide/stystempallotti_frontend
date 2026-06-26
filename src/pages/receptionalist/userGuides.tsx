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
          <h2>7. Receptionist</h2>
          <p>Front desk operations</p>
        </div>
      </div>
      <div className="sec-divider" />
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
            <div className="step-box-title">📋 Add new customer</div>
            <StepItem num={1}>
              Click <Lbl>Add new customer</Lbl>. Fill: Visitor Name, Phone, Person/Department Visiting, Purpose.
              Time In sets automatically. Click <Lbl>Add customer</Lbl>.
            </StepItem>
            <img src={addvisitorImg} alt="Visitor Registration Form" style={imgStyle} />
            <StepItem num={2}>
              When the visitor comes, find their row and click <Lbl>Check in</Lbl> to record the Time .
            </StepItem>
            <img src={checkInImg} alt="Visitor Check Out" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* Payments */}
      <PageCard iconBg="var(--green-100)" icon="💵" title="Payments" img={paymentImg} imgAlt="Payments">
        <p>When job completed, it will need to be paid at Recepitionlist and account</p>
        <ScreenMock>
          List of payments: Date, Customer, Job, Amount, Payment Method, Receipt #. Search box. <strong>Add Payment</strong> button.
        </ScreenMock>
        <div className="step-box">
          <div className="step-box-title">💳 Record a payment</div>
          <img src={paynowImg} alt="Add Payment Form" style={imgStyle} />
          <StepItem num={1}>Click <Lbl>collect payment </Lbl></StepItem>
          <StepItem num={2}>Select the <Field>payment full</Field> Or Partial</StepItem>
          <StepItem num={3}> Select <Field>Payment Method</Field>: Cash, Mobile Money, Bank Transfer, or Cheque.
          </StepItem>
          <StepItem num={4}> Click <Lbl>confrim payment</Lbl>. A receipt number is generated automatically.</StepItem>
        </div>
      </PageCard>

      {/* Deliveries */}
      <PageCard iconBg="var(--orange-100)" icon="📦" title="Deliveries" img={deliversImg} imgAlt="Deliveries">
        <p>Here after job completed and paid, they will need to be delivered.</p>
        <ScreenMock>
          List of deliveries: Item, Supplier/Customer, Date, Status (Pending / Received / Delivered). <strong>New Delivery</strong> button.
        </ScreenMock>
        <div className="step-box">
          <div className="step-box-title">📋 Record a delivery</div>
          <img src={recordDeriveredImg} alt="Add Delivery Form" style={imgStyle} />
          <StepItem num={1}>
            Click <Lbl>mark delivered</Lbl>. Select type: <strong>Incoming</strong> (supplies arriving) or <strong>Outgoing</strong> (finished jobs leaving).
          </StepItem>
          <StepItem num={2}>Fill Shipper name, phone number.</StepItem>
          <StepItem num={3}>
            When the physical delivery happens, find the record and click <Lbl>Mark as Received</Lbl> or <Lbl>Mark as Delivered</Lbl>.
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
            Click <Lbl>on card of product</Lbl>
            <img src={tradeImg} alt="Boutique Sale Form" style={imgStyle} />
            <div className="step-item">
              <span className="step-text">Select payment method, record payment amount. Click <Lbl>Confirm Sale</Lbl>. A receipt can be printed.</span>
            </div>
          </StepItem><br />
          <StepItem num={2}>Click <Lbl>add quantity</Lbl></StepItem>
          <p>When the product is in stock, you can add more quantity to the sale.</p>
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
            Click <Lbl>Add record</Lbl>. Fill: Description, Amount (RWF), Category (e.g., Office Supplies, Transport, Cleaning). Click <Lbl>Record cash Outflow</Lbl>.
          </StepItem>
          <img src={addnewexpenseImg} alt="Add Expense Form" style={imgStyle} />
        </div>
        <div className="step-box">
          <div className="step-box-title"><Lbl>Approve expense</Lbl></div>
          <StepItem num={1}>Click <Lbl>(...) under section</Lbl> then you get modal <Lbl>yes, approve</Lbl>.</StepItem>
          <img src={yesapproveImg} alt="Approve Expense" style={imgStyle} />
        </div>
      </PageCard>

      {/* Leave */}
      <div className="step-box">
        <div className="step-box-title">My Leave</div>
        <StepItem num={1}>Click <Lbl>Leave</Lbl></StepItem>
        <img src={leaveImg} alt="Leave" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Request for Leave</Lbl></div>
        <StepItem num={1}>Click <Lbl>Request Leave</Lbl> complete the form and submit.</StepItem>
        <img src={requestleaveImg} alt="Request Leave" style={imgStyle} />
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Shop reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>shop sales</Lbl> tab to get the report about all boutique transactions.</StepItem>
        <img src={shoprreportsImg} alt="Shop Reports" style={imgStyle} />
      </div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Visitor reports</Lbl></div>
        <StepItem num={2}>Click <Lbl>visitors</Lbl> tab to get the report about all visitors that came in.</StepItem>
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
