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
import { dashboardAPI, leavesAPI, attendanceAPI } from "../../services";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../config/constants";

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardData, leavesResponse] = await Promise.all([
        dashboardAPI.getHRDashboard(),
        leavesAPI.getAllLeaves({ status: "pending" }),
      ]);

      // Set stats from API
      setStats({
        total_employees: dashboardData.employees?.total || 0,
        present_today: dashboardData.attendance?.present_today || 0,
        on_leave_today: dashboardData.attendance?.on_leave_today || 0,
        pending_leaves: dashboardData.leaves?.pending_count || 0,
      });

      // Backend returns { count, leaves }, extract leaves array
      const leavesData = leavesResponse?.leaves || leavesResponse || [];
      setPendingLeaves(leavesData.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
      setStats(null);
      setPendingLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, isApproved) => {
    try {
      await leavesAPI.approveLeave(id, {
        status: isApproved ? "APPROVED" : "REJECTED",
        admin_comment: isApproved ? "Approved" : "Rejected",
      });
      // Optimistically update UI
      setPendingLeaves((prev) => prev.filter((leave) => leave.id !== id));
      // Refresh full dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to update leave:", err);
      alert("Failed to update leave request. Please try again.");
      // Refresh to show correct state
      await fetchDashboardData();
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
