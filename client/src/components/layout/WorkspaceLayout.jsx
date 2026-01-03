import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Circle,
  Search,
  Sparkles,
  ChevronDown,
  User2,
  LogOut,
  Settings,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';

const statusAccent = {
  checked_in: 'bg-emerald-400',
  present: 'bg-emerald-400',
  checked_out: 'bg-rose-500',
  on_leave: 'bg-amber-400',
  remote: 'bg-sky-400',
  default: 'bg-slate-500',
};

const indicatorLabel = {
  checked_in: 'Checked In',
  present: 'Present',
  checked_out: 'Checked Out',
  on_leave: 'On Leave',
  remote: 'Remote',
};

const WorkspaceLayout = ({
  title,
  description,
  tabs = [],
  activeTab,
  children,
  sidebar,
  searchPlaceholder = 'Search people, pods, skills',
  searchValue,
  onSearch,
  statusIndicator = 'checked_out',
  tag,
  toolbar,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const indicator = statusAccent[statusIndicator] || statusAccent.default;
  const indicatorText = indicatorLabel[statusIndicator] || 'Offline';

  const profileInitials = useMemo(() => {
    if (!user?.name) return 'DF';
    return user.name
      .split(' ')
      .map((token) => token[0])
      .slice(0, 2)
      .join('');
  }, [user?.name]);

  const handleTab = (path) => {
    if (path) navigate(path);
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate(ROUTES.EMPLOYEE_PROFILE);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen px-4 py-10 text-[#2f1a2c] sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="absolute inset-x-0 -top-16 h-72 rounded-[40px] bg-gradient-to-r from-[#f5cfe0]/70 via-white to-[#f7e5ec]/60 blur-3xl" />
        <div className="absolute -right-24 top-16 h-40 w-40 rounded-full bg-[#f3d4e2] blur-[90px]" />
        <div className="relative z-10 overflow-hidden rounded-[32px] border border-[rgba(117,81,108,0.18)] bg-white/90 shadow-[0_25px_65px_rgba(117,81,108,0.14)] backdrop-blur-xl">
          <div className="border-b border-[rgba(117,81,108,0.16)] px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-3 py-2 text-left transition hover:border-[rgba(117,81,108,0.35)]"
                  aria-label="Go to dashboard home"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4d4df] via-[#e3b7c8] to-[#c08ea7] text-lg font-semibold text-[#5c2d44]">
                    DF
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#9c7d90]">Dayflow</p>
                    <p className="text-sm font-semibold text-[#3b1f2f]">HR Workbench</p>
                  </div>
                </button>
                {tabs?.length ? (
                  <nav className="hidden flex-1 items-center rounded-[999px] border border-[rgba(117,81,108,0.2)] bg-white/70 p-1 sm:flex">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => handleTab(tab.path)}
                        className={cn(
                          'flex-1 rounded-full px-4 py-2 text-sm font-medium transition',
                          activeTab === tab.key
                            ? 'bg-[#75516c] text-white shadow-[0_12px_20px_rgba(117,81,108,0.25)]'
                            : 'text-[#75516c]/70 hover:text-[#75516c]'
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                    <div className="ml-2 hidden items-center gap-2 rounded-full border border-dashed border-[rgba(117,81,108,0.35)] px-3 py-1 text-xs uppercase tracking-wide text-[#75516c] lg:flex">
                      <Sparkles className="h-4 w-4 text-[#d47f2f]" />
                      New
                    </div>
                  </nav>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center rounded-2xl border border-[rgba(117,81,108,0.18)] bg-[#fff8fb] px-3 py-2 sm:flex">
                  <Search className="mr-2 h-4 w-4 text-[#b28fa1]" />
                  <input
                    value={searchValue}
                    onChange={(event) => onSearch?.(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-48 bg-transparent text-sm text-[#3b1f2f] placeholder:text-[#b28fa1] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-full border border-[rgba(117,81,108,0.2)] bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-[#75516c]">
                  <span className={cn('status-dot', indicator)} />
                  {indicatorText}
                </div>

                <button
                  type="button"
                  className="relative rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/70 p-2 text-[#75516c] transition hover:border-[rgba(117,81,108,0.35)]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-3 w-3 rounded-full bg-[#d9546d]" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-2 py-1"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-9 w-9 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f7e5ec] text-sm font-semibold text-[#75516c]">
                        {profileInitials}
                      </div>
                    )}
                    <div className="hidden text-left sm:block">
                      <p className="text-xs uppercase tracking-widest text-[#b28fa1]">Now logged in</p>
                      <p className="text-sm font-semibold text-[#3b1f2f]">{user?.name || 'Guest'}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#b28fa1]" />
                  </button>

                  {menuOpen ? (
                    <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white p-2 shadow-2xl">
                      <button
                        type="button"
                        onClick={handleProfile}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#4a2a39] hover:bg-[#f8edf1]"
                      >
                        <User2 className="h-4 w-4" /> My Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#d9546d] hover:bg-[#ffe8ed]"
                      >
                        <LogOut className="h-4 w-4" /> Log Out
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {tabs?.length ? (
              <div className="mt-4 flex gap-2 overflow-x-auto sm:hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTab(tab.path)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#75516c]/80',
                      activeTab === tab.key ? 'border-[#75516c] text-[#75516c]' : 'border-[rgba(117,81,108,0.2)]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}

            {onSearch ? (
              <div className="mt-4 sm:hidden">
                <div className="flex items-center rounded-2xl border border-[rgba(117,81,108,0.18)] bg-[#fff8fb] px-3 py-2">
                  <Search className="mr-2 h-4 w-4 text-[#b28fa1]" />
                  <input
                    value={searchValue}
                    onChange={(event) => onSearch?.(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm text-[#3b1f2f] placeholder:text-[#b28fa1] focus:outline-none"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                {tag ? (
                  <span className="pill bg-[#fdf1f5] text-[#75516c]">{tag}</span>
                ) : null}
                {title ? <h1 className="mt-3 text-2xl font-semibold text-[#2f1627] md:text-3xl">{title}</h1> : null}
                {description ? <p className="mt-2 max-w-2xl text-sm text-[#836577]">{description}</p> : null}
              </div>
              {toolbar ? <div className="flex items-center gap-3 text-[#2f1627]">{toolbar}</div> : null}
            </div>

            <div
              className={cn(
                'workspace-grid mt-8',
                sidebar ? 'has-rail' : null
              )}
            >
              <div className="space-y-6">{children}</div>
              {sidebar ? <aside className="space-y-6">{sidebar}</aside> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
