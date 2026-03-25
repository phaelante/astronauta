import { useApp } from '../context/AppContext';
import { formatCurrency, getNextCreditDate, formatDate } from '../utils/budget';
import { Wallet, TrendingDown, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { state } = useApp();
  const { budgets, inventory, cart, expenses, shoppingList } = state;

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  // Current month expenses
  const now = new Date();
  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const remaining = totalBudget - monthExpenses;

  // Low stock items
  const lowStock = inventory.filter((i) => i.quantity <= i.minQuantity);

  // Cart total
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="page">
      <h1 className="page-title">Feira em Casa</h1>
      <p className="page-subtitle">Organização de compras do mês</p>

      {/* Budget overview */}
      <div className="cards-grid">
        <div className="card card-green">
          <div className="card-header">
            <Wallet size={20} />
            <span>Orçamento Total</span>
          </div>
          <div className="card-value">{formatCurrency(totalBudget)}</div>
          <div className="card-detail">
            {budgets.filter(b => b.amount > 0).map((b) => (
              <div key={b.id} className="budget-line">
                <span>{b.label} ({b.owner})</span>
                <span>{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`card ${remaining >= 0 ? 'card-blue' : 'card-red'}`}>
          <div className="card-header">
            <TrendingDown size={20} />
            <span>Saldo do Mês</span>
          </div>
          <div className="card-value">{formatCurrency(remaining)}</div>
          <div className="card-detail">
            <span>Gasto: {formatCurrency(monthExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Next credit dates */}
      <div className="section">
        <h2 className="section-title">Próximos Créditos</h2>
        <div className="credit-list">
          {budgets.filter(b => b.amount > 0).map((b) => {
            const nextDate = getNextCreditDate(b.creditDay);
            const daysUntil = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
            return (
              <div key={b.id} className="credit-item">
                <div>
                  <strong>{b.label}</strong>
                  <span className="text-muted"> — {b.owner}</span>
                </div>
                <div>
                  <span>{formatDate(nextDate)}</span>
                  <span className="badge">{daysUntil === 0 ? 'Hoje!' : `${daysUntil} dias`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div className="section">
        <h2 className="section-title">Resumo Rápido</h2>
        <div className="stats-grid">
          {cart.length > 0 && (
            <Link to="/calculadora" className="stat-card stat-orange">
              <ShoppingCart size={24} />
              <div>
                <div className="stat-value">{cart.length} itens</div>
                <div className="stat-label">No carrinho — {formatCurrency(cartTotal)}</div>
              </div>
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link to="/alertas" className="stat-card stat-red">
              <AlertTriangle size={24} />
              <div>
                <div className="stat-value">{lowStock.length}</div>
                <div className="stat-label">Itens com estoque baixo</div>
              </div>
            </Link>
          )}
          {shoppingList.length > 0 && (
            <Link to="/lista" className="stat-card stat-blue">
              <ShoppingCart size={24} />
              <div>
                <div className="stat-value">{shoppingList.filter(i => !i.checked).length}</div>
                <div className="stat-label">Itens na lista de compras</div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent trips */}
      {state.shoppingHistory.length > 0 && (
        <div className="section">
          <h2 className="section-title">Últimas Compras</h2>
          {state.shoppingHistory.slice(0, 3).map((trip) => (
            <div key={trip.id} className="history-item">
              <div>
                <strong>{trip.store || 'Compra'}</strong>
                <span className="text-muted"> — {formatDate(new Date(trip.date))}</span>
              </div>
              <div>
                <span>{trip.items.length} itens</span>
                <strong> {formatCurrency(trip.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
