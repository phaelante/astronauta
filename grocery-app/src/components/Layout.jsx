import { NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  AlertTriangle,
  ChefHat,
  Settings,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/calculadora', icon: ShoppingCart, label: 'Mercado' },
  { to: '/lista', icon: ClipboardList, label: 'Lista' },
  { to: '/estoque', icon: Package, label: 'Estoque' },
  { to: '/alertas', icon: AlertTriangle, label: 'Alertas' },
  { to: '/receitas', icon: ChefHat, label: 'Receitas' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export default function Layout() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
