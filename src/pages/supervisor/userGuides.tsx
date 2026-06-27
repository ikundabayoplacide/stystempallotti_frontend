import supervisorDashboardImg from '../../assets/images/supervisor/supervisorDashboard.png';
import jobsImg from '../../assets/images/supervisor/jobs.png';
import employeeImg from '../../assets/images/supervisor/employee.png';
import requestLeaveImg from '../../assets/images/supervisor/requestLeave.png';
import myReportsImg from '../../assets/images/supervisor/myreports.png';
import assignedReportsImg from '../../assets/images/supervisor/assignedreports.png';
import reportsImg from '../../assets/images/supervisor/reports.png';
import notificationsImg from '../../assets/images/supervisor/notifications.png';
import profileImg from '../../assets/images/supervisor/profile.png';
import passImg from '../../assets/images/supervisor/pass.png';

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

export default function SupervisorUserGuide() {
  return (
    <div>
      <div className="sec-title" id="supervisor">
        <div className="sec-icon sec-icon-blue">🎯</div>
        <div className="sec-text">
          <h2>Supervisor</h2>
          <p>Department job management</p>
        </div>
      </div>
      <div className="sec-divider" />

      <div className="info-box" style={{ marginBottom: '1rem' }}>
        <span className="box-icon">📌</span>
        <div className="box-content">
          <p><strong>On this page you will:</strong> assign jobs to workers in your department, track each job's progress, mark your department's work as done, view your employees, request leave, generate and review reports, and manage your account settings.</p>
        </div>
      </div>

      <p>Your sidebar: <strong>Dashboard, Jobs, Employees, Machines, Binding Stock, My Leave, Reports ▾.</strong></p>
      <img src={supervisorDashboardImg} alt="Supervisor Dashboard" style={imgStyle} />

      <div className="warn-box">
        <span className="box-icon">⚠️</span>
        <div className="box-content">
          <p><strong>Department Required:</strong> Your user account must be assigned to a department. If not, you will
            see "Your account is not assigned to a department" and cannot use the Jobs page. Ask the Administrator to
            assign your account.</p>
        </div>
      </div>

      {/* Jobs */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>📋</div>
          <div>
            <div className="pc-title">Jobs (Supervisor View)</div>
            <img src={jobsImg} alt="Supervisor Jobs" style={imgStyle} />
          </div>
        </div>
        <div className="pc-body">
          <ScreenMock>
            Table of jobs assigned to <strong>your department only</strong>. Columns: Job #, Client, Status, Dept State,
            Progress, Priority, Due Date, Actions. Urgent jobs have a red background. Summary cards: Active · Dept Done ·
            Completed · Urgent counts. Search box. Three dots (⋮) Actions menu per row.
          </ScreenMock>

          <div className="info-box">
            <span className="box-icon">📌</span>
            <div className="box-content">
              <p><strong>Three tracking fields per job:</strong> <strong>Status</strong> (overall stage) ·{' '}
                <strong>Dept State</strong> (your department's sub-state, e.g., in-printing → printing-done) ·{' '}
                <strong>Progress</strong> (individual worker: Started/Paused/Resumed/Completed)</p>
            </div>
          </div>

          <div className="step-box">
            <div className="step-box-title">👤 Assign a job to a worker</div>
            <StepItem num={1}>Find the job. Click ⋮ in the Actions column → select <Lbl>Assign</Lbl>.</StepItem>
            <StepItem num={2}>
              A list of employees in your department appears, each showing availability
              (Available / Has other job / Already assigned).
            </StepItem>
            <StepItem num={3}>Click the worker you want. The job appears on their Task Board.</StepItem>
          </div>

          <div className="step-box">
            <div className="step-box-title">✅ Mark your department's work as Done</div>
            <StepItem num={1}>
              This is only available after the assigned worker has <strong>Completed</strong> their progress.
            </StepItem>
            <StepItem num={2}>
              Click ⋮ → <Lbl>Mark Done</Lbl>. A confirmation modal shows the current state and what it will change to.
            </StepItem>
            <StepItem num={3}>
              Click <Lbl>Confirm — Mark Done</Lbl>. The Production Manager can now advance the job to the next department.
            </StepItem>
          </div>
        </div>
      </div>

      {/* Employees */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--teal-100)' }}>👥</div>
          <div>
            <div className="pc-title">Employees</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>View all employees in your department and their current task status.</p>
          </div>
        </div>
        <div className="pc-body">
          <img src={employeeImg} alt="Employees" style={imgStyle} />
        </div>
      </div>

      {/* Leave */}
      <div className="page-card">
        <div className="pc-header">
          <div className="pc-icon" style={{ background: 'var(--gold-pale)' }}>🌴</div>
          <div>
            <div className="pc-title">My Leave</div>
            <p style={{ fontSize: '.8rem', margin: '.2rem 0 0', color: 'var(--color-custom-700)' }}>View your leave history and request new leave.</p>
          </div>
        </div>
        <div className="pc-body">
          <div className="step-box">
            <div className="step-box-title"><Lbl>Request Leave</Lbl></div>
            <StepItem num={1}>Click <Lbl>My Leave</Lbl> in the sidebar to see your leave balance and history.</StepItem>
            <img src={requestLeaveImg} alt="Leave Page" style={imgStyle} />
            <StepItem num={2}>Click <Lbl>Request Leave</Lbl>, complete the form (leave type, dates, reason), and submit.</StepItem>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="step-box-title">📋 ABOUT REPORTS</div>
      <div className="step-box">
        <div className="step-box-title"><Lbl>Reports</Lbl></div>
        <StepItem num={1}>Click <Lbl>Reports</Lbl> on the sidebar to view department job reports.</StepItem>
        <img src={reportsImg} alt="Reports" style={imgStyle} />
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
        <img src={notificationsImg} alt="Notifications" style={imgStyle} />
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
