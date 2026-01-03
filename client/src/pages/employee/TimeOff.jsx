import { useMemo, useState, useEffect } from "react";
import { CalendarDays, Plus, MessageCircle } from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { EMPLOYEE_TABS } from "../../config/navigation";
import { useAttendance } from "../../hooks/useAttendance";
import { leavesAPI } from "../../services";
import { cn } from "../../utils/cn";
import { useToast } from "../../components/Toast";

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";
const BODY_TEXT = "text-[#2f1627]";
const SUB_TEXT = "text-sm text-[#7f5a6f]";

const TimeOffPage = () => {
  const attendance = useAttendance();
  const [requests, setRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casual: 0,
    sick: 0,
    unpaid: 0,
  });
  const [form, setForm] = useState({
    type: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  const computedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const delta = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, delta + 1);
  }, [form.startDate, form.endDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const leavesResponse = await leavesAPI.getMyLeaves();
        // Backend returns { count, leaves }, extract leaves array
        const leavesData = leavesResponse?.leaves || leavesResponse || [];

        const normalized = leavesData.map((leave) => ({
          id: leave.id,
          type: leave.leave_type,
          startDate: leave.start_date,
          endDate: leave.end_date,
          days: leave.days_requested,
          status: leave.status?.toLowerCase(),
          remarks: leave.reason,
        }));

        setRequests(normalized);

        const balance = normalized.reduce(
          (acc, leave) => {
            if (leave.status !== "approved") return acc;
            const key = leave.type?.toLowerCase();
            if (key && acc[key] !== undefined) {
              acc[key] += leave.days || 0;
            }
            return acc;
          },
          { casual: 0, sick: 0, unpaid: 0 }
        );

        setLeaveBalance(balance);
      } catch (err) {
        console.error("Failed to fetch leaves:", err);
        setError("Unable to load leave data.");
        pushToast({
          title: "Leave data unavailable",
          description: "We could not refresh your leave history.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const balanceEntries = useMemo(
    () => [
      {
        key: "casual",
        label: "Casual Leave",
        gradient: "from-pink-200 to-pink-300",
        total: 12,
        used: leaveBalance.casual,
      },
      {
        key: "sick",
        label: "Sick Leave",
        gradient: "from-orange-200 to-orange-300",
        total: 7,
        used: leaveBalance.sick,
      },
      {
        key: "unpaid",
        label: "Unpaid Leave",
        gradient: "from-purple-200 to-purple-300",
        total: 0,
        used: leaveBalance.unpaid,
      },
    ],
    [leaveBalance]
  );

  const pendingRequests = requests.filter((req) => req.status === "pending");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.startDate || !form.endDate) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await leavesAPI.applyLeave({
        leave_type: form.type,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason,
      });

      setRequests((prev) => [
        {
          id: result.id,
          type: result.leave_type,
          startDate: result.start_date,
          endDate: result.end_date,
          days: result.days_requested,
          status: "pending",
          remarks: result.reason,
        },
        ...prev,
      ]);

      setForm({ type: "CASUAL", startDate: "", endDate: "", reason: "" });
      pushToast({
        title: "Leave request submitted",
        description: "We sent this to your manager.",
        variant: "success",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request");
      pushToast({
        title: "Leave request failed",
        description: err.response?.data?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sidebar = (
    <div className="space-y-6">
      <PolicyCard />
      <PendingCard items={pendingRequests} />
    </div>
  );

  return (
    <WorkspaceLayout
      title="Leave & Time-off"
      description="Stay on top of balances, plan your breaks, and keep managers in the loop with context-rich requests."
      tabs={EMPLOYEE_TABS}
      activeTab="timeoff"
      sidebar={sidebar}
      statusIndicator={attendance.status}
      toolbar={
        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-2 text-sm text-[#75516c]"
        >
          <MessageCircle className="h-4 w-4" /> Chat with HR
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {balanceEntries.map((item) => (
            <BalanceCard key={item.key} data={item} />
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel space-y-4 p-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[#b28fa1]" />
            <div>
              <p className={LABEL_TONE}>Apply for leave</p>
              <h3 className="text-lg font-semibold text-[#2f1627]">
                Create a new request
              </h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Leave Type">
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value }))
                }
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="PATERNITY">Paternity Leave</option>
              </select>
            </Field>
            <Field label="Days">
              <div
                className={cn(
                  "rounded-2xl px-3 py-3 text-sm text-[#2f1627]",
                  BORDER_SOFT,
                  CHIP_BG
                )}
              >
                {form.startDate && form.endDate
                  ? `${form.startDate} -> ${form.endDate} (${
                      computedDays || 1
                    } days)`
                  : "Select dates"}
              </div>
            </Field>
            <Field label="Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endDate: event.target.value }))
                }
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              />
            </Field>
          </div>
          <Field label="Notes for approver">
            <textarea
              rows={3}
              value={form.reason}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reason: event.target.value }))
              }
              className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              placeholder="Context, handoffs, escalation details"
              required
            />
          </Field>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#75516c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6a4a63] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />{" "}
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={LABEL_TONE}>History</p>
              <h3 className="text-lg font-semibold text-[#2f1627]">
                Recent leave requests
              </h3>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs text-[#75516c]",
                BORDER_SOFT
              )}
            >
              {requests.length} entries
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-sm text-[#7f5a6f]">
                Loading...
              </div>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={
                    request.id ||
                    `${request.startDate}-${request.endDate}-${request.type}`
                  }
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm",
                    BORDER_SOFT,
                    CHIP_BG
                  )}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#2f1627]">
                      {request.type}
                    </p>
                    <p className="text-xs text-[#8b6b7e]">
                      {request.startDate}
                      {" -> "}
                      {request.endDate} ({request.days} days)
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      badgeTone[request.status] ||
                        "border border-[rgba(117,81,108,0.2)] text-[#75516c]"
                    )}
                  >
                    {request.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-[#7f5a6f]">
                No leave requests yet
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

const badgeTone = {
  pending: "bg-[#fff3e6] text-[#d47f2f] border border-[#f0c59c]",
  approved: "bg-[#e6f5ef] text-[#2f9c74] border border-[#b5e1cd]",
  rejected: "bg-[#ffe8ed] text-[#d9546d] border border-[#f5bac8]",
};

const BalanceCard = ({ data }) => (
  <div
    className={cn(
      "rounded-3xl border border-transparent p-5 text-[#2f1627] shadow-xl",
      `bg-gradient-to-br ${data.gradient}`
    )}
  >
    <p className={LABEL_TONE}>{data.label}</p>
    <p className="mt-3 text-3xl font-semibold">
      {data.total - data.used}
      <span className="text-base text-[#7f5a6f]"> days left</span>
    </p>
    <p className={SUB_TEXT}>
      {data.used} used of {data.total}
    </p>
  </div>
);

const Field = ({ label, children }) => (
  <label className="space-y-2 text-sm">
    <span className={LABEL_TONE}>{label}</span>
    {children}
  </label>
);

const PolicyCard = () => (
  <div className="glass-panel space-y-4 p-6 text-sm text-[#7f5a6f]">
    <p className={LABEL_TONE}>Guidelines</p>
    <ul className="space-y-2">
      <li>- Notify manager on Slack before applying for same-day leave.</li>
      <li>- Attach doctor note for sick leave beyond 2 days.</li>
      <li>- Payroll locks on 25th, plan time-off accordingly.</li>
    </ul>
  </div>
);

const PendingCard = ({ items }) => (
  <div className="glass-panel space-y-4 p-6">
    <p className={LABEL_TONE}>Awaiting approval</p>
    {items.length ? (
      <div className="space-y-3 text-sm text-[#7f5a6f]">
        {items.map((req) => (
          <div
            key={req.id || `${req.startDate}-${req.endDate}-${req.type}`}
            className={cn("rounded-2xl px-4 py-3", BORDER_SOFT, CHIP_BG)}
          >
            <p className="font-semibold text-[#2f1627]">{req.type}</p>
            <p className="text-xs text-[#8b6b7e]">
              {req.startDate}
              {" -> "}
              {req.endDate}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-[#8b6b7e]">No pending requests</p>
    )}
  </div>
);

export default TimeOffPage;
