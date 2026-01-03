import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  Plane,
  Calendar,
  Clock,
} from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { ROUTES } from "../../config/constants";
import {
  attendanceAPI,
  dashboardAPI,
  leavesAPI,
  payrollAPI,
  usersAPI,
} from "../../services";
import { useAttendance } from "../../hooks/useAttendance";
import { cn } from "../../utils/cn";

const adminTabs = [
  { key: "overview", label: "Overview", path: ROUTES.ADMIN_DASHBOARD },
  { key: "employees", label: "Employees", path: ROUTES.ADMIN_EMPLOYEES },
  { key: "attendance", label: "Attendance", path: ROUTES.ADMIN_ATTENDANCE },
  { key: "approvals", label: "Time Off", path: ROUTES.ADMIN_TIME_OFF },
];

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";
const SUB_TEXT = "text-sm text-[#7f5a6f]";

const PATH_TO_TAB = {
  [ROUTES.ADMIN_DASHBOARD]: "overview",
  [ROUTES.ADMIN_EMPLOYEES]: "employees",
  [ROUTES.ADMIN_ATTENDANCE]: "attendance",
  [ROUTES.ADMIN_TIME_OFF]: "approvals",
};

const AdminDashboard = () => {
  const location = useLocation();
  const attendance = useAttendance();
  const [requests, setRequests] = useState([]);
  const [hrStats, setHrStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeTab = PATH_TO_TAB[location.pathname] || "overview";

  const approvals = requests.filter((request) => request.status === "pending");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [hrData, employeesRes, attendanceRes, leavesRes, payrollRes] =
          await Promise.all([
            dashboardAPI.getHRDashboard(),
            usersAPI.getAllEmployees(),
            attendanceAPI.getAllAttendance(),
            leavesAPI.getAllLeaves(),
            payrollAPI.getPayrollSummary(),
          ]);

        if (!isMounted) return;

        setHrStats(hrData);
        setEmployees(employeesRes?.employees || []);
        setAttendanceRecords(attendanceRes?.attendance || []);
        setRequests(
          (leavesRes?.leaves || []).map((leave) => ({
            ...leave,
            status: leave.status?.toLowerCase() || leave.status,
            employeeName: leave.employee_name || leave.employee,
          }))
        );
        setPayrollSummary(
          payrollRes?.summary
            ? { ...payrollRes, ...payrollRes.summary }
            : payrollRes
        );
        setError(null);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const headcount = hrStats?.employees?.total ?? employees.length;
    const present = hrStats?.attendance?.present ?? 0;
    const totalForPresence =
      hrStats?.attendance?.total_marked || headcount || 1;
    const avgPresence = Math.round((present / totalForPresence) * 100);
    const cycleLabel = payrollSummary?.month
      ? `Month ${payrollSummary.month}-${payrollSummary.year}`
      : "Current Cycle";
    const netPayout =
      payrollSummary?.total_net_salary ?? payrollSummary?.total_gross_salary;

    return [
      {
        label: "Headcount",
        value: headcount,
        icon: Users,
        footer: `${present} present today`,
      },
      {
        label: "Active Leaves",
        value: hrStats?.leaves?.pending_count ?? 0,
        icon: Plane,
        footer: "Pending approvals",
      },
      {
        label: "Avg Presence",
        value: `${Number.isFinite(avgPresence) ? avgPresence : 0}%`,
        icon: Activity,
        footer: "Based on marked attendance",
      },
      {
        label: "Payroll Cycle",
        value: cycleLabel,
        icon: BarChart3,
        footer: formatCurrency(netPayout),
      },
    ];
  }, [employees.length, hrStats, payrollSummary]);

  const sidebar = (
    <div className="space-y-6">
      <TeamHealth attendance={hrStats?.attendance} />
      <PayrollPanel summary={payrollSummary} />
    </div>
  );

  const handleDecision = async (id, status) => {
    try {
      const response = await leavesAPI.approveLeave(id, {
        status: status === "approved" ? "APPROVED" : "REJECTED",
        admin_comment:
          status === "approved" ? "Approved by admin" : "Rejected by admin",
      });
      const updated = response?.leave || response;

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? { ...req, ...updated, status: updated.status?.toLowerCase() }
            : req
        )
      );
    } catch (err) {
      console.error("Failed to update leave status:", err);
      setError("Could not update leave status.");
    }
  };

  const weeklyPresenceData = useMemo(() => {
    const groups = attendanceRecords.reduce((acc, record) => {
      const date = record.date ? new Date(record.date) : null;
      const dayKey = date
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : "Day";
      if (!acc[dayKey])
        acc[dayKey] = {
          day: dayKey,
          present: 0,
          remote: 0,
          leave: 0,
          absent: 0,
        };

      const status = record.status?.toUpperCase();
      if (status === "PRESENT") acc[dayKey].present += 1;
      else if (status === "REMOTE") acc[dayKey].remote += 1;
      else if (status === "LEAVE") acc[dayKey].leave += 1;
      else if (status === "ABSENT") acc[dayKey].absent += 1;

      return acc;
    }, {});

    return Object.values(groups);
  }, [attendanceRecords]);

  return (
    <WorkspaceLayout
      title={
        activeTab === "overview"
          ? "People Operations Control"
          : activeTab === "attendance"
          ? "Attendance Management"
          : activeTab === "approvals"
          ? "Time Off Approvals"
          : "Employee Directory"
      }
      description={
        activeTab === "overview"
          ? "Approve leave, audit attendance dips, and maintain payroll readiness across pods."
          : activeTab === "attendance"
          ? "View employee attendance records and work hours."
          : activeTab === "approvals"
          ? "Review and approve/reject pending time off requests."
          : "Manage company employees and their information."
      }
      tabs={adminTabs}
      activeTab={activeTab}
      statusIndicator={attendance.status}
      sidebar={activeTab === "overview" ? sidebar : null}
      tag="Admin"
    >
      {loading ? (
        <div className="glass-panel p-6 text-sm text-[#75516c]">
          Loading dashboard data...
        </div>
      ) : error ? (
        <div className="glass-panel p-6 text-sm text-[#d9546d]">{error}</div>
      ) : (
        <>
          {activeTab === "overview" && (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-panel p-5">
                    <div className="flex items-center justify-between text-[#75516c]">
                      <p className={LABEL_TONE}>{stat.label}</p>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-[#2f1627]">
                      {stat.value}
                    </p>
                    <p className={SUB_TEXT}>{stat.footer}</p>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={LABEL_TONE}>Approvals</p>
                    <h3 className="text-lg font-semibold text-[#2f1627]">
                      Pending leave requests
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs text-[#75516c]",
                      BORDER_SOFT
                    )}
                  >
                    {approvals.length} pending
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {approvals.length ? (
                    approvals.map((request) => (
                      <div
                        key={request.id}
                        className={cn(
                          "flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm",
                          BORDER_SOFT,
                          CHIP_BG
                        )}
                      >
                        <div className="min-w-[200px] flex-1">
                          <p className="font-semibold text-[#2f1627]">
                            {request.employeeName || request.employee_name}
                          </p>
                          <p className="text-xs text-[#8b6b7e]">
                            {request.leave_type} •{" "}
                            {formatDate(request.start_date)} to{" "}
                            {formatDate(request.end_date)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(request.id, "rejected")
                            }
                            className="inline-flex items-center gap-1 rounded-2xl border border-[#f5bac8] px-3 py-2 text-xs text-[#d9546d]"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(request.id, "approved")
                            }
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

              <AttendanceMatrix weeklyPresence={weeklyPresenceData} />
            </div>
          )}

          {activeTab === "attendance" && (
            <AdminAttendanceView records={attendanceRecords} />
          )}

          {activeTab === "approvals" && (
            <AdminTimeOffView requests={requests} onDecision={handleDecision} />
          )}

          {activeTab === "employees" && (
            <AdminEmployeesView employees={employees} />
          )}
        </>
      )}
    </WorkspaceLayout>
  );
};

const AdminAttendanceView = ({ records = [] }) => (
  <div className="glass-panel overflow-hidden">
    <div
      className={cn("flex items-center justify-between px-6 py-4", BORDER_SOFT)}
    >
      <div>
        <p className={LABEL_TONE}>Employee Attendance</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">Recent records</h3>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs text-[#75516c]",
          BORDER_SOFT
        )}
      >
        {records.length} rows
      </span>
    </div>
    <div className="divide-y divide-[rgba(117,81,108,0.1)]">
      {records.map((record) => (
        <div
          key={record.id}
          className="grid grid-cols-[140px_minmax(0,1fr)_120px_120px] gap-4 px-6 py-4 text-sm text-[#2f1627] max-sm:grid-cols-2 max-sm:text-xs"
        >
          <div>
            <p className="font-semibold text-[#2f1627]">
              {formatDate(record.date)}
            </p>
            <p className="text-[#9d7a8d]">{record.employee_name}</p>
          </div>
          <div>
            <p className={LABEL_TONE}>Status</p>
            <p className="mt-1 text-sm font-medium text-[#2f1627]">
              {record.status}
            </p>
          </div>
          <div>
            <p className={LABEL_TONE}>Check In</p>
            <p className="mt-1 text-sm font-medium text-[#2f1627]">
              {formatTime(record.check_in_time)}
            </p>
          </div>
          <div>
            <p className={LABEL_TONE}>Check Out</p>
            <p className="mt-1 text-sm font-medium text-[#2f1627]">
              {formatTime(record.check_out_time)}
            </p>
          </div>
        </div>
      ))}
      {records.length === 0 && (
        <div className="px-6 py-4 text-sm text-[#75516c]">
          No attendance records found.
        </div>
      )}
    </div>
  </div>
);

