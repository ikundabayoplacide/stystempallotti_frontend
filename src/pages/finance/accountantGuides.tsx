import dashboardImg from '../../assets/images/accountant/dashboard.png';
import listOfPaymentImg from '../../assets/images/accountant/listofpayment.png';
import collectPaymentImg from '../../assets/images/accountant/collectPayment.png';
import actionsViewImg from '../../assets/images/accountant/actions_view.png';
import invoicesImg from '../../assets/images/accountant/invoices.png';
import invoicesReportsImg from '../../assets/images/accountant/invoicesReports.png';
import operationBoutiqueImg from '../../assets/images/accountant/operation(boutique).png';
import boutiquePaymentsImg from '../../assets/images/accountant/boutique(payments).png';
import hobeTradeImg from '../../assets/images/accountant/hobetrade.png';
import debtRecoveryImg from '../../assets/images/accountant/debtRecovery.png';
import recoveryRecordImg from '../../assets/images/accountant/recorveryrecord.png';
import debtReportsImg from '../../assets/images/accountant/debtReports.png';
import accountReportPaymentsImg from '../../assets/images/accountant/accountReportPayments.png';
import myReportsImg from '../../assets/images/accountant/myreports.png';
import receivedReportsImg from '../../assets/images/accountant/receivedReports.png';
import leaveDetailsImg from '../../assets/images/accountant/leaveDetails.png';
import requestLeaveImg from '../../assets/images/accountant/requestLeave.png';
import notificationsImg from '../../assets/images/accountant/notifications.png';
import profileDataImg from '../../assets/images/accountant/profiledata.png';
import passwordImg from '../../assets/images/accountant/password.png';
import logoutImg from '../../assets/images/accountant/logout.png';

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

