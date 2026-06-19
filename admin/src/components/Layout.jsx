import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/products', label: 'المنتجات', icon: Package },
  { to: '/orders', label: 'الطلبات', icon: ShoppingBag },
  { to: '/users', label: 'المستخدمون', icon: Users },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r flex flex-col">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="شفاء" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">شفاء</h1>
              <p className="text-[11px] text-gray-400 leading-tight">لوحة التحكم</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate mt-2">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 border-t text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
