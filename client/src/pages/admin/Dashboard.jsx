import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  Plane,
  Calendar,
  Clock,
} from 'lucide-react';
import WorkspaceLayout from '../../components/layout/WorkspaceLayout';
import { ROUTES } from '../../config/constants';
import { employees, leaveRequests, payrollSummary, weeklyPresence, attendanceRecords } from '../../data/mockData';
import { useAttendance } from '../../hooks/useAttendance';
import { cn } from '../../utils/cn';

const adminTabs = [
  { key: 'overview', label: 'Overview', path: ROUTES.ADMIN_DASHBOARD },
  { key: 'employees', label: 'Employees', path: ROUTES.ADMIN_EMPLOYEES },
  { key: 'attendance', label: 'Attendance', path: ROUTES.ADMIN_ATTENDANCE },
  { key: 'approvals', label: 'Time Off', path: ROUTES.ADMIN_TIME_OFF },
];

const LABEL_TONE = 'text-xs uppercase tracking-[0.35em] text-[#b28fa1]';
const BORDER_SOFT = 'border-[rgba(117,81,108,0.18)]';
const CHIP_BG = 'bg-[#fef4f7]';
const SUB_TEXT = 'text-sm text-[#7f5a6f]';

const PATH_TO_TAB = {
  [ROUTES.ADMIN_DASHBOARD]: 'overview',
  [ROUTES.ADMIN_EMPLOYEES]: 'employees',
  [ROUTES.ADMIN_ATTENDANCE]: 'attendance',
  [ROUTES.ADMIN_TIME_OFF]: 'approvals',
};

const AdminDashboard = () => {
  const location = useLocation();
  const attendance = useAttendance();
  const [requests, setRequests] = useState(leaveRequests);
  const activeTab = PATH_TO_TAB[location.pathname] || 'overview';

  const approvals = requests.filter((request) => request.status === 'pending');

  const stats = useMemo(
    () => [
      { label: 'Headcount', value: employees.length, icon: Users, footer: '+4 new offers' },
      { label: 'Active Leaves', value: requests.filter((req) => req.status === 'approved').length, icon: Plane, footer: 'Next 14 days' },
      { label: 'Avg Presence', value: '89%', icon: Activity, footer: 'Rolling 4 weeks' },
      { label: 'Payroll Cycle', value: payrollSummary.cycle, icon: BarChart3, footer: payrollSummary.totalPayout },
    ],
    [requests]
  );

  const sidebar = (
    <div className="space-y-6">
      <TeamHealth />
      <PayrollPanel />
    </div>
  );

  const handleDecision = (id, status) => {
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status } : req)));
  };

  return (
    <WorkspaceLayout
      title={activeTab === 'overview' ? 'People Operations Control' : activeTab === 'attendance' ? 'Attendance Management' : activeTab === 'approvals' ? 'Time Off Approvals' : 'Employee Directory'}
      description={
        activeTab === 'overview' ? 'Approve leave, audit attendance dips, and maintain payroll readiness across pods.' :
        activeTab === 'attendance' ? 'View employee attendance records and work hours.' :
        activeTab === 'approvals' ? 'Review and approve/reject pending time off requests.' :
        'Manage company employees and their information.'
      }
      tabs={adminTabs}
      activeTab={activeTab}
      statusIndicator={attendance.status}
      sidebar={activeTab === 'overview' ? sidebar : null}
      tag="Admin"
    >
      {activeTab === 'overview' && (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel p-5">
                <div className="flex items-center justify-between text-[#75516c]">
                  <p className={LABEL_TONE}>{stat.label}</p>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#2f1627]">{stat.value}</p>
                <p className={SUB_TEXT}>{stat.footer}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={LABEL_TONE}>Approvals</p>
                <h3 className="text-lg font-semibold text-[#2f1627]">Pending leave requests</h3>
              </div>
              <span className={cn('rounded-full px-3 py-1 text-xs text-[#75516c]', BORDER_SOFT)}>{approvals.length} pending</span>
            </div>
            <div className="mt-4 space-y-3">
              {approvals.length ? (
                approvals.map((request) => (
                  <div key={request.id} className={cn('flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm', BORDER_SOFT, CHIP_BG)}>
                    <div className="min-w-[200px] flex-1">
                      <p className="font-semibold text-[#2f1627]">{request.employeeName}</p>
                      <p className="text-xs text-[#8b6b7e]">
                        {request.type} - {request.startDate}
                        {' -> '}
                        {request.endDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecision(request.id, 'rejected')}
                        className="inline-flex items-center gap-1 rounded-2xl border border-[#f5bac8] px-3 py-2 text-xs text-[#d9546d]"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(request.id, 'approved')}
                        className="inline-flex items-center gap-1 rounded-2xl border border-[#b5e1cd] px-3 py-2 text-xs text-[#2f9c74]"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className={SUB_TEXT}>All caught up!</p>
              )}
            </div>
          </div>

          <AttendanceMatrix />
        </div>
      )}

      {activeTab === 'attendance' && (
        <AdminAttendanceView />
      )}

      {activeTab === 'approvals' && (
        <AdminTimeOffView requests={requests} onDecision={handleDecision} />
      )}

      {activeTab === 'employees' && (
        <AdminEmployeesView />
      )}
    </WorkspaceLayout>
  );
};