const AdminTimeOffView = ({ requests, onDecision }) => {
  const pendingRequests = requests.filter((req) => req.status === "pending");
  const approved = requests.filter((req) => req.status === "approved").length;
  const rejected = requests.filter((req) => req.status === "rejected").length;

  const formatDays = (start, end) => {
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    if (
      !startDate ||
      !endDate ||
      Number.isNaN(startDate) ||
      Number.isNaN(endDate)
    )
      return "—";
    const diff = Math.max(
      1,
      Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    );
    return `${diff} day${diff > 1 ? "s" : ""}`;
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={LABEL_TONE}>Time Off Allocations & Approvals</p>
          <h3 className="text-lg font-semibold text-[#2f1627]">
            Manage employee leaves
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs text-[#75516c]",
            BORDER_SOFT
          )}
        >
          {pendingRequests.length} pending
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <p className={LABEL_TONE}>Pending Requests</p>
          <div className="mt-3 space-y-3">
            {pendingRequests.length ? (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm",
                    BORDER_SOFT,
                    CHIP_BG
                  )}
                >
                  <div className="min-w-[250px] flex-1">
                    <p className="font-semibold text-[#2f1627]">
                      {request.employeeName || request.employee_name}
                    </p>
                    <p className="text-xs text-[#8b6b7e]">
                      {request.leave_type} • {formatDate(request.start_date)} to{" "}
                      {formatDate(request.end_date)} (
                      {formatDays(request.start_date, request.end_date)})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onDecision(request.id, "rejected")}
                      className="inline-flex items-center gap-1 rounded-2xl bg-[#ffe8ed] px-3 py-2 text-xs font-medium text-[#d9546d] hover:bg-[#ffd4de]"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecision(request.id, "approved")}
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

        <div className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}>
          <p className={LABEL_TONE}>Allocation Summary</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-[#8b6b7e]">Pending</p>
              <p className="text-xl font-semibold text-[#2f1627]">
                {pendingRequests.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8b6b7e]">Approved</p>
              <p className="text-xl font-semibold text-[#2f1627]">{approved}</p>
            </div>
            <div>
              <p className="text-xs text-[#8b6b7e]">Rejected</p>
              <p className="text-xl font-semibold text-[#2f1627]">{rejected}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminEmployeesView = ({ employees = [] }) => (
  <div className="glass-panel overflow-hidden">
    <div
      className={cn("flex items-center justify-between px-6 py-4", BORDER_SOFT)}
    >
      <div>
        <p className={LABEL_TONE}>Employee Directory</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">All employees</h3>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs text-[#75516c]",
          BORDER_SOFT
        )}
      >
        {employees.length} total
      </span>
    </div>
    <div className="divide-y divide-[rgba(117,81,108,0.1)]">
      {employees.map((employee) => (
        <div
          key={employee.id}
          className="flex items-center justify-between px-6 py-4 text-sm hover:bg-[rgba(117,81,108,0.05)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef1f5] text-xs font-semibold text-[#75516c]">
              {employee.user?.first_name?.[0] ||
                employee.user?.username?.[0] ||
                "E"}
            </div>
            <div>
              <p className="font-semibold text-[#2f1627]">
                {employee.user?.first_name} {employee.user?.last_name}
              </p>
              <p className={SUB_TEXT}>{employee.department || "General"}</p>
            </div>
          </div>
          <p className={SUB_TEXT}>{employee.job_title || "Employee"}</p>
        </div>
      ))}
      {employees.length === 0 && (
        <div className="px-6 py-4 text-sm text-[#75516c]">
          No employees found.
        </div>
      )}
    </div>
  </div>
);

