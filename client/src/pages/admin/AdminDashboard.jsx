import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { ROUTES } from "../../config/constants";
import { dashboardAPI, leavesAPI, attendanceAPI } from "../../services";
import { cn } from "../../utils/cn";

const tabs = [
  { key: "dashboard", label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
  { key: "employees", label: "Employees", path: ROUTES.ADMIN_EMPLOYEES },
  { key: "attendance", label: "Attendance", path: ROUTES.ADMIN_ATTENDANCE },
  { key: "leaves", label: "Leave Requests", path: ROUTES.ADMIN_TIME_OFF },
];

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";

// Dummy data for demonstration
const DUMMY_STATS = {
  total_employees: 48,
  present_today: 42,
  on_leave_today: 3,
  pending_leaves: 5,
};

const DUMMY_PENDING_LEAVES = [
  {
    id: 1,
    employee: { first_name: "John", last_name: "Doe" },
    leave_type: "Casual Leave",
    start_date: "2026-01-10",
    end_date: "2026-01-12",
    reason: "Personal work",
    status: "pending",
  },
  {
    id: 2,
    employee: { first_name: "Sarah", last_name: "Johnson" },
    leave_type: "Sick Leave",
    start_date: "2026-01-08",
    end_date: "2026-01-08",
    reason: "Medical appointment",
    status: "pending",
  },
  {
    id: 3,
    employee: { first_name: "Michael", last_name: "Chen" },
    leave_type: "Vacation",
    start_date: "2026-01-15",
    end_date: "2026-01-22",
    reason: "Planned vacation",
    status: "pending",
  },
  {
    id: 4,
    employee: { first_name: "Emily", last_name: "Williams" },
    leave_type: "Casual Leave",
    start_date: "2026-01-20",
    end_date: "2026-01-21",
    reason: "Family event",
    status: "pending",
  },
  {
    id: 5,
    employee: { first_name: "David", last_name: "Martinez" },
    leave_type: "Maternity Leave",
    start_date: "2026-02-01",
    end_date: "2026-05-01",
    reason: "Maternity",
    status: "pending",
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(DUMMY_STATS);
  const [pendingLeaves, setPendingLeaves] = useState(DUMMY_PENDING_LEAVES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardData, leavesData] = await Promise.all([
        dashboardAPI.getHRDashboard(),
        leavesAPI.getAllLeaves({ status: "pending" }),
      ]);
      // Use API data if available, otherwise use dummy data
      setStats(dashboardData || DUMMY_STATS);
      setPendingLeaves(
        (leavesData && leavesData.slice(0, 5)) || DUMMY_PENDING_LEAVES
      );
    } catch (err) {
      console.error("Failed to fetch dashboard, using dummy data:", err);
      // Keep dummy data on error
      setStats(DUMMY_STATS);
      setPendingLeaves(DUMMY_PENDING_LEAVES);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, isApproved) => {
    try {
      // Try to update via API
      try {
        await leavesAPI.approveLeave(id, { is_approved: isApproved });
      } catch (apiErr) {
        console.warn("API update failed, updating locally:", apiErr);
      }
      // Update local state regardless
      setPendingLeaves((prev) => prev.filter((leave) => leave.id !== id));
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to update leave:", err);
    }
  };

  const statCards = [
    {
      label: "Total Employees",
      value: stats?.total_employees || 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Present Today",
      value: stats?.present_today || 0,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "On Leave",
      value: stats?.on_leave_today || 0,
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      label: "Pending Approvals",
      value: stats?.pending_leaves || 0,
      icon: FileText,
      color: "bg-purple-500",
    },
  ];

  return (
    <WorkspaceLayout
      title="HR Dashboard"
      description="Manage your team, approve requests, and monitor attendance all in one place."
      tabs={tabs}
      activeTab="dashboard"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel h-32 animate-pulse p-5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="glass-panel p-5">
                  <div className="flex items-center justify-between">
                    <p className={LABEL_TONE}>{stat.label}</p>
                    <div className={cn("rounded-xl p-2", stat.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-[#2f1627]">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={LABEL_TONE}>Pending Approvals</p>
              <h3 className="text-lg font-semibold text-[#2f1627]">
                Leave Requests
              </h3>
            </div>
            <a
              href={ROUTES.ADMIN_TIME_OFF}
              className="text-sm text-[#75516c] hover:underline"
            >
              View All
            </a>
          </div>

          <div className="mt-4 space-y-3">
            {pendingLeaves.length > 0 ? (
              pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className={cn(
                    "flex items-center justify-between rounded-2xl p-4",
                    BORDER_SOFT,
                    CHIP_BG
                  )}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#2f1627]">
                      {leave.employee_name || "Employee"}
                    </p>
                    <p className="text-sm text-[#7f5a6f]">
                      {leave.leave_type} • {leave.start_date} to{" "}
                      {leave.end_date} ({leave.days_requested} days)
                    </p>
                    <p className="mt-1 text-xs text-[#8b6b7e]">
                      {leave.reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLeaveAction(leave.id, true)}
                      className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                    >
                      <CheckCircle className="inline h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveAction(leave.id, false)}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                    >
                      <XCircle className="inline h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#7f5a6f]">
                No pending leave requests
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default AdminDashboard;
