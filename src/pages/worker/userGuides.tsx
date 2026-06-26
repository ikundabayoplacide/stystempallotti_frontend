import dashboardImg from '../../assets/images/worker/dashboard.png';
import taskBoardImg from '../../assets/images/worker/taskBoard.png';
import thewayRequestImg from '../../assets/images/worker/thewayrequest.png';
import itemsImg from '../../assets/images/worker/items.png';
import requestPageImg from '../../assets/images/worker/requestpage.png';
import leavePageImg from '../../assets/images/worker/leavepage.png';
import requestLeaveImg from '../../assets/images/worker/requestleave.png';
import reportPageImg from '../../assets/images/worker/reportpage.png';
import materialReportImg from '../../assets/images/worker/materialreport.png';
import myReportsImg from '../../assets/images/worker/myreports.png';
import reportAssignedImg from '../../assets/images/worker/reportAssigned.png';
import generateReportImg from '../../assets/images/worker/generatereport.png';

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

function ScreenMock({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="screen-mock">
      <div className="screen-mock-title">{title ?? 'What you see'}</div>
      <p style={{ fontSize: '.82rem', color: 'var(--gray-600)', margin: 0 }}>{children}</p>
    </div>
  );
}

export default function WorkerUserGuide() {
  return (
    <div>
      <div className="sec-title" id="worker">
        <div className="sec-icon sec-icon-blue">🔧</div>
        <div className="sec-text">
          <h2>13. Worker</h2>
          <p>Task board and material requests</p>
        </div>
      </div>
      <div className="sec-divider" />
      <p>Your sidebar: <strong>My Jobs, Task Board, Material Requests, My Leave, Reports ▾.</strong></p>
      <img src={dashboardImg} alt="Worker Dashboard" style={imgStyle} />

      <div className="warn-box">
        <span className="box-icon">⚠️</span>
        <div className="box-content">
          <p><strong>Account must be linked:</strong> Your employee record must be linked to your login account by the
            Administrator or HR. If you see "Employee profile not linked", contact your administrator immediately.</p>
        </div>
      </div>

      {/* Task Board */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--blue-100)' }}>🗂️</div>
          <div>
            <div className="pc-title">Task Board</div>
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock title="Kanban board — 4 columns">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '.5rem', fontSize: '.75rem' }}>
              <div style={{ background: 'var(--blue-pale)', border: '1px solid var(--blue-100)', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: 'var(--blue2)' }}>📋 To Do</strong><br /><span style={{ color: 'var(--gray-500)' }}>Assigned, not started</span>
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: '#a16207' }}>⚡ In Progress</strong><br /><span style={{ color: 'var(--gray-500)' }}>Currently working</span>
              </div>
              <div style={{ background: 'var(--orange-pale)', border: '1px solid var(--orange-100)', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: 'var(--orange)' }}>⏸ Paused</strong><br /><span style={{ color: 'var(--gray-500)' }}>Temporarily stopped</span>
              </div>
              <div style={{ background: 'var(--green-pale)', border: '1px solid var(--green-100)', borderRadius: 6, padding: '.6rem', textAlign: 'center' }}>
                <strong style={{ color: 'var(--green2)' }}>✅ Completed</strong><br /><span style={{ color: 'var(--gray-500)' }}>Work finished</span>
              </div>
            </div>
          </ScreenMock>
          <img src={taskBoardImg} alt="Task Board" style={imgStyle} />

          <div className="step-box">
            <div className="step-box-title">📋 Working through a job</div>
            <StepItem num={1}><strong>To start:</strong> Find the job in "To Do". Click <Lbl>Start</Lbl>. Card moves to "In Progress". Supervisor can see you started.</StepItem>
            <StepItem num={2}><strong>To pause:</strong> In "In Progress", click <Lbl>Pause</Lbl>. Card moves to "Paused".</StepItem>
            <StepItem num={3}><strong>To resume:</strong> In "Paused", click <Lbl>Resume</Lbl>. Card returns to "In Progress".</StepItem>
            <StepItem num={4}><strong>To complete:</strong> In "In Progress", click <Lbl>Complete</Lbl>. Card moves to "Completed". Supervisor can now "Mark Done" for the department.</StepItem>
            <StepItem num={5}>Click any card to open a detail modal with job type, description, deadline, and timestamps.</StepItem>
          </div>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p>You must click <strong>Complete</strong> before the Supervisor can mark the department as Done.
                Do not forget to complete your job cards when finished.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Material Requests */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>📦</div>
          <div>
            <div className="pc-title">Material Requests</div>
            <img src={itemsImg} alt="Material Requests" style={imgStyle} />
          </div>
        </div>
        <img src={requestPageImg} alt="My Requests" style={imgStyle} />
        <div className="pc-body">
          <ScreenMock>
            Two panels: <strong>Left</strong> — Available Items in General Stock (item name, category, stock level with
            OK/Low/Out indicator). <strong>Right</strong> — My Requests (your requests with status:
            pending/approved/rejected). Summary cards: Pending · Approved · Rejected counts. <strong>New Request</strong> button.
          </ScreenMock>

          <div className="step-box">
            <div className="step-box-title">📋 Request materials</div>
            <img src={thewayRequestImg} alt="Request Materials" style={imgStyle} />
            <StepItem num={1}>Click <Lbl>New Request</Lbl>. A modal opens.</StepItem>
            <StepItem num={2}>
              Select a stock item from the dropdown (shows current available quantity). Enter the Quantity needed.
              Click the <strong>+</strong> button to add it to your request list.
            </StepItem>
            <StepItem num={3}>Add more items the same way if needed.</StepItem>
            <StepItem num={4}>
              Enter a <Field>Reason</Field>* (required, e.g., "Running low on paper for job JOB-045").
              Click <Lbl>Submit Request</Lbl>.
            </StepItem>
          </div>
        </div>
      </div>

      {/* Leave */}
      <div className="step-box">
        <div className="step-box-title">My Leave</div>
        <p>Manage your leave requests.</p>
        <img src={leavePageImg} alt="Leave Page" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Ask for Leave</Lbl></div>
        <StepItem num={1}>Click <Lbl>Request</Lbl>, complete the form and submit.</StepItem>
        <img src={requestLeaveImg} alt="Request Leave" style={imgStyle} />
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>My Jobs Report</Lbl></div>
        <p>View reports about your submitted jobs.</p>
        <img src={reportPageImg} alt="Report Page" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Material Requests Report</Lbl></div>
        <p>View your material request reports.</p>
        <img src={materialReportImg} alt="Material Report" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Generate Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>generate reports</Lbl> and fill out the form.</StepItem>
        <img src={generateReportImg} alt="Generate Report" style={imgStyle} />
      </div>

      <div className="step-box-title">📋 MY REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>My reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>my reports</Lbl> on sidebar.</StepItem>
        <img src={myReportsImg} alt="My Reports" style={imgStyle} />
      </div>

      <div className="step-box">
        <div className="step-box-title"><Lbl>Assigned Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>reports assigned</Lbl> to view reports assigned to you.</StepItem>
        <img src={reportAssignedImg} alt="Assigned Reports" style={imgStyle} />
      </div>
    </div>
  );
}
