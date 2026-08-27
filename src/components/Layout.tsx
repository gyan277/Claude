import { type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, MessageSquare, LogOut, Star, BarChart3, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/policies', label: 'Policies', icon: FileText },
  { to: '/forums', label: 'Forums', icon: MessageSquare },
];

const GOV_NAV_ITEM = { to: '/insights', label: 'Insights', icon: BarChart3 };
const PROFILE_NAV_ITEM = { to: '/profile', label: 'Profile', icon: UserRound };

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    ...NAV_ITEMS,
    ...(user?.role === 'assembly' || user?.role === 'minister' ? [GOV_NAV_ITEM] : []),
    PROFILE_NAV_ITEM,
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Ghana Flag Colors Stripe */}
      <div className="flex h-1.5 md:h-2 w-full shrink-0 shadow-sm">
        <div className="flex-1 bg-ghana-red" />
        <div className="flex-1 bg-ghana-gold" />
        <div className="flex-1 bg-ghana-green" />
      </div>
      
      <div className="flex min-w-0 flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-sm md:flex">
          <div className="mb-10 flex items-center gap-2.5 px-2">
            <div className="rounded-lg bg-ghana-green/10 p-2">
              <img 
                src="/src/assets/logo.png" 
                alt="Ghana Logo" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-900">Dodow Amanmuo</span>
              <Star className="h-4 w-4 fill-ghana-black text-ghana-black" />
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-ghana-green/10 text-ghana-green shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-110`} />
                {label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-ghana-gold/40 bg-gradient-to-br from-ghana-gold/5 to-ghana-gold/10 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-700">Register and verify your Ghana Card to vote and post.</p>
              <Link
                to="/signup"
                className="block rounded-lg bg-ghana-green px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-ghana-green/90 hover:shadow-md"
              >
                Register
              </Link>
              <Link 
                to="/login" 
                className="block text-center text-sm font-semibold text-ghana-green transition-colors hover:text-ghana-green/80"
              >
                Sign in
              </Link>
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-3 md:px-8 md:py-5 shadow-sm">
            <div className="flex items-center gap-1.5 md:hidden">
              <div className="rounded-md bg-ghana-green/10 p-1">
                <img 
                  src="/src/assets/logo.png" 
                  alt="Ghana Logo" 
                  className="h-4 w-4 object-contain"
                />
              </div>
              <span className="text-sm font-bold text-slate-900">Dodow Amanmuo</span>
            </div>
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              {user ? (
                <>
                  <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.name}</span>
                  <span className="badge-gold text-[10px] md:text-xs font-semibold capitalize px-2 py-0.5">
                    {user.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="text-slate-400 transition-colors hover:text-red-600 md:hidden"
                  >
                    <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-xs md:text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-1.5 rounded-md md:rounded-lg bg-ghana-green px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white shadow-sm transition-all hover:bg-ghana-green/90 hover:shadow-md"
                  >
                    <UserRound className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Register</span>
                  </Link>
                </>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 px-3 py-4 pb-20 md:px-8 md:py-8 md:pb-8">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-sm md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-ghana-green' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
