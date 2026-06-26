import dashboardImg from '../../assets/images/hobe/dashboard.png';
import tradeImg from '../../assets/images/hobe/trade.png';
import newBatchImg from '../../assets/images/hobe/newBatch.png';
import collectayasigayeImg from '../../assets/images/hobe/collectayasigaye.png';
import returnsImg from '../../assets/images/hobe/returns.png';
import requestsImg from '../../assets/images/hobe/requests.png';
import requestImg from '../../assets/images/hobe/request.png';
import allleaveImg from '../../assets/images/hobe/allleave.png';
import hobeLeaveImg from '../../assets/images/hobe/hobeLeave.png';
import hobereportImg from '../../assets/images/hobe/hobereport.png';
import generatehobereportImg from '../../assets/images/hobe/generatehobereport.png';
import myhobereportsImg from '../../assets/images/hobe/myhobereports.png';
import hobenotifyImg from '../../assets/images/hobe/hobenotify.png';
import profileImg from '../../assets/images/hobe/profile.png';
import passImg from '../../assets/images/hobe/pass.png';

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

export default function HobeUserGuide() {
  return (
    <div>
      {/* Section Title */}
      <div className="sec-title" id="hobe">
        <div className="sec-icon sec-icon-blue">🛒</div>
        <div className="sec-text">
          <h2>16. Hobe (Trade)</h2>
          <p>Batch trading and stock requests</p>
        </div>
      </div>
      <div className="sec-divider" />
      <p>
        Your sidebar: <strong>Dashboard, Trade, Requests, My Leave, Reports ▾.</strong> The Hobe module handles trading
        goods in batches, recording sales, and managing outstanding payments (underpaid and overpaid).
      </p>
      <img src={dashboardImg} alt="Hobe Dashboard" style={imgStyle} />

      {/* Trade */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🏷️</div>
          <div>
            <div className="pc-title">Trade (Batch Management)</div>
            <img src={tradeImg} alt="Batch Management" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            Grid of batch cards. Each card: Batch # (e.g., HOB-001), Status badge (Active/Expired/Sold Out), item name,
            price per item, available/total units, sold % progress bar. Active batches have <strong>Sell</strong> and{' '}
            <strong>Add Qty</strong> buttons. Top: <strong>Add Batch</strong> (blue) · <strong>Pending</strong> button
            (orange with count). Filters: All / Active / Expired / Sold Out. Search box.
          </ScreenMock>

          {/* Add batch */}
          <div className="step-box">
            <div className="step-box-title">➕ Add a new batch</div>
            <StepItem num={1}>
              Click <Lbl>Add Batch</Lbl>. Fill: Name*, Done At* (receipt date), Expires At*, Quantity*, Price per Item
              (RWF)*, OB (optional opening balance), Note (optional). Click <Lbl>Add Batch</Lbl>.
            </StepItem>
            <img src={newBatchImg} alt="Add Batch Form" style={imgStyle} />
          </div>

          {/* Record a sale */}
          <div className="step-box">
            <div className="step-box-title">💵 Record a sale</div>
            <StepItem num={1}>
              Click <Lbl>Sell</Lbl> on an active batch card. A sale modal opens showing current price and available quantity.
            </StepItem>
            <StepItem num={2}>
              Enter <Field>Quantity</Field>. The expected total calculates automatically. Enter <Field>Amount Paid</Field>{' '}
              (can differ from expected — handles underpayment and overpayment).
            </StepItem>
            <StepItem num={3}>
              Select <Field>Payment Method</Field>: Cash, Mobile Money, Card, or Bank Transfer.
            </StepItem>
            <StepItem num={4}>
              Optionally select a <Field>Customer</Field> or leave as "Walk-in customer". Click <Lbl>Confirm Sale</Lbl>.
              A receipt shows payment status (Paid/Partial/Overpaid), amounts, and remaining batch quantity.
            </StepItem>
          </div>

          {/* Collect unpaid balances */}
          <div className="step-box">
            <div className="step-box-title">Collect unpaid balances</div>
            <StepItem num={1}>
              Click <Lbl>Pending</Lbl>. In <Lbl>due balance</Lbl> if client gives you remaining amount, click on{' '}
              <Lbl>collect</Lbl>.
            </StepItem>
            <img src={collectayasigayeImg} alt="Collect Balance" style={imgStyle} />
          </div>

          {/* Handle pending balances */}
          <div className="step-box">
            <div className="step-box-title">🔄 Handle pending balances</div>
            <StepItem num={1}>
              Click the orange <Lbl>Pending</Lbl> button. A modal opens with two tabs: <strong>Balance Due</strong>{' '}
              (underpaid) and <strong>Change to Give</strong> (overpaid).
            </StepItem>
            <StepItem num={2}>
              <strong>Balance Due:</strong> find the customer, click <Lbl>Collect</Lbl>. Enter amount received. Click{' '}
              <Lbl>Confirm</Lbl>.
            </StepItem>
            <StepItem num={3}>
              <strong>Change to Give:</strong> after returning change to the customer, click <Lbl>Mark Returned</Lbl> to
              close the record.
            </StepItem>
          </div>

          {/* To pay amount */}
          <div className="step-box">
            <div className="step-box-title">To pay amount (changes to give)</div>
            <StepItem num={1}>
              Click <Lbl>Pending</Lbl>. In <Lbl>change to give</Lbl> we need to give client amount, click on{' '}
              <Lbl>Mark Returned</Lbl>.
            </StepItem>
            <img src={returnsImg} alt="Returns" style={imgStyle} />
          </div>

        </div>
      </div>

      {/* Requests */}
      <div className="step-box">
        <div className="step-box-title">Request something (if it happens)</div>
        <StepItem num={1}>
          Click <Lbl>Requests</Lbl> in sidebar to get all requests.
        </StepItem>
        <img src={requestsImg} alt="Requests" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title">Add new request</div>
        <StepItem num={1}>
          Click <Lbl>Requests</Lbl> in sidebar, then click <Lbl>Add Request</Lbl>.
        </StepItem>
        <img src={requestImg} alt="Add Request" style={imgStyle} />
      </div>

      {/* Leave */}
      <div className="step-box">
        <div className="step-box-title">Leave</div>
        <StepItem num={1}>Click <Lbl>Leave</Lbl>.</StepItem>
        <img src={allleaveImg} alt="All Leave" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Ask for Leave</Lbl></div>
        <StepItem num={1}>Click <Lbl>Request</Lbl>, complete the form and submit.</StepItem>
        <img src={hobeLeaveImg} alt="Request Leave" style={imgStyle} />
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Hobe reports</Lbl></div>
        <StepItem num={1}>
          Click <Lbl>sales reports</Lbl> tab to get the report about all hobe transactions.
        </StepItem>
        <img src={hobereportImg} alt="Hobe Report" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Generate reports</Lbl></div>
        <StepItem num={1}>
          Click <Lbl>generate reports</Lbl> — fill the modal, select who will see your report, then submit.
        </StepItem>
        <img src={generatehobereportImg} alt="Generate Report" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>my reports</Lbl> on sidebar.</StepItem>
        <img src={myhobereportsImg} alt="My Reports" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Notifications</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Notifications</Lbl></div>
        <StepItem num={1}>Click <Lbl>notifications</Lbl> on sidebar.</StepItem>
        <img src={hobenotifyImg} alt="Notifications" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Settings</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Settings</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>profile</Lbl>.</StepItem>
        <img src={profileImg} alt="Profile Settings" style={imgStyle} />
      </div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Change credentials (email and password)</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>password</Lbl>.</StepItem>
        <img src={passImg} alt="Change Password" style={imgStyle} />
      </div>
    </div>
  );
}
