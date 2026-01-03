import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  Plane,
  Wifi,
  CircleSlash,
  MapPin,
  Mail,
  Phone,
  Building2,
  Clock3,
} from 'lucide-react';
import WorkspaceLayout from '../../components/layout/WorkspaceLayout';
import { employees, alerts } from '../../data/mockData';
import { ROUTES } from '../../config/constants';
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

const statusTokens = {
  present: {
    label: 'Present',
    accent: 'bg-emerald-500',
    description: 'Employee is present in the office',
    icon: BadgeCheck,
    showIcon: false,
  },
  remote: {
    label: 'Remote',
    accent: 'bg-sky-500',
    description: 'Working remotely',
    icon: Wifi,
    showIcon: false,
  },
  leave: {
    label: 'On Leave',
    accent: 'bg-amber-400',
    description: 'Employee is on applied/paid leave',
    icon: Plane,
    showIcon: true,
  },
  travel: {
    label: 'Travel',
    accent: 'bg-blue-500',
    description: 'Employee is traveling',
    icon: Plane,
    showIcon: true,
  },
  absent: {
    label: 'Absent',
    accent: 'bg-yellow-400',
    description: 'Employee is absent (has not applied time off)',
    icon: CircleSlash,
    showIcon: false,
  },
};

const EmployeeDashboard = () => {
  const [query, setQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const attendance = useAttendance();

  const filteredEmployees = useMemo(() => {
    if (!query) return employees;
    return employees.filter((person) => {
      const haystack = `${person.name} ${person.jobTitle} ${person.department}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [query]);

  const sidebar = (
    <div className="space-y-6">
      <CheckInPanel {...attendance} />
      <AlertsPanel />
    </div>
  );

  return (
    <>
      <WorkspaceLayout
        title="People Pulse"
        description="Live view of who is in, on leave, or travelling across pods. Tap any card to review profile context."
        tabs={tabs}
        activeTab="employees"
        searchValue={query}
        onSearch={setQuery}
        statusIndicator={attendance.status}
        sidebar={sidebar}
        tag="Live Feed"
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} data={employee} onSelect={setSelectedEmployee} />
          ))}
        </div>
      </WorkspaceLayout>

      <EmployeeDrawer employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
    </>
  );
};

const EmployeeCard = ({ data, onSelect }) => {
  const token = statusTokens[data.status] || statusTokens.present;
  const Icon = token.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(data)}
      whileHover={{ y: -4 }}
      className="glass-panel flex flex-col items-start gap-4 p-5 text-left transition hover:border-[rgba(117,81,108,0.35)]"
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={data.avatar}
              alt={data.name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
            <div className="absolute -right-1 -top-1 flex items-center justify-center">
              {token.showIcon ? (
                <div className={cn('h-5 w-5 rounded-full border-2 border-white flex items-center justify-center', token.accent)}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
              ) : (
                <span className={cn('h-4 w-4 rounded-full border-2 border-white', token.accent)} />
              )}
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-[#2f1627] text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                {token.description}
              </div>
            </div>
          </div>
          <div>
            <p className={`${LABEL_TONE}`}>{data.department}</p>
            <h3 className="text-lg font-semibold text-[#2f1627]">{data.name}</h3>
            <p className={SUB_TEXT}>{data.jobTitle}</p>
          </div>
        </div>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-2xl border', BORDER_SOFT, CHIP_BG, 'text-[#75516c]')}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className={SUB_TEXT}>{data.statusMessage}</p>

      <div className="flex flex-wrap gap-2">
        {(data.tags || ['Employee']).map((tag) => (
          <span key={tag} className="pill text-[#75516c]">
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
};

const EmployeeDrawer = ({ employee, onClose }) => (
  <AnimatePresence>
    {employee ? (
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-xl rounded-3xl border border-[rgba(117,81,108,0.2)] bg-white p-6 shadow-2xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={employee.avatar} alt={employee.name} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <p className={LABEL_TONE}>{employee.department}</p>
                <h3 className="text-xl font-semibold text-[#2f1627]">{employee.name}</h3>
                <p className={SUB_TEXT}>{employee.jobTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[rgba(117,81,108,0.2)] px-4 py-2 text-sm text-[#75516c] hover:border-[#75516c]"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-[#2f1627] sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Phone" value={employee.phone || 'Not shared'} />
            <InfoRow icon={MapPin} label="Location" value={employee.location} />
            <InfoRow icon={Building2} label="Manager" value={employee.manager} />
            <InfoRow icon={Clock3} label="Joined" value={employee.dateJoined} />
            <InfoRow icon={BadgeCheck} label="Band" value={employee.salaryBand || 'N/A'} />
          </div>

          {employee.documents?.length ? (
            <div className="mt-6">
              <p className={LABEL_TONE}>Documents</p>
              <div className="mt-3 space-y-2">
                {employee.documents.map((doc) => (
                  <div
                    key={doc.name}
                    className={cn('flex items-center justify-between rounded-2xl px-4 py-3 text-sm', BORDER_SOFT, CHIP_BG)}
                  >
                    <div>
                      <p className="font-medium text-[#2f1627]">{doc.name}</p>
                      <p className="text-xs text-[#8d6b80]">Updated {doc.updated}</p>
                    </div>
                    <span className="text-[#75516c]">View</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className={cn('rounded-2xl p-4', BORDER_SOFT, CHIP_BG)}>
    <div className={`flex items-center gap-2 ${LABEL_TONE}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <p className="mt-2 text-sm font-medium text-[#2f1627]">{value}</p>
  </div>
);

const CheckInPanel = ({ status, checkIn, checkOut, loading, history, lastCheckIn, lastCheckOut }) => {
  const isIn = status === 'checked_in';
  return (
    <div className="glass-panel space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={LABEL_TONE}>Attendance Tray</p>
          <h4 className="text-xl font-semibold text-[#2f1627]">{isIn ? 'You are checked in' : 'You are away'}</h4>
        </div>
        <span className={cn('status-dot', isIn ? 'bg-emerald-400' : 'bg-rose-500')} />
      </div>

      <div className={cn('rounded-2xl p-4 text-sm', BORDER_SOFT, CHIP_BG, 'text-[#553347]')}>
        <p>Last check-in: {lastCheckIn ? new Date(lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
        <p>Last check-out: {lastCheckOut ? new Date(lastCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={checkIn}
          disabled={loading || isIn}
          className={cn(
            'flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition',
            isIn ? 'bg-[#fef4f7] text-[#c2a4b4]' : 'bg-[#2f9c74] text-white hover:bg-[#278363]'
          )}
        >
          Check In
        </button>
        <button
          type="button"
          onClick={checkOut}
          disabled={loading || !isIn}
          className={cn(
            'flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition',
            !isIn ? 'bg-[#fef4f7] text-[#c2a4b4]' : 'bg-[#d9546d] text-white hover:bg-[#c34b60]'
          )}
        >
          Check Out
        </button>
      </div>

      <div>
        <p className={LABEL_TONE}>Recent activity</p>
        <ul className="mt-3 space-y-2 text-sm text-[#6e4c61]">
          {history?.length ? (
            history.map((item) => (
              <li key={item.timestamp} className={cn('flex items-center justify-between rounded-2xl px-3 py-2', BORDER_SOFT)}>
                <span className="capitalize">{item.type.replace('_', ' ')}</span>
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </li>
            ))
          ) : (
            <li className="rounded-2xl border border-dashed border-[rgba(117,81,108,0.3)] px-3 py-2 text-center text-[#b28fa1]">
              No activity yet
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const AlertsPanel = () => (
  <div className="glass-panel p-6">
    <p className={LABEL_TONE}>Alerts</p>
    <div className="mt-4 space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className={cn('rounded-2xl p-4', BORDER_SOFT, CHIP_BG)}>
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-[#2f1627]">{alert.title}</p>
            <span className="text-xs text-[#a17b8f]">{alert.time}</span>
          </div>
          <p className="mt-1 text-sm text-[#7f5a6f]">{alert.body}</p>
        </div>
      ))}
    </div>
  </div>
);

export default EmployeeDashboard;
