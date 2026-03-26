import { useApp } from '../context/AppContext';
import { formatCurrency, getNextCreditDate, formatDate } from '../utils/budget';
import {
  Wallet,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  CalendarClock,
  ArrowRight,
  Package,
  ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useApp();
  const { budgets, inventory, cart, expenses, shoppingList } = state;

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  const now = new Date();
  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const remaining = totalBudget - monthExpenses;
  const lowStock = inventory.filter((i) => i.quantity <= i.minQuantity);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const budgetPercent = totalBudget > 0 ? (monthExpenses / totalBudget) * 100 : 0;

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="page">
      <h1 className="page-title">Feira em Casa</h1>
      <p className="page-subtitle">
        {monthNames[now.getMonth()]} {now.getFullYear()} — Organização de compras
      </p>

      {/* Budget overview */}
      <div className="cards-grid">
        <div className="card card-green">
          <div className="card-header">
            <Wallet size={16} />
            <span>Orçamento</span>
          </div>
          <div className="card-value">{formatCurrency(totalBudget)}</div>
          <div className="card-detail">
            {budgets.filter(b => b.amount > 0).map((b) => (
              <div key={b.id} className="budget-line">
                <span>{b.owner}</span>
                <span>{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`card ${remaining >= 0 ? 'card-blue' : 'card-red'}`}>
          <div className="card-header">
            <TrendingDown size={16} />
            <span>Saldo</span>
          </div>
          <div className="card-value">{formatCurrency(remaining)}</div>
          <div className="card-detail">
            <div className="budget-progress" style={{ marginTop: '0.25rem' }}>
              <div
                className="budget-progress-fill"
                style={{
                  width: `${Math.min(100, budgetPercent)}%`,
                  background: budgetPercent > 90
                    ? 'linear-gradient(90deg, var(--danger), #fca5a5)'
                    : undefined,
                }}
              />
            </div>
            <span style={{ marginTop: '0.25rem', display: 'block' }}>
              {budgetPercent.toFixed(0)}% utilizado
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="section">
        <h2 className="section-title">Acesso Rápido</h2>
        <div className="stats-grid">
          <Link to="/calculadora" className="stat-card stat-orange">
            <ShoppingCart size={22} />
            <div style={{ flex: 1 }}>
              <div className="stat-value">
                {cart.length > 0 ? `${cart.length} itens` : 'Ir às compras'}
              </div>
              <div className="stat-label">
                {cart.length > 0
                  ? `Carrinho — ${formatCurrency(cartTotal)}`
                  : 'Abrir calculadora de mercado'}
              </div>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </Link>

          <Link to="/lista" className="stat-card stat-blue">
            <ClipboardList size={22} />
            <div style={{ flex: 1 }}>
              <div className="stat-value">
                {shoppingList.filter(i => !i.checked).length} pendentes
              </div>
              <div className="stat-label">Lista de compras</div>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </Link>

          {lowStock.length > 0 && (
            <Link to="/alertas" className="stat-card stat-red">
              <AlertTriangle size={22} />
              <div style={{ flex: 1 }}>
                <div className="stat-value">{lowStock.length} alertas</div>
                <div className="stat-label">Itens com estoque baixo</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          )}

          <Link to="/estoque" className="stat-card" style={{ borderLeftColor: 'var(--info)' }}>
            <Package size={22} />
            <div style={{ flex: 1 }}>
              <div className="stat-value">{inventory.length} itens</div>
              <div className="stat-label">No estoque</div>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </Link>
        </div>
      </div>

      {/* Next credit dates */}
      {budgets.some(b => b.amount > 0) && (
        <div className="section">
          <h2 className="section-title">Próximos Créditos</h2>
          <div className="credit-list">
            {budgets.filter(b => b.amount > 0).map((b) => {
              const nextDate = getNextCreditDate(b.creditDay);
              const daysUntil = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
              return (
                <div key={b.id} className="credit-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CalendarClock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.label}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.owner} — {formatCurrency(b.amount)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem' }}>{formatDate(nextDate)}</div>
                    <span className={`badge ${daysUntil <= 3 ? 'badge-green' : ''}`}>
                      {daysUntil === 0 ? 'Hoje!' : `${daysUntil}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent trips */}
      {state.shoppingHistory.length > 0 && (
        <div className="section">
          <h2 className="section-title">Últimas Compras</h2>
          {state.shoppingHistory.slice(0, 3).map((trip) => (
            <div key={trip.id} className="history-item">
              <div>
                <div style={{ fontWeight: 600 }}>{trip.store || 'Compra'}</div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {formatDate(new Date(trip.date))} — {trip.items.length} itens
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {formatCurrency(trip.total)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