const AttendanceMatrix = ({ weeklyPresence = [] }) => (
  <div className="glass-panel p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className={LABEL_TONE}>Weekly pulse</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">Site coverage</h3>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs text-[#75516c]",
          BORDER_SOFT
        )}
      >
        Auto refreshed
      </span>
    </div>
    <div className="mt-4 space-y-3">
      {weeklyPresence.map((slot) => {
        const total = slot.present + slot.remote + slot.leave + slot.absent;
        return (
          <div
            key={slot.day}
            className={cn("rounded-2xl px-4 py-3", BORDER_SOFT, CHIP_BG)}
          >
            <div className="flex items-center justify-between text-sm text-[#2f1627]">
              <span className="font-semibold">{slot.day}</span>
              <span>{slot.present + slot.remote} active</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Bar
                percent={(slot.present / total) * 100}
                label="Onsite"
                className="bg-[#2f9c74]"
              />
              <Bar
                percent={(slot.remote / total) * 100}
                label="Remote"
                className="bg-[#5aa6d8]"
              />
              <Bar
                percent={(slot.leave / total) * 100}
                label="Leave"
                className="bg-[#d47f2f]"
              />
              <Bar
                percent={(slot.absent / total) * 100}
                label="Absent"
                className="bg-[#d9546d]"
              />
            </div>
          </div>
        );
      })}
      {weeklyPresence.length === 0 && (
        <p className={SUB_TEXT}>No attendance data to visualize.</p>
      )}
    </div>
  </div>
);

