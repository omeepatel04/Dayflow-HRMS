import { useState, useEffect } from "react";
import { leavesAPI } from "../../services";
import { CheckCircle, XCircle, Calendar, User } from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { cn } from "../../utils/cn";

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = filter === "all" ? {} : { status: filter };
      const response = await leavesAPI.getAllLeaves(params);
      // Backend returns { count, leaves }, extract leaves array
      const leavesData = response?.leaves || response || [];
      setLeaves(leavesData);
      setError("");
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      setLeaves([]);
      setError("Failed to load leave requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, isApproved) => {
    try {
      setLoading(true);
      await leavesAPI.approveLeave(id, {
        status: isApproved ? "APPROVED" : "REJECTED",
        admin_comment: isApproved ? "Approved" : "Rejected",
      });
      // Refetch data to get updated list
      await fetchLeaves();
    } catch (err) {
      console.error("Failed to update leave:", err);
      alert("Failed to update leave request. Please try again.");
    } finally {
      setLoading(false);
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
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedLeave(leave)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedLeave(leave);
                    }
                  }}
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
                          disabled={loading}
                          className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <CheckCircle className="inline h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, false)}
                          disabled={loading}
                          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

        {selectedLeave ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[rgba(117,81,108,0.2)] px-6 py-4">
                <div>
                  <p className={LABEL_TONE}>Leave request</p>
                  <h3 className="text-lg font-semibold text-[#2f1627]">
                    {selectedLeave.employee_name || "Employee"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="text-sm text-[#75516c] hover:text-[#4a2a39]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3 px-6 py-4 text-sm text-[#2f1627]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#b28fa1]" />
                  <span>{selectedLeave.employee_id || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#b28fa1]" />
                  <span>
                    {selectedLeave.start_date} to {selectedLeave.end_date} •{" "}
                    {selectedLeave.days_requested} days
                  </span>
                </div>
                <div>
                  <p className={LABEL_TONE}>Type</p>
                  <p className="font-semibold capitalize text-[#2f1627]">
                    {selectedLeave.leave_type?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className={LABEL_TONE}>Reason</p>
                  <p className="text-[#7f5a6f]">
                    {selectedLeave.reason || "—"}
                  </p>
                </div>
                <div>
                  <p className={LABEL_TONE}>Status</p>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                      getStatusColor(selectedLeave.status)
                    )}
                  >
                    {selectedLeave.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </WorkspaceLayout>
  );
};

export default LeaveManagement;
