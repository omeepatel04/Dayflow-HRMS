import { useMemo, useState } from 'react';
import { CalendarDays, Plus, MessageCircle } from 'lucide-react';
import WorkspaceLayout from '../../components/layout/WorkspaceLayout';
import { ROUTES } from '../../config/constants';
import { leaveRequests, timeOffBalance } from '../../data/mockData';
import { useAttendance } from '../../hooks/useAttendance';
import { cn } from '../../utils/cn';

const tabs = [
  { key: 'employees', label: 'Employees', path: ROUTES.EMPLOYEE_DASHBOARD },
  { key: 'attendance', label: 'Attendance', path: ROUTES.EMPLOYEE_ATTENDANCE },
  { key: 'timeoff', label: 'Time Off', path: ROUTES.EMPLOYEE_TIME_OFF },
];

const LABEL_TONE = 'text-xs uppercase tracking-[0.35em] text-[#b28fa1]';
const BORDER_SOFT = 'border-[rgba(117,81,108,0.18)]';
const CHIP_BG = 'bg-[#fef4f7]';
const BODY_TEXT = 'text-[#2f1627]';
const SUB_TEXT = 'text-sm text-[#7f5a6f]';

const TimeOffPage = () => {
  const attendance = useAttendance();
  const [requests, setRequests] = useState(leaveRequests);
  const [form, setForm] = useState({ type: 'Paid Leave', startDate: '', endDate: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const computedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const delta = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, delta + 1);
  }, [form.startDate, form.endDate]);

  const balanceEntries = useMemo(() => (
    [
      { key: 'paid', label: 'Paid Leave', gradient: 'from-[#f6cbdc] to-[#dfa7be]' },
      { key: 'sick', label: 'Sick Leave', gradient: 'from-[#f9dfc5] to-[#f2c4a2]' },
      { key: 'unpaid', label: 'Unpaid Leave', gradient: 'from-[#efdbf7] to-[#d8b4e5]' },
    ].map((item) => ({
      ...item,
      total: timeOffBalance[item.key].total,
      used: timeOffBalance[item.key].used,
    }))
  ), []);

  const pendingRequests = requests.filter((req) => req.status === 'pending');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.startDate || !form.endDate) return;
    setSubmitting(true);
    const payload = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      employeeId: 'DF-091',
      employeeName: 'Maya Dsouza',
      status: 'pending',
      ...form,
      days: computedDays || 1,
    };

    setTimeout(() => {
      setRequests((prev) => [payload, ...prev]);
      setForm({ type: 'Paid Leave', startDate: '', endDate: '', remarks: '' });
      setSubmitting(false);
    }, 500);
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
      tabs={tabs}
      activeTab="timeoff"
      sidebar={sidebar}
      statusIndicator={attendance.status}
      toolbar={
        <button type="button" className="flex items-center gap-2 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-2 text-sm text-[#75516c]">
          <MessageCircle className="h-4 w-4" /> Chat with HR
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)]">
        <div className="grid gap-4 md:grid-cols-3">
          {balanceEntries.map((item) => (
            <BalanceCard key={item.key} data={item} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-panel space-y-4 p-6">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[#b28fa1]" />
            <div>
              <p className={LABEL_TONE}>Apply for leave</p>
              <h3 className="text-lg font-semibold text-[#2f1627]">Create a new request</h3>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Leave Type">
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              >
                <option value="Paid Leave">Paid Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </Field>
            <Field label="Days">
              <div className={cn('rounded-2xl px-3 py-3 text-sm text-[#2f1627]', BORDER_SOFT, CHIP_BG)}>
                {form.startDate && form.endDate
                  ? `${form.startDate} -> ${form.endDate} (${computedDays || 1} days)`
                  : 'Select dates'}
              </div>
            </Field>
            <Field label="Start Date">
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              />
            </Field>
          </div>
          <Field label="Notes for approver">
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
              className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm text-[#2f1627]"
              placeholder="Context, handoffs, escalation details"
            />
          </Field>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#75516c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6a4a63]"
            >
              <Plus className="h-4 w-4" /> Submit Request
            </button>
          </div>
        </form>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={LABEL_TONE}>History</p>
              <h3 className="text-lg font-semibold text-[#2f1627]">Recent leave requests</h3>
            </div>
            <span className={cn('rounded-full px-3 py-1 text-xs text-[#75516c]', BORDER_SOFT)}>{requests.length} entries</span>
          </div>
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
                <div key={request.id} className={cn('flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm', BORDER_SOFT, CHIP_BG)}>
                <div className="flex-1">
                  <p className="font-semibold text-[#2f1627]">{request.type}</p>
                  <p className="text-xs text-[#8b6b7e]">
                      {request.startDate}
                      {' -> '}
                      {request.endDate}
                      {' '}
                      ({request.days} days)
                  </p>
                </div>
                <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', badgeTone[request.status] || 'border border-[rgba(117,81,108,0.2)] text-[#75516c]')}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

const badgeTone = {
  pending: 'bg-[#fff3e6] text-[#d47f2f] border border-[#f0c59c]',
  approved: 'bg-[#e6f5ef] text-[#2f9c74] border border-[#b5e1cd]',
  rejected: 'bg-[#ffe8ed] text-[#d9546d] border border-[#f5bac8]',
};

const BalanceCard = ({ data }) => (
  <div className={cn('rounded-3xl border border-transparent bg-gradient-to-br p-5 text-[#2f1627] shadow-xl', data.gradient)}>
    <p className={LABEL_TONE}>{data.label}</p>
    <p className="mt-3 text-3xl font-semibold">{data.total - data.used}<span className="text-base text-[#7f5a6f]"> days left</span></p>
    <p className={SUB_TEXT}>{data.used} used of {data.total}</p>
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
          <div key={req.id} className={cn('rounded-2xl px-4 py-3', BORDER_SOFT, CHIP_BG)}>
            <p className="font-semibold text-[#2f1627]">{req.type}</p>
            <p className="text-xs text-[#8b6b7e]">
              {req.startDate}
              {' -> '}
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