export default function AccountantUserGuide() {
  return (
    <div>

      {/* Section Title */}
      <div className="sec-title" id="accountant">
        <div className="sec-icon sec-icon-blue">💰</div>
        <div className="sec-text">
          <h2>Accountant</h2>
          <p>Payments, invoices, operations and debt recovery</p>
        </div>
      </div>
      <div className="sec-divider" />

      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>On this page you will:</strong> collect payments from customers for print jobs, generate invoices after full payment, monitor boutique and hobe sales operations, record and track debt recoveries, request leave, and review or generate reports.</p>
        </div>
      </div>

      <p>
        Your sidebar: <strong>Dashboard, Payments, Invoices, Documents, Operations, Recovery, My Leave, Reports ▾.</strong>{' '}
        As an accountant you collect payments from customers, generate invoices, monitor boutique and hobe sales,
        and track outstanding debts.
      </p>

      {/* ── Dashboard ─────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--color-primary-100)' }}>📊</div>
          <div>
            <div className="pc-title">Dashboard</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Your starting point. Shows a live snapshot of total invoices, how many are paid, how many are
              still pending, and how much cash was collected today.
            </p>
            <img src={dashboardImg} alt="Accountant Dashboard" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            KPI cards: Total Invoices · Paid · Pending · Collected Today (RWF).
            Below: Recent Invoices table — Invoice #, Job, Client, Amount, Due Date, Status badge.
            Search box to find any invoice instantly.
          </ScreenMock>
        </div>
      </div>

      {/* ── Payments ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#dcfce7' }}>💵</div>
          <div>
            <div className="pc-title">Payments</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              This is where you collect money from customers for their print jobs. Search for the job,
              choose full or partial payment, pick the payment method, and confirm. A receipt number is
              generated automatically.
            </p>
            <img src={listOfPaymentImg} alt="List of Payments" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            Table of all jobs: Job #, Title, Customer, Total Amount, Amount Paid, Balance, Job Status,
            Payment Status. <strong>Collect</strong> button on unpaid jobs. <strong>Invoice</strong> button
            appears on paid jobs that have no invoice yet. Search box at the top.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">💳 Collect a payment</div>
            <StepItem num={1}>
              Search for the customer's job by name or job number. Click <Lbl>Collect</Lbl> on the row.
            </StepItem>
            <img src={collectPaymentImg} alt="Collect Payment Modal" style={imgStyle} />
            <StepItem num={2}>
              Choose <strong>Full Payment</strong> or <strong>Partial Payment</strong>.
              If partial, enter the <Field>Amount to Pay</Field> — the remaining balance is shown automatically.
            </StepItem>
            <StepItem num={3}>
              Select <Field>Payment Method</Field>: Cash, Mobile Money, Bank Transfer, or Card.
              Add an optional note (e.g. MoMo reference number). Click <Lbl>Confirm Payment</Lbl>.
            </StepItem>
            <StepItem num={4}>
              A receipt appears showing Receipt #, amount paid, balance, and method. Click <Lbl>Done</Lbl>.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📄 Generate an invoice after payment</div>
            <StepItem num={1}>
              Once a job is fully paid, an <Lbl>Invoice</Lbl> button appears on the row.
              Click it to open the Generate Invoice form.
            </StepItem>
            <img src={actionsViewImg} alt="Generate Invoice" style={imgStyle} />
            <StepItem num={2}>
              Set the <Field>Due Date</Field> and add optional notes. Click <Lbl>Generate Invoice</Lbl>.
              The invoice is now available in the Invoices page.
            </StepItem>
          </div>
        </div>
      </div>

      {/* ── Invoices ──────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#eff6ff' }}>🧾</div>
          <div>
            <div className="pc-title">Invoices</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              A complete list of all generated invoices. You can view the full details of any invoice,
              download it as a PDF with the company letterhead, or cancel it if needed.
            </p>
            <img src={invoicesImg} alt="Invoices List" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            Summary cards: Total · Paid · Cancelled. Table: Invoice #, Job, Customer, Total (RWF),
            Status badge (Paid / Draft / Issued / Cancelled), Due Date, Actions menu (⋮).
            Filter by status. Search by invoice number, job or customer.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">👁 View &amp; download an invoice</div>
            <StepItem num={1}>Click ⋮ on any row → <Lbl>View</Lbl>. The detail modal shows line items, totals, and dates.</StepItem>
            <img src={invoicesReportsImg} alt="Invoice Detail" style={imgStyle} />
            <StepItem num={2}>
              Click <Lbl>Download PDF</Lbl> to save a PDF copy with the company letterhead.
            </StepItem>
            <StepItem num={3}>
              To cancel a non-cancelled invoice, click <Lbl>Cancel</Lbl> inside the modal.
            </StepItem>
          </div>
        </div>
      </div>

      {/* ── Operations ────────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#fdf4ff' }}>🏪</div>
          <div>
            <div className="pc-title">Operations</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              A read-only financial overview of all sales channels. Three tabs give you Boutique sales
              (reception shop), Payments collected (job payments), and Hobe trade — all filterable by
              period. You can export any tab to PDF.
            </p>
          </div>
        </div>
        <div className="pc-body">

          <div className="step-box">
            <div className="step-box-title">🛍️ Boutique (Reception) tab</div>
            <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
              Shows every boutique sale made at the reception shop — product, quantity, amount collected,
              payment status, and method. Useful for reconciling the shop's daily cash.
            </p>
            <img src={operationBoutiqueImg} alt="Boutique Operations" style={imgStyle} />
          </div>

          <div className="step-box">
            <div className="step-box-title">💵 Payments Collected tab</div>
            <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
              Lists all job payments recorded — receipt number, job, customer, amount, method (Cash /
              Mobile Money / Bank Transfer / Card), and whether the payment was full or partial.
            </p>
            <img src={boutiquePaymentsImg} alt="Payments Collected" style={imgStyle} />
          </div>

          <div className="step-box">
            <div className="step-box-title">🛒 Hobe Trade tab</div>
            <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
              Shows all Hobe batch sales — batch name, batch #, quantity sold, total expected vs. amount
              paid, any outstanding balance or change to return, and the payment method.
            </p>
            <img src={hobeTradeImg} alt="Hobe Trade" style={imgStyle} />
          </div>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p>Use the period tabs (Today / This Week / This Month / This Year) or pick a custom date range
                to filter any tab. Click <strong>PDF</strong> to export the current view.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Debt Recovery ─────────────────────────────────────────────── */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: '#fef2f2' }}>🔴</div>
          <div>
            <div className="pc-title">Recovery (Debt Recovery)</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>
              Tracks customers who have unpaid or partially paid job balances. When a customer pays
              their outstanding debt, you record the recovery here so the balance is updated.
            </p>
            <img src={debtRecoveryImg} alt="Debt Recovery" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            KPI cards: Total Records · Total Recovered (RWF) · Partial Paid (Outstanding) · Pending.
            Table: Job #, Customer, Job Title, Amount Recovered, Payment Method, Note, Date, Status.
            <strong> Record Recovery</strong> button at the top right.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">➕ Record a debt recovery</div>
            <StepItem num={1}>
              Click <Lbl>Record Recovery</Lbl>. A modal opens with a searchable list of all debtors
              (unpaid and partially paid jobs).
            </StepItem>
            <img src={recoveryRecordImg} alt="Record Recovery Modal" style={imgStyle} />
            <StepItem num={2}>
              Use the filter tabs (All / Unpaid / Partial Paid) or search by job # or customer name to find
              the debtor. Click their row to select them — their total, paid, and owed amounts are shown.
            </StepItem>
            <StepItem num={3}>
              Enter <Field>Amount Recovered</Field> (cannot exceed the balance due), set the
              <Field> Date Contacted</Field>, and select the <Field>Payment Method</Field>.
              Add an optional note. Click <Lbl>Record Recovery</Lbl>.
            </StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">📋 Debt recovery reports</div>
            <StepItem num={1}>
              Click <Lbl>Reports</Lbl> in the sidebar → <Lbl>Debt Recovery</Lbl> tab to see a full
              recovery history with stats and a PDF export option.
            </StepItem>
            <img src={debtReportsImg} alt="Debt Reports" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* ── Leave ─────────────────────────────────────────────────────── */}
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
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar to see your leave history and balance.</StepItem>
            <img src={leaveDetailsImg} alt="Leave Details" style={imgStyle} />
          </div>
          <div className="step-box">
            <div className="step-box-title"><Lbl>Request Leave</Lbl></div>
            <StepItem num={1}>Click <Lbl>Request Leave</Lbl>, fill in the leave type, dates and reason, then submit.</StepItem>
            <img src={requestLeaveImg} alt="Request Leave" style={imgStyle} />
          </div>
        </div>
      </div>

      {/* ── Reports ───────────────────────────────────────────────────── */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Account Reports (Payments)</Lbl></div>
        <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
          Filterable report of all payments collected. Shows totals by period and allows PDF export.
        </p>
        <img src={accountReportPaymentsImg} alt="Account Reports Payments" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My reports</Lbl></div>
        <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
          All reports you have generated and submitted. You can view or re-download them here.
        </p>
        <StepItem num={1}>Click <Lbl>my reports</Lbl> on sidebar.</StepItem>
        <img src={myReportsImg} alt="My Reports" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Received Reports</Lbl></div>
        <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
          Reports that other users have assigned to you for review.
        </p>
        <StepItem num={1}>Click <Lbl>received reports</Lbl> to view reports assigned to you.</StepItem>
        <img src={receivedReportsImg} alt="Received Reports" style={imgStyle} />
      </div>

      {/* ── Notifications ─────────────────────────────────────────────── */}
      <div className="step-box-title">📋 Notifications</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Notifications</Lbl></div>
        <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
          System alerts — new jobs confirmed, payment reminders, leave responses, and report assignments.
        </p>
        <StepItem num={1}>Click <Lbl>notifications</Lbl> on sidebar.</StepItem>
        <img src={notificationsImg} alt="Notifications" style={imgStyle} />
      </div>

      {/* ── Settings ──────────────────────────────────────────────────── */}
      <div className="step-box-title">📋 Settings</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Profile</Lbl></div>
        <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
          Update your display name, email address, and profile picture.
        </p>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>profile</Lbl>.</StepItem>
        <img src={profileDataImg} alt="Profile Settings" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Change credentials (email and password)</Lbl></div>
        <p style={{ fontSize: '.8rem', margin: 0, color: 'var(--color-custom-700)' }}>
          Change your login password. You will need to enter your current password to confirm.
        </p>
        <StepItem num={1}>Click <Lbl>settings</Lbl> then click <Lbl>password</Lbl>.</StepItem>
        <img src={passwordImg} alt="Change Password" style={imgStyle} />
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
