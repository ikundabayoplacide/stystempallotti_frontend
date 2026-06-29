import salesDashboardImg from '../../assets/images/sales/salesDashboard.png';
import salesImg from '../../assets/images/sales/sales.png';
import step1Img from '../../assets/images/sales/step1.png';
import step1SelectedImg from '../../assets/images/sales/step1selectedcustomer.png';
import step2MaterialsImg from '../../assets/images/sales/step2selectMaterials.png';
import listSelectedImg from '../../assets/images/sales/listofselectedandamount.png';
import uploadImageImg from '../../assets/images/sales/uploadImage.png';
import detailsOfAllImg from '../../assets/images/sales/detailsofall.png';
import stockImg from '../../assets/images/sales/stock.png';
import detailsOfStockImg from '../../assets/images/sales/detailsofstock.png';
import performaImg from '../../assets/images/sales/performa.png';
import leaveImg from '../../assets/images/sales/leave.png';
import requestLeaveImg from '../../assets/images/sales/requestleave.png';
import salesReportImg from '../../assets/images/sales/salesreport.png';
import generateReportImg from '../../assets/images/sales/generatereprot.png';
import myReportsImg from '../../assets/images/sales/myreports.png';
import assignedReportsImg from '../../assets/images/sales/assignedreports.png';
import checkNotifyImg from '../../assets/images/sales/checknotify.png';
import changePassImg from '../../assets/images/sales/changepass.png';
import logoutImg     from '../../assets/images/sales/logout.png';

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

