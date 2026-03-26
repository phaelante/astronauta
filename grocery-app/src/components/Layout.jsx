import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Home,
  ShoppingCart,
  Package,
  Bell,
  ChefHat,
  Settings,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Início' },
  { to: '/calculadora', icon: ShoppingCart, label: 'Mercado' },
  { to: '/lista', icon: ClipboardList, label: 'Lista' },
  { to: '/estoque', icon: Package, label: 'Estoque' },
  { to: '/alertas', icon: Bell, label: 'Alertas' },
  { to: '/receitas', icon: ChefHat, label: 'Receitas' },
  { to: '/config', icon: Settings, label: 'Config' },
];

export default function Layout() {
  const { state } = useApp();
  const location = useLocation();

  // Badge counts
  const cartCount = state.cart.length;
  const lowStock = state.inventory.filter((i) => i.quantity <= i.minQuantity).length;
  const listCount = state.shoppingList.filter((i) => !i.checked).length;

  function getBadge(to) {
    if (to === '/calculadora' && cartCount > 0) return cartCount;
    if (to === '/alertas' && lowStock > 0) return lowStock;
    if (to === '/lista' && listCount > 0) return listCount;
    return 0;
  }

  return (
    <div className="app-container">
      <main className="main-content" key={location.pathname}>
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => {
          const badge = getBadge(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} strokeWidth={2.2} />
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </div>
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