const AdminAttendanceView = () => (
  <div className="glass-panel overflow-hidden">
    <div className={cn('flex items-center justify-between px-6 py-4', BORDER_SOFT)}>
      <div>
        <p className={LABEL_TONE}>Employee Attendance</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">October 2025</h3>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-xs text-[#75516c]', BORDER_SOFT)}>Today</span>
    </div>
    <div className="divide-y divide-[rgba(117,81,108,0.1)]">
      {attendanceRecords.map((record) => (
        <div key={record.id} className="grid grid-cols-[120px_minmax(0,1fr)_120px_120px] gap-4 px-6 py-4 text-sm text-[#2f1627] max-sm:grid-cols-2 max-sm:text-xs">
          <div>
            <p className="font-semibold text-[#2f1627]">{record.day}</p>
            <p className="text-[#9d7a8d]">{record.date}</p>
          </div>
          <div>
            <p className="text-xs text-[#b28fa1]">Employee(s)</p>
            <p className="font-semibold text-[#2f1627]">8 Present</p>
          </div>
          <div>
            <p className={LABEL_TONE}>Check In</p>
            <p className="mt-1 text-sm font-medium text-[#2f1627]">{record.checkIn}</p>
          </div>
          <div>
            <p className={LABEL_TONE}>Check Out</p>
            <p className="mt-1 text-sm font-medium text-[#2f1627]">{record.checkOut}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminTimeOffView = ({ requests, onDecision }) => {
  const pendingRequests = requests.filter((req) => req.status === 'pending');

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={LABEL_TONE}>Time Off Allocations & Approvals</p>
          <h3 className="text-lg font-semibold text-[#2f1627]">Manage employee leaves</h3>
        </div>
        <span className={cn('rounded-full px-3 py-1 text-xs text-[#75516c]', BORDER_SOFT)}>{pendingRequests.length} pending</span>
      </div>

      <div className="space-y-6">
        <div>
          <p className={LABEL_TONE}>Pending Requests</p>
          <div className="mt-3 space-y-3">
            {pendingRequests.length ? (
              pendingRequests.map((request) => (
                <div key={request.id} className={cn('flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm', BORDER_SOFT, CHIP_BG)}>
                  <div className="min-w-[250px] flex-1">
                    <p className="font-semibold text-[#2f1627]">{request.employeeName}</p>
                    <p className="text-xs text-[#8b6b7e]">
                      {request.type} • {request.startDate} to {request.endDate} ({request.days} days)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onDecision(request.id, 'rejected')}
                      className="inline-flex items-center gap-1 rounded-2xl bg-[#ffe8ed] px-3 py-2 text-xs font-medium text-[#d9546d] hover:bg-[#ffd4de]"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecision(request.id, 'approved')}
                      className="inline-flex items-center gap-1 rounded-2xl bg-[#e6f5ef] px-3 py-2 text-xs font-medium text-[#2f9c74] hover:bg-[#d0ebe3]"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={SUB_TEXT}>No pending requests</p>
            )}
          </div>
        </div>

        <div className={cn('rounded-2xl p-4', BORDER_SOFT, CHIP_BG)}>
          <p className={LABEL_TONE}>Allocation Summary</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-[#8b6b7e]">Paid Leave</p>
              <p className="text-xl font-semibold text-[#2f1627]">24 Days</p>
            </div>
            <div>
              <p className="text-xs text-[#8b6b7e]">Sick Leave</p>
              <p className="text-xl font-semibold text-[#2f1627]">07 Days</p>
            </div>
            <div>
              <p className="text-xs text-[#8b6b7e]">Unpaid Leave</p>
              <p className="text-xl font-semibold text-[#2f1627]">05 Days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminEmployeesView = () => (
  <div className="glass-panel overflow-hidden">
    <div className={cn('flex items-center justify-between px-6 py-4', BORDER_SOFT)}>
      <div>
        <p className={LABEL_TONE}>Employee Directory</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">All employees</h3>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-xs text-[#75516c]', BORDER_SOFT)}>{employees.length} total</span>
    </div>
    <div className="divide-y divide-[rgba(117,81,108,0.1)]">
      {employees.map((employee) => (
        <div key={employee.id} className="flex items-center justify-between px-6 py-4 text-sm hover:bg-[rgba(117,81,108,0.05)]">
          <div className="flex items-center gap-3">
            <img src={employee.avatar} alt={employee.name} className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-[#2f1627]">{employee.name}</p>
              <p className={SUB_TEXT}>{employee.department}</p>
            </div>
          </div>
          <p className={SUB_TEXT}>{employee.jobTitle}</p>
        </div>
      ))}
    </div>
  </div>
);

const AttendanceMatrix = () => (
  <div className="glass-panel p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className={LABEL_TONE}>Weekly pulse</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">Site coverage</h3>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-xs text-[#75516c]', BORDER_SOFT)}>Auto refreshed</span>
    </div>
    <div className="mt-4 space-y-3">
      {weeklyPresence.map((slot) => {
        const total = slot.present + slot.remote + slot.leave;
        return (
          <div key={slot.day} className={cn('rounded-2xl px-4 py-3', BORDER_SOFT, CHIP_BG)}>
            <div className="flex items-center justify-between text-sm text-[#2f1627]">
              <span className="font-semibold">{slot.day}</span>
              <span>{slot.present + slot.remote} active</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Bar percent={(slot.present / total) * 100} label="Onsite" className="bg-[#2f9c74]" />
              <Bar percent={(slot.remote / total) * 100} label="Remote" className="bg-[#5aa6d8]" />
              <Bar percent={(slot.leave / total) * 100} label="Leave" className="bg-[#d47f2f]" />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Bar = ({ percent, label, className }) => (
  <div className="flex-1">
    <div className="h-2 rounded-full bg-[#eddce4]">
      <div className={cn('h-2 rounded-full', className)} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
    <p className="mt-1 text-xs text-[#8b6b7e]">{label}</p>
  </div>
);

const TeamHealth = () => (
  <div className="glass-panel space-y-4 p-6">
    <p className={LABEL_TONE}>Team health</p>
    <div className="text-4xl font-semibold text-[#2f1627]">94%</div>
    <p className={SUB_TEXT}>Engagement based on weekly stand ups and check-ins.</p>
  </div>
);

const PayrollPanel = () => (
  <div className="glass-panel space-y-3 p-6 text-sm text-[#7f5a6f]">
    <p className={LABEL_TONE}>Payroll Snapshot</p>
    <p className="text-2xl font-semibold text-[#2f1627]">{payrollSummary.totalPayout}</p>
    <p>Average salary {payrollSummary.avgSalary}</p>
    <p>{payrollSummary.pendingAdjustments} adjustments pending review</p>
  </div>
);

export default AdminDashboard;