function ScreenMock({ children }: { children: React.ReactNode }) {
  return (
    <div className="screen-mock">
      <div className="screen-mock-title">What you see</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function SalesUserGuide() {
  return (
    <div>
      <div className="sec-title" id="sales">
        <div className="sec-icon sec-icon-blue">💼</div>
        <div className="sec-text">
          <h2>Sales Officer</h2>
          <p>Jobs and proforma invoices</p>
        </div>
      </div>
      <div className="sec-divider" />

      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>On this page you will:</strong> create jobs for customers (selecting materials and uploading documents), manage proforma invoices (send to client, mark accepted/rejected, download PDF), view stock, request leave, and generate reports.</p>
        </div>
      </div>

      <p>Your sidebar: <strong>Dashboard, Jobs, Stock, Performa Invoice, My Leave, Reports ▾.</strong></p>

      {/* Dashboard */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>📊</div>
          <div>
            <div className="pc-title">Sales Dashboard</div>
            <img src={salesDashboardImg} alt="Sales Dashboard" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            KPI cards: Total Proformas This Month · Accepted Proformas · Jobs Created · Conversion Rate.
            Recent proformas table and recent jobs table below.
          </ScreenMock>
        </div>
      </div>

      {/* Jobs */}
      <div className="page-card">
        <div className="pc-header">
          <div>
            <div className="pc-title">Jobs</div>
            <p>The list of jobs that have been created, and overview. Actions: view to check many details of job,
              edit to modify the job, and delete to remove it.</p>
            <img src={salesImg} alt="Jobs List" style={imgStyle} />
          </div>
        </div>

        <div className="step-box">
          <div className="step-box-title">Create Job — Step 1</div>
          <p>On the left side there are customers who come in. Select a customer to proceed.</p>
          <img src={step1Img} alt="Create Job Step 1" style={imgStyle} />
        </div>

        <div className="step-box">
          <div className="step-box-title">Create Job — Step 2</div>
          <p>When a customer is selected, the right side activates — fill in all details of the job.</p>
          <img src={step1SelectedImg} alt="Create Job Step 2" style={imgStyle} />
        </div>

        <div className="step-box">
          <div className="step-box-title">Create Job — Step 3 (Select Materials)</div>
          <p>Select materials for the job. Clicking a material adds it to the materials needed list on the right side.</p>
          <img src={step2MaterialsImg} alt="Select Materials" style={imgStyle} />
          <img src={listSelectedImg} alt="List of Selected Materials" style={imgStyle} />
        </div>

        <div className="step-box">
          <div className="step-box-title">Create Job — Step 4 (Upload Documents)</div>
          <p>Upload any necessary documents for the job.</p>
          <img src={uploadImageImg} alt="Upload Documents" style={imgStyle} />
        </div>

        <div className="step-box">
          <div className="step-box-title">Create Job — Step 5 (View Details)</div>
          <p>Review all details of the job. Use <Lbl>Back</Lbl> to go back to the previous step.</p>
          <img src={detailsOfAllImg} alt="Job Details" style={imgStyle} />
        </div>
      </div>

      {/* Stock */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📄</div>
          <div>
            <div className="pc-title">Stock</div>
            <p>List of materials available in the company with quantity and price of each.</p>
            <img src={stockImg} alt="Stock" style={imgStyle} />
          </div>
        </div>
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📄</div>
          <div>
            <div className="pc-title">Stock / Details</div>
            <p>Stock details include the description, quantity, and price of each material.</p>
            <img src={detailsOfStockImg} alt="Stock Details" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* Performa Invoice */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📄</div>
          <div>
            <div className="step-box">
              <div className="step-box-title">📋 Manage a Performa Invoice</div>
              <StepItem num={1}>Click 👁 View to see full details: stock items, estimated amount, terms, notes.</StepItem>
              <StepItem num={2}>
                If status is <strong>Draft</strong>: click ✏️ Edit to update Valid Until date, Terms &amp; Conditions,
                and Notes. Click <Lbl>Save Changes</Lbl>.
              </StepItem>
              <StepItem num={3}>
                In the detail view: Draft → click <Lbl>Send to Client</Lbl>. Sent → click <Lbl>Mark Accepted</Lbl> or{' '}
                <Lbl>Mark Rejected</Lbl> based on client feedback.
              </StepItem>
              <StepItem num={4}>
                To print: click 🖨️ (opens printable page in new tab, use Ctrl+P). To save as PDF: click ⬇️ Download PDF.
              </StepItem>
            </div>
          </div>
        </div>
        <img src={performaImg} alt="Performa Invoice" style={imgStyle} />
        <div className="pc-body">
          <ScreenMock>
            Table: Performa #, Customer, Linked Job, Estimated Amount, Status badge (Draft/Sent/Accepted/Rejected/Expired),
            Valid Until, Created date. Actions per row: ✏️ Edit (Draft only) · 🖨️ Print · ⬇️ Download PDF · 👁 View.
            KPI cards: Total · Draft · Sent · Accepted Value.
          </ScreenMock>
          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>What is a Performa Invoice?</strong> It is a <strong>proposal/quotation</strong> sent to the
                customer for negotiation. Tax is NOT applied here — tax is only on the final invoice. A performa is
                automatically created when you create a job.</p>
            </div>
          </div>
        </div>
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
            <img src={leaveImg} alt="Leave" style={imgStyle} />
          </div>
          <div className="step-box">
            <div className="step-box-title"><Lbl>Request Leave</Lbl></div>
            <StepItem num={1}>Click <Lbl>Request Leave</Lbl>, complete the form (leave type, dates, reason), and submit.</StepItem>
            <img src={requestLeaveImg} alt="Request Leave" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>All Reports</Lbl></div>
        <p>Access jobs, proforma invoices, customer, and market reports.</p>
        <img src={salesReportImg} alt="Sales Reports" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Generate Report</Lbl></div>
        <StepItem num={1}>Click <Lbl>Generate Report</Lbl>, fill the form, select who will receive it, and submit.</StepItem>
        <img src={generateReportImg} alt="Generate Report" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>My Reports</Lbl> on sidebar to see reports you have generated.</StepItem>
        <img src={myReportsImg} alt="My Reports" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Assigned Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>Assigned Reports</Lbl> to view reports assigned to you by others.</StepItem>
        <img src={assignedReportsImg} alt="Assigned Reports" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Notifications</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Notifications</Lbl></div>
        <StepItem num={1}>Click <Lbl>notifications</Lbl> on sidebar.</StepItem>
        <img src={checkNotifyImg} alt="Notifications" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 Settings</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Change credentials (email and password)</Lbl></div>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>password</Lbl>.</StepItem>
        <img src={changePassImg} alt="Change Password" style={imgStyle} />
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
