import { useState, useEffect } from "react";
import { DollarSign, Download, FileText, TrendingUp } from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { ROUTES } from "../../config/constants";
import { useAttendance } from "../../hooks/useAttendance";
import { payrollAPI } from "../../services";
import { cn } from "../../utils/cn";

const tabs = [
  { key: "employees", label: "Employees", path: ROUTES.EMPLOYEE_DASHBOARD },
  { key: "attendance", label: "Attendance", path: ROUTES.EMPLOYEE_ATTENDANCE },
  { key: "timeoff", label: "Time Off", path: ROUTES.EMPLOYEE_TIME_OFF },
  { key: "payroll", label: "Payroll", path: "/employee/payroll" },
];

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";
const SUB_TEXT = "text-sm text-[#7f5a6f]";

const PayrollPage = () => {
  const attendance = useAttendance();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const data = await payrollAPI.getMyPayroll();
        setPayrollRecords(data);
      } catch (err) {
        console.error("Failed to fetch payroll:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const latestPayroll = payrollRecords[0];

  return (
    <WorkspaceLayout
      title="Payroll & Compensation"
      description="View your salary details, download payslips, and track compensation history."
      tabs={tabs}
      activeTab="payroll"
      statusIndicator={attendance.status}
    >
      <div className="space-y-6">
        {latestPayroll && (
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={LABEL_TONE}>Current Month</p>
                <h3 className="text-3xl font-bold text-[#2f1627]">
                  ₹{latestPayroll.net_salary?.toLocaleString() || "0"}
                </h3>
                <p className={SUB_TEXT}>
                  Net Salary for {latestPayroll.month}/{latestPayroll.year}
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-2xl bg-[#75516c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6a4a63]">
                <Download className="h-4 w-4" /> Download Payslip
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}>
                <p className={LABEL_TONE}>Gross Salary</p>
                <p className="mt-2 text-xl font-semibold text-[#2f1627]">
                  ₹{latestPayroll.gross_salary?.toLocaleString() || "0"}
                </p>
              </div>
              <div className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}>
                <p className={LABEL_TONE}>Deductions</p>
                <p className="mt-2 text-xl font-semibold text-red-600">
                  -₹{latestPayroll.deductions?.toLocaleString() || "0"}
                </p>
              </div>
              <div className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}>
                <p className={LABEL_TONE}>Tax</p>
                <p className="mt-2 text-xl font-semibold text-orange-600">
                  ₹{latestPayroll.tax?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-[#2f1627]">
            Payroll History
          </h3>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-[#fef4f7]"
                  />
                ))}
              </div>
            ) : payrollRecords.length > 0 ? (
              payrollRecords.map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    "flex items-center justify-between rounded-2xl p-4 cursor-pointer transition hover:border-[#75516c]",
                    BORDER_SOFT,
                    CHIP_BG
                  )}
                  onClick={() => setSelectedPayroll(record)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        BORDER_SOFT,
                        "bg-white"
                      )}
                    >
                      <FileText className="h-6 w-6 text-[#75516c]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2f1627]">
                        {new Date(
                          record.year,
                          record.month - 1
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-[#8b6b7e]">
                        Status: {record.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#2f1627]">
                      ₹{record.net_salary?.toLocaleString()}
                    </p>
                    <button className="mt-1 text-xs text-[#75516c] hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-sm text-[#7f5a6f]">
                No payroll records available
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default PayrollPage;
