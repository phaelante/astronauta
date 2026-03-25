import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';
import { Plus, Trash2, Check, ShoppingCart } from 'lucide-react';

export default function ShoppingList() {
  const { state, dispatch } = useApp();
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
    lowItems.forEach((item) => {
      const alreadyInList = shoppingList.some(
        (l) => l.name.toLowerCase() === item.name.toLowerCase()
      );
      if (!alreadyInList) {
        dispatch({
          type: 'ADD_TO_LIST',
          payload: { name: item.name, category: item.category },
        });
      }
    });
  }

  const unchecked = shoppingList.filter((i) => !i.checked);
  const checked = shoppingList.filter((i) => i.checked);

  return (
    <div className="page">
      <h1 className="page-title">Lista de Compras</h1>

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
            <ShoppingCart size={18} /> Gerar do Estoque
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
          <h2 className="section-title text-muted">Concluídos ({checked.length})</h2>
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
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              checked.forEach((i) => dispatch({ type: 'REMOVE_FROM_LIST', payload: i.id }));
            }}
          >
            Limpar concluídos
          </button>
        </div>
      )}

      {shoppingList.length === 0 && (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <p>Lista vazia</p>
          <p className="text-muted">Adicione itens ou gere automaticamente do estoque baixo</p>
        </div>
      )}
    </div>
  );
}
