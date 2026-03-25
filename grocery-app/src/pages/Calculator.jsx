import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/budget';
import { CATEGORIES, UNITS } from '../utils/categories';
import { Plus, Trash2, ShoppingBag, X } from 'lucide-react';

export default function Calculator() {
  const { state, dispatch } = useApp();
  const { cart, budgets } = state;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('un');
  const [category, setCategory] = useState('outros');
  const [store, setStore] = useState('');
  const [showFinish, setShowFinish] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !price) return;

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseFloat(quantity) || 1,
        unit,
        category,
      },
    });
    setName('');
    setPrice('');
    setQuantity('1');
  }

  function handleFinish() {
    dispatch({ type: 'FINISH_SHOPPING', payload: { store } });
    setShowFinish(false);
    setStore('');
  }

  // Group cart by category
  const grouped = cart.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="page">
      <h1 className="page-title">Calculadora de Mercado</h1>

      {/* Running total bar */}
      <div className={`total-bar ${total > totalBudget ? 'over-budget' : ''}`}>
        <div className="total-bar-main">
          <span>Total</span>
          <span className="total-value">{formatCurrency(total)}</span>
        </div>
        <div className="total-bar-detail">
          <span>{cart.length} itens</span>
          {totalBudget > 0 && (
            <span>
              Restam {formatCurrency(totalBudget - total)} do orçamento
            </span>
          )}
        </div>
        <div className="budget-progress">
          <div
            className="budget-progress-fill"
            style={{ width: `${Math.min(100, (total / totalBudget) * 100)}%` }}
          />
        </div>
      </div>

      {/* Add item form */}
      <form onSubmit={handleAdd} className="add-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input flex-2"
            autoFocus
          />
          <input
            type="number"
            placeholder="Preço"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input flex-1"
            step="0.01"
            min="0"
            inputMode="decimal"
          />
        </div>
        <div className="form-row">
          <input
            type="number"
            placeholder="Qtd"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input flex-1"
            step="0.1"
            min="0.1"
            inputMode="decimal"
          />
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input flex-1">
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input flex-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!name.trim() || !price}>
          <Plus size={18} /> Adicionar
        </button>
      </form>

      {/* Cart items grouped by category */}
      {Object.entries(grouped).map(([catId, items]) => {
        const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
        const catTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        return (
          <div key={catId} className="section">
            <div className="section-header">
              <h3>{cat.icon} {cat.label}</h3>
              <span className="text-muted">{formatCurrency(catTotal)}</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="text-muted">
                    {item.quantity} {item.unit} × {formatCurrency(item.price)}
                  </span>
                </div>
                <div className="cart-item-actions">
                  <span className="cart-item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Action buttons */}
      {cart.length > 0 && (
        <div className="action-buttons">
          <button className="btn btn-success" onClick={() => setShowFinish(true)}>
            <ShoppingBag size={18} /> Finalizar Compra
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (confirm('Limpar todo o carrinho?')) dispatch({ type: 'CLEAR_CART' });
            }}
          >
            <Trash2 size={18} /> Limpar
          </button>
        </div>
      )}

      {/* Finish modal */}
      {showFinish && (
        <div className="modal-overlay" onClick={() => setShowFinish(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Finalizar Compra</h2>
              <button className="btn-icon" onClick={() => setShowFinish(false)}>
                <X size={20} />
              </button>
            </div>
            <p>Total: <strong>{formatCurrency(total)}</strong> — {cart.length} itens</p>
            <p className="text-muted">Os itens serão adicionados ao seu estoque automaticamente.</p>
            <input
              type="text"
              placeholder="Nome do mercado (opcional)"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className="input"
            />
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowFinish(false)}>
                Cancelar
              </button>
              <button className="btn btn-success" onClick={handleFinish}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
