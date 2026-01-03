import { useState } from 'react';
import { Camera, Save, ShieldCheck, Upload } from 'lucide-react';
import WorkspaceLayout from '../../components/layout/WorkspaceLayout';
import { ROUTES } from '../../config/constants';
import { profileSections } from '../../data/mockData';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const tabs = [
  { key: 'employees', label: 'Employees', path: ROUTES.EMPLOYEE_DASHBOARD },
  { key: 'attendance', label: 'Attendance', path: ROUTES.EMPLOYEE_ATTENDANCE },
  { key: 'timeoff', label: 'Time Off', path: ROUTES.EMPLOYEE_TIME_OFF },
];

const LABEL_TONE = 'text-xs uppercase tracking-[0.35em] text-[#b28fa1]';
const BORDER_SOFT = 'border-[rgba(117,81,108,0.18)]';
const CHIP_BG = 'bg-[#fef4f7]';
const SUB_TEXT = 'text-sm text-[#7f5a6f]';

const ProfilePage = () => {
  const attendance = useAttendance();
  const { user } = useAuth();
  const [activeProfileTab, setActiveProfileTab] = useState('personal');
  const [form, setForm] = useState({
    phone: profileSections.personal.phone,
    location: profileSections.personal.location,
    address: 'No. 19, Residency Road, Bengaluru',
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field, value) => {
    setIsSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'hr_officer';

  const profileTabs = [
    { key: 'personal', label: 'Resume' },
    { key: 'private', label: 'Private Info' },
    ...(isAdmin ? [{ key: 'salary', label: 'Salary Info' }] : []),
    { key: 'security', label: 'Security' },
  ];

  const sidebar = (
    <div className="glass-panel space-y-5 p-6 text-sm text-[#7f5a6f]">
      <p className={LABEL_TONE}>Access</p>
      <p>Employees can edit phone, contact address, and avatar. HR & Admin keep the rest locked.</p>
      <div className={cn('rounded-2xl p-4', BORDER_SOFT, CHIP_BG)}>
        <ShieldCheck className="h-5 w-5 text-[#2f9c74]" />
        <p className="mt-3 text-sm text-[#2f1627]">Last verified on 24 Dec 2025</p>
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      title="My Profile"
      description="Personal data, job context, and compliance docs in one calm space. Editable inputs are highlighted."
      tabs={tabs}
      activeTab={null}
      statusIndicator={attendance.status}
      sidebar={sidebar}
    >
      <div className="glass-panel p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative h-28 w-28">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full rounded-3xl object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-3xl bg-[#fef1f5] text-3xl font-semibold text-[#75516c]">
                {profileSections.personal.fullName[0]}
              </div>
            )}
            <button
              type="button"
              className="absolute -right-2 -bottom-2 inline-flex items-center gap-1 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-3 py-1 text-xs text-[#75516c]"
            >
              <Camera className="h-3.5 w-3.5" /> Update photo
            </button>
          </div>
          <div>
            <p className={LABEL_TONE}>{profileSections.job.department}</p>
            <h2 className="text-2xl font-semibold text-[#2f1627]">{profileSections.personal.fullName}</h2>
            <p className={SUB_TEXT}>{profileSections.job.title}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#75516c]">
              <span className={cn('rounded-full px-3 py-1', BORDER_SOFT)}>Employee ID {profileSections.personal.employeeId}</span>
              <span className={cn('rounded-full px-3 py-1', BORDER_SOFT)}>Joined {profileSections.job.joinedOn}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel mt-6 p-6">
        <div className="flex flex-wrap gap-2 border-b border-[rgba(117,81,108,0.18)] pb-4">
          {profileTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveProfileTab(tab.key)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-2xl transition',
                activeProfileTab === tab.key
                  ? 'text-[#2f1627] border-b-2 border-[#75516c]'
                  : 'text-[#8f6d80] hover:text-[#75516c]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeProfileTab === 'personal' && (
            <div className="space-y-4">
              <div>
                <p className={LABEL_TONE}>Contactable fields</p>
                <h3 className="text-lg font-semibold text-[#2f1627]">You can edit these</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <EditableField label="Phone" value={form.phone} onChange={(value) => handleChange('phone', value)} />
                <EditableField label="Workspace" value={form.location} onChange={(value) => handleChange('location', value)} />
              </div>
              <EditableField label="Address" value={form.address} onChange={(value) => handleChange('address', value)} multiline />
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-2 text-sm text-[#75516c]"
              >
                <Save className="h-4 w-4" /> Save changes
              </button>
              {isSaved ? (
                <p className="text-xs uppercase tracking-[0.4em] text-[#2f9c74]">Saved locally</p>
              ) : null}
            </div>
          )}

          {activeProfileTab === 'private' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className={LABEL_TONE}>Job outlines</p>
                <div className="mt-3 space-y-3 text-sm text-[#2f1627]">
                  {Object.entries(profileSections.job).map(([key, value]) => (
                    <div key={key} className={cn('rounded-2xl px-4 py-3', BORDER_SOFT, CHIP_BG)}>
                      <p className={LABEL_TONE}>{key}</p>
                      <p className="mt-1 text-sm text-[#2f1627]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className={LABEL_TONE}>Documents</p>
                <div className="mt-3 space-y-3">
                  {profileSections.documents.map((doc) => (
                    <div key={doc.name} className={cn('flex items-center justify-between rounded-2xl px-4 py-3 text-sm', BORDER_SOFT, CHIP_BG)}>
                      <div>
                        <p className="font-semibold text-[#2f1627]">{doc.name}</p>
                        <p className="text-xs text-[#8b6b7e]">{doc.updated}</p>
                      </div>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', doc.status === 'Verified' ? 'border border-[#b5e1cd] text-[#2f9c74]' : 'border border-[#f0c59c] text-[#d47f2f]')}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,81,108,0.35)] px-4 py-3 text-sm text-[#75516c]"
                  >
                    <Upload className="h-4 w-4" /> Upload new document
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeProfileTab === 'salary' && isAdmin && (
            <div className="space-y-4">
              <p className={LABEL_TONE}>Salary Information (Admin Only)</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={cn('rounded-2xl p-4', BORDER_SOFT, CHIP_BG)}>
                  <p className={LABEL_TONE}>Month Wage</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2f1627]">₹50,000</p>
                  <p className={SUB_TEXT}>Per month</p>
                </div>
                <div className={cn('rounded-2xl p-4', BORDER_SOFT, CHIP_BG)}>
                  <p className={LABEL_TONE}>Yearly wage</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2f1627]">₹6,00,000</p>
                  <p className={SUB_TEXT}>Per year</p>
                </div>
              </div>
              <div>
                <p className={LABEL_TONE}>Salary Components</p>
                <div className="mt-3 space-y-3">
                  {[
                    { label: 'Basic Salary', value: '₹28000.00', percent: '56.0 %' },
                    { label: 'House Rent Allowance', value: '₹14000.00', percent: '28.0 %' },
                    { label: 'Standard Allowance', value: '₹5000.00', percent: '10.0 %' },
                    { label: 'Performance Bonus', value: '₹3000.00', percent: '6.0 %' },
                  ].map((comp) => (
                    <div key={comp.label} className={cn('flex items-center justify-between rounded-2xl px-4 py-3', BORDER_SOFT, CHIP_BG)}>
                      <div>
                        <p className="font-semibold text-[#2f1627]">{comp.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#2f1627]">{comp.value}</p>
                        <p className={SUB_TEXT}>{comp.percent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeProfileTab === 'security' && (
            <div>
              <p className={LABEL_TONE}>Security Settings</p>
              <p className={SUB_TEXT + ' mt-2'}>Manage your account security preferences</p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-3 text-left text-sm text-[#2f1627] hover:bg-[#f8edf1]"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-3 text-left text-sm text-[#2f1627] hover:bg-[#f8edf1]"
                >
                  Two-Factor Authentication
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
};

const EditableField = ({ label, value, onChange, multiline = false }) => (
  <label className="block space-y-2 text-sm text-[#2f1627]">
    <span className={LABEL_TONE}>{label}</span>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm"
      />
    ) : (
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm"
      />
    )}
  </label>
);

export default ProfilePage;
