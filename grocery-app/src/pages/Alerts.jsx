import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency, getNextCreditDate, formatDate } from '../utils/budget';
import {
  AlertTriangle,
  ShoppingCart,
  Calendar,
  TrendingUp,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Alerts() {
  const { state, dispatch } = useApp();
  const { inventory, shoppingList, budgets, expenses } = state;

  // Items with low or zero stock
  const outOfStock = inventory.filter((i) => i.quantity === 0);
  const lowStock = inventory.filter((i) => i.quantity > 0 && i.quantity <= i.minQuantity);

  // Budget alerts
  const now = new Date();
  const monthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsed = totalBudget > 0 ? (monthExpenses / totalBudget) * 100 : 0;

  // Items not purchased in over 30 days
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const staleItems = inventory.filter(
    (i) => i.lastPurchase && new Date(i.lastPurchase) < thirtyDaysAgo
  );

  // Credit date alerts
  const upcomingCredits = budgets
    .filter((b) => b.amount > 0)
    .map((b) => ({
      ...b,
      nextDate: getNextCreditDate(b.creditDay),
      daysUntil: Math.ceil(
        (getNextCreditDate(b.creditDay) - now) / (1000 * 60 * 60 * 24)
      ),
    }))
    .filter((b) => b.daysUntil <= 5);

  function addToList(item) {
    const alreadyInList = shoppingList.some(
      (l) => l.name.toLowerCase() === item.name.toLowerCase()
    );
    if (!alreadyInList) {
      dispatch({
        type: 'ADD_TO_LIST',
        payload: { name: item.name, category: item.category },
      });
    }
  }

  const hasAlerts =
    outOfStock.length > 0 ||
    lowStock.length > 0 ||
    budgetUsed >= 80 ||
    upcomingCredits.length > 0 ||
    staleItems.length > 0;

  return (
    <div className="page">
      <h1 className="page-title">Alertas</h1>

      {!hasAlerts && (
        <div className="empty-state">
          <CheckCircle size={48} className="text-success" />
          <p>Tudo em ordem!</p>
          <p className="text-muted">Nenhum alerta no momento</p>
        </div>
      )}

      {/* Out of stock */}
      {outOfStock.length > 0 && (
        <div className="alert-section alert-danger">
          <div className="alert-header">
            <AlertTriangle size={20} />
            <h2>Em Falta ({outOfStock.length})</h2>
          </div>
          {outOfStock.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            const inList = shoppingList.some(
              (l) => l.name.toLowerCase() === item.name.toLowerCase()
            );
            return (
              <div key={item.id} className="alert-item">
                <span>
                  {cat?.icon} {item.name}
                </span>
                {inList ? (
                  <span className="badge badge-green">Na lista</span>
                ) : (
                  <button className="btn btn-sm btn-primary" onClick={() => addToList(item)}>
                    <Plus size={14} /> Lista
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="alert-section alert-warning">
          <div className="alert-header">
            <ShoppingCart size={20} />
            <h2>Estoque Baixo ({lowStock.length})</h2>
          </div>
          {lowStock.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            const inList = shoppingList.some(
              (l) => l.name.toLowerCase() === item.name.toLowerCase()
            );
            return (
              <div key={item.id} className="alert-item">
                <div>
                  <span>{cat?.icon} {item.name}</span>
                  <span className="text-muted">
                    {' '}— {item.quantity} {item.unit} (mín: {item.minQuantity})
                  </span>
                </div>
                {inList ? (
                  <span className="badge badge-green">Na lista</span>
                ) : (
                  <button className="btn btn-sm btn-primary" onClick={() => addToList(item)}>
                    <Plus size={14} /> Lista
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Budget alert */}
      {budgetUsed >= 80 && (
        <div className={`alert-section ${budgetUsed >= 100 ? 'alert-danger' : 'alert-warning'}`}>
          <div className="alert-header">
            <TrendingUp size={20} />
            <h2>Orçamento</h2>
          </div>
          <p>
            Você já usou <strong>{budgetUsed.toFixed(0)}%</strong> do orçamento mensal.
          </p>
          <p>
            Gasto: {formatCurrency(monthExpenses)} / {formatCurrency(totalBudget)}
          </p>
          <p>Restam: {formatCurrency(totalBudget - monthExpenses)}</p>
        </div>
      )}

      {/* Upcoming credits */}
      {upcomingCredits.length > 0 && (
        <div className="alert-section alert-info">
          <div className="alert-header">
            <Calendar size={20} />
            <h2>Créditos Próximos</h2>
          </div>
          {upcomingCredits.map((b) => (
            <div key={b.id} className="alert-item">
              <span>
                {b.label} — {b.owner}
              </span>
              <span>
                {b.daysUntil === 0
                  ? 'Hoje!'
                  : `Em ${b.daysUntil} dia${b.daysUntil > 1 ? 's' : ''}`}{' '}
                ({formatDate(b.nextDate)})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stale items */}
      {staleItems.length > 0 && (
        <div className="alert-section alert-info">
          <div className="alert-header">
            <Calendar size={20} />
            <h2>Não Comprados há +30 dias</h2>
          </div>
          {staleItems.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            return (
              <div key={item.id} className="alert-item">
                <span>{cat?.icon} {item.name}</span>
                <span className="text-muted">
                  Última compra: {formatDate(new Date(item.lastPurchase))}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick add all low stock to list */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <Link to="/lista" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <ShoppingCart size={18} /> Ir para Lista de Compras
        </Link>
      )}
    </div>
  );
}
