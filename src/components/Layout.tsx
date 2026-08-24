import { type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, MessageSquare, LogOut, Landmark, Star, BarChart3 } from 'lucide-react';
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
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex h-1.5 w-full shrink-0">
        <div className="flex-1 bg-ghana-red" />
        <div className="flex-1 bg-ghana-gold" />
        <div className="flex-1 bg-ghana-green" />
      </div>
      <div className="flex flex-1">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Landmark className="h-6 w-6 text-ghana-green" />
          <span className="text-lg font-bold text-slate-900">Dodow Amanmuo</span>
          <Star className="h-3.5 w-3.5 fill-ghana-black text-ghana-black" />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {[...NAV_ITEMS, ...(user?.role === 'assembly' || user?.role === 'minister' ? [GOV_NAV_ITEM] : [])].map(
            ({ to, label, icon: Icon }) => (
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

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <span className="text-sm font-medium text-slate-500 md:hidden">Dodow Amanmuo</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <span className="rounded-full bg-ghana-gold/20 px-2 py-0.5 text-xs font-semibold capitalize text-ghana-black">
              {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
      </div>
    </div>
  );
}
