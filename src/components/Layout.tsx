import { type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, MessageSquare, LogOut, Landmark, Star, BarChart3, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/policies', label: 'Policies', icon: FileText },
  { to: '/forums', label: 'Forums', icon: MessageSquare },
];

const GOV_NAV_ITEM = { to: '/insights', label: 'Insights', icon: BarChart3 };

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [...NAV_ITEMS, ...(user?.role === 'assembly' || user?.role === 'minister' ? [GOV_NAV_ITEM] : [])];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex h-1.5 w-full shrink-0">
        <div className="flex-1 bg-ghana-red" />
        <div className="flex-1 bg-ghana-gold" />
        <div className="flex-1 bg-ghana-green" />
      </div>
      <div className="flex min-w-0 flex-1">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Landmark className="h-6 w-6 text-ghana-green" />
          <span className="text-lg font-bold text-slate-900">Dodow Amanmuo</span>
          <Star className="h-3.5 w-3.5 fill-ghana-black text-ghana-black" />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ghana-green/10 text-ghana-green' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        ) : (
          <div className="space-y-1.5 rounded-md border border-ghana-gold/40 bg-ghana-gold/5 p-3">
            <p className="text-xs text-slate-600">Register and verify your Ghana Card to vote and post.</p>
            <Link
              to="/signup"
              className="block rounded-md bg-ghana-green px-3 py-1.5 text-center text-xs font-medium text-white"
            >
              Register
            </Link>
            <Link to="/login" className="block text-center text-xs font-medium text-ghana-green underline">
              Sign in
            </Link>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-1.5 md:hidden">
            <Landmark className="h-5 w-5 text-ghana-green" />
            <span className="text-sm font-bold text-slate-900">Dodow Amanmuo</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
                <span className="rounded-full bg-ghana-gold/20 px-2 py-0.5 text-xs font-semibold capitalize text-ghana-black">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="text-slate-400 hover:text-slate-600 md:hidden"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 rounded-md bg-ghana-green px-3 py-1.5 text-sm font-medium text-white"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-6 md:pb-6">{children}</main>
      </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? 'text-ghana-green' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
