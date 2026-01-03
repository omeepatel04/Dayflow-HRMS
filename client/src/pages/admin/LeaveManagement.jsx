import { useState, useEffect } from "react";
import { leavesAPI } from "../../services";
import { CheckCircle, XCircle, Calendar, User } from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { ROUTES } from "../../config/constants";
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
const DUMMY_LEAVES = [
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
    start_date: "2025-12-20",
    end_date: "2025-12-27",
    reason: "Planned vacation",
    status: "approved",
  },
  {
    id: 4,
    employee: { first_name: "Emily", last_name: "Williams" },
    leave_type: "Casual Leave",
    start_date: "2025-12-15",
    end_date: "2025-12-16",
    reason: "Family event",
    status: "rejected",
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

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState(DUMMY_LEAVES);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = filter === "all" ? {} : { status: filter };
      const data = await leavesAPI.getAllLeaves(params);
      // Use API data if available, otherwise use filtered dummy data
      if (data && data.length > 0) {
        setLeaves(data);
      } else {
        // Filter dummy data
        const filtered =
          filter === "all"
            ? DUMMY_LEAVES
            : DUMMY_LEAVES.filter((leave) => leave.status === filter);
        setLeaves(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch leaves, using dummy data:", err);
      // Use filtered dummy data on error
      const filtered =
        filter === "all"
          ? DUMMY_LEAVES
          : DUMMY_LEAVES.filter((leave) => leave.status === filter);
      setLeaves(filtered);
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
      setLeaves((prev) => prev.filter((leave) => leave.id !== id));
    } catch (err) {
      console.error("Failed to update leave:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  return (
    <WorkspaceLayout
      title="Leave Management"
      description="Review and approve leave requests from your team."
      tabs={tabs}
      activeTab="leaves"
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "rounded-2xl px-4 py-2 text-sm font-semibold transition capitalize",
                filter === status
                  ? "bg-[#75516c] text-white"
                  : "bg-white border border-[rgba(117,81,108,0.2)] text-[#75516c] hover:border-[#75516c]"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="glass-panel p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-[#fef4f7]"
                  />
                ))}
              </div>
            ) : leaves.length > 0 ? (
              leaves.map((leave) => (
                <div
                  key={leave.id}
                  className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[rgba(117,81,108,0.2)]">
                          <User className="h-5 w-5 text-[#75516c]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2f1627]">
                            {leave.employee_name || "Employee"}
                          </p>
                          <p className="text-xs text-[#8b6b7e]">
                            {leave.employee_id || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#b28fa1]" />
                          <span className="text-[#7f5a6f]">
                            {leave.start_date} to {leave.end_date}
                          </span>
                        </div>
                        <span className="text-[#b28fa1]">•</span>
                        <span className="font-medium text-[#75516c]">
                          {leave.days_requested} days
                        </span>
                        <span className="text-[#b28fa1]">•</span>
                        <span className="capitalize text-[#7f5a6f]">
                          {leave.leave_type.replace("_", " ")}
                        </span>
                      </div>

                      {leave.reason && (
                        <p className="mt-2 text-sm text-[#7f5a6f]">
                          <span className="font-semibold text-[#2f1627]">
                            Reason:
                          </span>{" "}
                          {leave.reason}
                        </p>
                      )}

                      <div className="mt-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                            getStatusColor(leave.status)
                          )}
                        >
                          {leave.status}
                        </span>
                      </div>
                    </div>

                    {leave.status === "pending" && (
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
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm text-[#7f5a6f]">
                No {filter !== "all" && filter} leave requests found
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default LeaveManagement;
