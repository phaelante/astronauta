import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { CATEGORIES } from '../utils/categories';
import { Plus, Trash2, Check, ShoppingCart, Sparkles } from 'lucide-react';

export default function ShoppingList() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { shoppingList, inventory } = state;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('outros');

  function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'ADD_TO_LIST', payload: { name: name.trim(), category } });
    setName('');
  }

  function generateFromStock() {
    const lowItems = inventory.filter((i) => i.quantity <= i.minQuantity);
    let added = 0;
    lowItems.forEach((item) => {
      const alreadyInList = shoppingList.some(
        (l) => l.name.toLowerCase() === item.name.toLowerCase()
      );
      if (!alreadyInList) {
        dispatch({
          type: 'ADD_TO_LIST',
          payload: { name: item.name, category: item.category },
        });
        added++;
      }
    });
    if (added > 0) {
      toast(`${added} itens adicionados do estoque baixo`, 'success');
    } else {
      toast('Nenhum item novo para adicionar', 'info');
    }
  }

  const unchecked = shoppingList.filter((i) => !i.checked);
  const checked = shoppingList.filter((i) => i.checked);
  const progress = shoppingList.length > 0
    ? (checked.length / shoppingList.length) * 100
    : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lista de Compras</h1>
          {shoppingList.length > 0 && (
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
              {checked.length}/{shoppingList.length} concluídos
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {shoppingList.length > 0 && (
        <div className="budget-progress" style={{ marginBottom: '1.25rem', height: '6px' }}>
          <div
            className="budget-progress-fill"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg, var(--success), #6ee7b7)'
                : undefined,
            }}
          />
        </div>
      )}

      <form onSubmit={handleAdd} className="add-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Adicionar item..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input flex-2"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input flex-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <button type="submit" className="btn btn-primary flex-1" disabled={!name.trim()}>
            <Plus size={18} /> Adicionar
          </button>
          <button type="button" className="btn btn-outline flex-1" onClick={generateFromStock}>
            <Sparkles size={18} /> Auto-gerar
          </button>
        </div>
      </form>

      {unchecked.length > 0 && (
        <div className="section">
          <h2 className="section-title">Pendentes ({unchecked.length})</h2>
          {unchecked.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            return (
              <div key={item.id} className="list-item">
                <button
                  className="btn-check"
                  onClick={() => dispatch({ type: 'TOGGLE_LIST_ITEM', payload: item.id })}
                >
                  <div className="check-circle" />
                </button>
                <span className="list-item-name">
                  {cat?.icon} {item.name}
                </span>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => dispatch({ type: 'REMOVE_FROM_LIST', payload: item.id })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {checked.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Concluídos ({checked.length})</h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                checked.forEach((i) => dispatch({ type: 'REMOVE_FROM_LIST', payload: i.id }));
                toast('Concluídos limpos', 'info');
              }}
            >
              Limpar
            </button>
          </div>
          {checked.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            return (
              <div key={item.id} className="list-item checked">
                <button
                  className="btn-check"
                  onClick={() => dispatch({ type: 'TOGGLE_LIST_ITEM', payload: item.id })}
                >
                  <div className="check-circle checked-circle">
                    <Check size={12} />
                  </div>
                </button>
                <span className="list-item-name line-through">
                  {cat?.icon} {item.name}
                </span>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => dispatch({ type: 'REMOVE_FROM_LIST', payload: item.id })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {shoppingList.length === 0 && (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <p>Lista vazia</p>
          <p className="text-muted">Adicione itens ou clique "Auto-gerar" para criar a lista a partir do estoque baixo</p>
        </div>
      )}
    </div>
  );
}
