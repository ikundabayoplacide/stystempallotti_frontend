import dashboardImg from '../../assets/images/hobe/dashboard.png';
import jobsImg from '../../assets/images/hobe/jobs.png';
import createJobImg from '../../assets/images/hobe/createJOb.png';
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
import logoutImg from '../../assets/images/hobe/logout.png';

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
          <h2>Hobe (Trade)</h2>
          <p>Batch trading and stock requests</p>
        </div>
      </div>
      <div className="sec-divider" />

      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>On this page you will:</strong> view and create jobs, add and manage trade batches, record sales (including partial and overpayments), collect outstanding balances, handle pending changes to give back, submit stock requests, request leave, and generate reports.</p>
        </div>
      </div>

      <p>
        Your sidebar: <strong>Dashboard, Jobs, Trade, Requests, My Leave, Reports ▾.</strong> The Hobe module handles trading
        goods in batches, recording sales, and managing outstanding payments (underpaid and overpaid).
      </p>
      <img src={dashboardImg} alt="Hobe Dashboard" style={imgStyle} /><br /><br />

<p> THis is about trade management</p>
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


      {/* Jobs */}
      <p>When there is new hobe job available and managed , hobe manager will be created</p>
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📋</div>
          <div>
            <div className="pc-title">Jobs</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>List of all jobs assigned to the Hobe department. You can view job details and track their status.</p>
            <img src={jobsImg} alt="Hobe Jobs" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <div className="step-box">
            <div className="step-box-title">➕ Create a Job</div>
            <StepItem num={1}>Click <Lbl>Create Job</Lbl> to open the job creation form.</StepItem>
            <StepItem num={2}>Fill in all required job details, then click <Lbl>Submit</Lbl>.</StepItem>
            <img src={createJobImg} alt="Create Job" style={imgStyle} />
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
            <img src={allleaveImg} alt="All Leave" style={imgStyle} />
          </div>
          <div className="step-box">
            <div className="step-box-title"><Lbl>Request Leave</Lbl></div>
            <StepItem num={1}>Click <Lbl>Request Leave</Lbl>, complete the form (leave type, dates, reason), and submit.</StepItem>
            <img src={hobeLeaveImg} alt="Request Leave" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Sales Reports</Lbl></div>
        <StepItem num={1}>
          Click <Lbl>Reports</Lbl> in the sidebar, then click the <Lbl>Sales Reports</Lbl> tab to see all hobe transactions.
        </StepItem>
        <img src={hobereportImg} alt="Hobe Report" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Generate Report</Lbl></div>
        <StepItem num={1}>
          Click <Lbl>Generate Report</Lbl> — fill the modal, select who will receive your report, then submit.
        </StepItem>
        <img src={generatehobereportImg} alt="Generate Report" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>My Reports</Lbl> on sidebar to see reports you have generated.</StepItem>
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

      <div className="step-box">
        <div className="step-box-title">🚪 How to log out</div>
        <StepItem num={1}>Click your <strong>avatar / name</strong> in the top-right corner of the page header. A dropdown menu opens.</StepItem>
        <img src={logoutImg} alt="Logout dropdown" style={imgStyle} />
        <StepItem num={2}>Click <Lbl>Logout</Lbl> (shown in red at the bottom of the dropdown).</StepItem>
        <StepItem num={3}>You are immediately signed out and redirected to the login page.</StepItem>
      </div>
    </div>
  );
}
