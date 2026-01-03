import { useEffect, useState } from "react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { ROUTES } from "../../config/constants";
import { useAttendance } from "../../hooks/useAttendance";
import { attendanceAPI } from "../../services";
import { cn } from "../../utils/cn";

const tabs = [
  { key: "employees", label: "Employees", path: ROUTES.EMPLOYEE_DASHBOARD },
  { key: "attendance", label: "Attendance", path: ROUTES.EMPLOYEE_ATTENDANCE },
  { key: "timeoff", label: "Time Off", path: ROUTES.EMPLOYEE_TIME_OFF },
];

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";
const SUB_TEXT = "text-sm text-[#7f5a6f]";

const AttendancePage = () => {
  const attendance = useAttendance();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState({
    presentRate: "0%",
    avgHours: "0h 0m",
    absences: "0 days",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);

        // Fetch last 7 days of attendance
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const records = await attendanceAPI.getMyAttendance({
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        });

        // Transform records to UI format
        const transformedRecords = records.map((record) => {
          const date = new Date(record.date);
          const status = record.check_out_time
            ? "present"
            : record.is_late
            ? "half_day"
            : "present";

          return {
            id: record.id,
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            status,
            note: record.notes || (record.is_late ? "Late arrival" : "On time"),
            checkIn: record.check_in_time
              ? new Date(record.check_in_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
            checkOut: record.check_out_time
              ? new Date(record.check_out_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
          };
        });

        setAttendanceRecords(transformedRecords);

        // Fetch monthly summary
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthlySummary = await attendanceAPI.getMonthlySummary({
          month: currentMonth,
          year: currentYear,
        });

        // Calculate summary metrics
        const totalDays = monthlySummary.total_days || 1;
        const presentDays = monthlySummary.present_days || 0;
        const presentRate = ((presentDays / totalDays) * 100).toFixed(0);

        const avgMinutes = monthlySummary.avg_working_hours || 0;
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = Math.round(avgMinutes % 60);

        setSummary({
          presentRate: `${presentRate}%`,
          avgHours: `${avgHours}h ${avgMins}m`,
          absences: `${monthlySummary.absent_days || 0} days`,
        });
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const summaryCards = [
    {
      label: "Present Rate",
      value: summary.presentRate,
      detail: "Last 30 days",
    },
    {
      label: "Average Hours",
      value: summary.avgHours,
      detail: "Per working day",
    },
    { label: "Absences", value: summary.absences, detail: "Rolling 60 days" },
  ];

  const sidebar = (
    <LegendPanel state={attendance.status} history={attendance.history || []} />
  );

  return (
    <WorkspaceLayout
      title="Attendance & Visibility"
      description="Track your weekly rhythm, verify hours, and ensure payroll accuracy before every cycle."
      tabs={tabs}
      activeTab="attendance"
      sidebar={sidebar}
      statusIndicator={attendance.status}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((item) => (
            <div key={item.label} className="glass-panel p-5">
              <p className={LABEL_TONE}>{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#2f1627]">
                {item.value}
              </p>
              <p className={SUB_TEXT}>{item.detail}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="glass-panel p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse bg-[#fef4f7] rounded-2xl"
                />
              ))}
            </div>
          </div>
        ) : (
          <AttendanceTable records={attendanceRecords} />
        )}
      </div>
    </WorkspaceLayout>
  );
};

const AttendanceTable = ({ records = [] }) => (
  <div className="glass-panel overflow-hidden">
    <div
      className={cn("flex items-center justify-between px-6 py-4", BORDER_SOFT)}
    >
      <div>
        <p className={LABEL_TONE}>This Week</p>
        <h3 className="text-lg font-semibold text-[#2f1627]">Daily entries</h3>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs text-[#75516c]",
          BORDER_SOFT
        )}
      >
        Auto-synced
      </span>
    </div>
    <div className="divide-y divide-[rgba(117,81,108,0.1)]">
      {records.length > 0 ? (
        records.map((record) => (
          <div
            key={record.id}
            className="grid grid-cols-[80px_minmax(0,1fr)_140px_140px] gap-4 px-6 py-4 text-sm text-[#2f1627] max-sm:grid-cols-2 max-sm:text-xs"
          >
            <div>
              <p className="font-semibold text-[#2f1627]">{record.day}</p>
              <p className="text-[#9d7a8d]">{record.date}</p>
            </div>
            <StatusBadge status={record.status} note={record.note} />
            <TimeCell label="In" value={record.checkIn} />
            <TimeCell label="Out" value={record.checkOut} />
          </div>
        ))
      ) : (
        <div className="px-6 py-12 text-center text-sm text-[#7f5a6f]">
          No attendance records for this period
        </div>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status, note }) => {
  const tone = {
    present: "bg-emerald-500/10 text-emerald-300 border-emerald-400/40",
    leave: "bg-amber-500/10 text-amber-300 border-amber-400/40",
    half_day: "bg-sky-500/10 text-sky-300 border-sky-400/40",
  };

  const labelMap = {
    present: "Present",
    leave: "On Leave",
    half_day: "Half Day",
  };

  return (
    <div className="space-y-1">
      <span
        className={cn(
          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
          tone[status] || tone.present
        )}
      >
        {labelMap[status] || status}
      </span>
      <p className="text-xs text-[#8b6b7e]">{note}</p>
    </div>
  );
};

const TimeCell = ({ label, value }) => (
  <div>
    <p className={LABEL_TONE}>{label}</p>
    <p className="mt-1 text-sm font-medium text-[#2f1627]">{value}</p>
  </div>
);

const LegendPanel = ({ state, history = [] }) => (
  <div className="glass-panel space-y-5 p-6">
    <p className={LABEL_TONE}>Status Legend</p>
    <div className="space-y-3 text-sm text-[#7f5a6f]">
      {[
        {
          label: "Present",
          color: "bg-emerald-400",
          desc: "Checked-in and within shift window",
        },
        {
          label: "On Leave",
          color: "bg-amber-400",
          desc: "Approved leave, no alerts",
        },
        {
          label: "Half Day",
          color: "bg-sky-400",
          desc: "Shorter shift or desk move",
        },
        { label: "Absent", color: "bg-rose-500", desc: "Unplanned time off" },
      ].map((legend) => (
        <div
          key={legend.label}
          className={cn("flex gap-3 rounded-2xl p-3", BORDER_SOFT, CHIP_BG)}
        >
          <span className={cn("status-dot flex-none", legend.color)} />
          <div>
            <p className="font-semibold text-[#2f1627]">{legend.label}</p>
            <p className="text-xs text-[#8d6c80]">{legend.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <div>
      <p className={LABEL_TONE}>Your streak</p>
      <p className="mt-2 text-3xl font-semibold text-[#2f1627]">
        {state === "checked_in" ? "Active" : "4 days"}
      </p>
      <div className="mt-3 space-y-2 text-xs text-[#8d6c80]">
        {history.slice(0, 4).map((item) => (
          <div
            key={item.timestamp}
            className={cn(
              "flex items-center justify-between rounded-2xl px-3 py-2",
              BORDER_SOFT
            )}
          >
            <span className="capitalize">{item.type.replace("_", " ")}</span>
            <span>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AttendancePage;