const Bar = ({ percent, label, className }) => (
  <div className="flex-1">
    <div className="h-2 rounded-full bg-[#eddce4]">
      <div
        className={cn("h-2 rounded-full", className)}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
    <p className="mt-1 text-xs text-[#8b6b7e]">{label}</p>
  </div>
);

const TeamHealth = ({ attendance }) => {
  const present = attendance?.present ?? 0;
  const total = attendance?.total_marked || 1;
  const health = Math.round((present / total) * 100);

  return (
    <div className="glass-panel space-y-4 p-6">
      <p className={LABEL_TONE}>Team health</p>
      <div className="text-4xl font-semibold text-[#2f1627]">
        {Number.isFinite(health) ? `${health}%` : "—"}
      </div>
      <p className={SUB_TEXT}>
        Presence ratio based on today&apos;s marked attendance.
      </p>
    </div>
  );
};

const PayrollPanel = ({ summary }) => (
  <div className="glass-panel space-y-3 p-6 text-sm text-[#7f5a6f]">
    <p className={LABEL_TONE}>Payroll Snapshot</p>
    <p className="text-2xl font-semibold text-[#2f1627]">
      {formatCurrency(summary?.total_net_salary || summary?.total_gross_salary)}
    </p>
    <p>Processed this month: {summary?.payroll_count ?? 0}</p>
    <p>Employees covered: {summary?.employee_count ?? 0}</p>
  </div>
);

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "—";
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${amount}`;
  return `₹${numeric.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatTime(value) {
  if (!value) return "-";
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return value;
}

export default AdminDashboard;
