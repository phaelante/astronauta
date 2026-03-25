import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, UNITS } from '../utils/categories';
import { formatCurrency } from '../utils/budget';
import { Plus, Trash2, Minus, Edit3, X, Check, Package } from 'lucide-react';

export default function Inventory() {
  const { state, dispatch } = useApp();
  const { inventory } = state;

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'outros',
    quantity: '',
    unit: 'un',
    minQuantity: '1',
    lastPrice: '',
  });

  function resetForm() {
    setForm({ name: '', category: 'outros', quantity: '', unit: 'un', minQuantity: '1', lastPrice: '' });
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    dispatch({
      type: 'ADD_INVENTORY',
      payload: {
        name: form.name.trim(),
        category: form.category,
        quantity: parseFloat(form.quantity) || 0,
        unit: form.unit,
        minQuantity: parseFloat(form.minQuantity) || 1,
        lastPrice: parseFloat(form.lastPrice) || 0,
        lastPurchase: null,
      },
    });
    resetForm();
    setShowAdd(false);
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minQuantity: String(item.minQuantity),
      lastPrice: String(item.lastPrice || ''),
    });
  }

  function saveEdit() {
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        id: editId,
        name: form.name.trim(),
        category: form.category,
        quantity: parseFloat(form.quantity) || 0,
        unit: form.unit,
        minQuantity: parseFloat(form.minQuantity) || 1,
        lastPrice: parseFloat(form.lastPrice) || 0,
      },
    });
    setEditId(null);
    resetForm();
  }

  function useItem(item) {
    dispatch({ type: 'USE_INVENTORY', payload: { id: item.id, amount: 1 } });
  }

  let filtered = inventory;
  if (filter !== 'all') {
    filtered = filtered.filter((i) => i.category === filter);
  }
  if (search) {
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  }

  // Group by category
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Estoque</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Novo
        </button>
      </div>

      {/* Search and filter */}
      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input flex-1"
        >
          <option value="all">Todas</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory list */}
      {Object.entries(grouped).map(([catId, items]) => {
        const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
        return (
          <div key={catId} className="section">
            <h3 className="section-title">{cat.icon} {cat.label}</h3>
            {items.map((item) => {
              const isLow = item.quantity <= item.minQuantity;
              const isEditing = editId === item.id;

              if (isEditing) {
                return (
                  <div key={item.id} className="inventory-item editing">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input"
                      placeholder="Nome"
                    />
                    <div className="form-row">
                      <input
                        type="number"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        className="input flex-1"
                        placeholder="Qtd"
                      />
                      <select
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        className="input flex-1"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={form.minQuantity}
                        onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                        className="input flex-1"
                        placeholder="Mín"
                      />
                    </div>
                    <div className="form-row">
                      <button className="btn btn-success btn-sm flex-1" onClick={saveEdit}>
                        <Check size={16} /> Salvar
                      </button>
                      <button
                        className="btn btn-outline btn-sm flex-1"
                        onClick={() => { setEditId(null); resetForm(); }}
                      >
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className={`inventory-item ${isLow ? 'low-stock' : ''}`}>
                  <div className="inventory-info">
                    <span className="inventory-name">{item.name}</span>
                    <span className={`inventory-qty ${isLow ? 'text-danger' : ''}`}>
                      {item.quantity} {item.unit}
                      {isLow && ' ⚠️'}
                    </span>
                    {item.lastPrice > 0 && (
                      <span className="text-muted text-sm">
                        Último preço: {formatCurrency(item.lastPrice)}
                      </span>
                    )}
                  </div>
                  <div className="inventory-actions">
                    <button className="btn-icon" onClick={() => useItem(item)} title="Usar 1">
                      <Minus size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => handleEdit(item)} title="Editar">
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => {
                        if (confirm(`Remover "${item.name}" do estoque?`))
                          dispatch({ type: 'REMOVE_INVENTORY', payload: item.id });
                      }}
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="empty-state">
          <Package size={48} />
          <p>Estoque vazio</p>
          <p className="text-muted">Adicione itens manualmente ou finalize uma compra</p>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Item no Estoque</h2>
              <button className="btn-icon" onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <input
                type="text"
                placeholder="Nome do produto"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                autoFocus
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Quantidade"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="input flex-1"
                  step="0.1"
                />
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="input flex-1"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                placeholder="Quantidade mínima (alerta)"
                value={form.minQuantity}
                onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                className="input"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Último preço (opcional)"
                value={form.lastPrice}
                onChange={(e) => setForm({ ...form, lastPrice: e.target.value })}
                className="input"
                step="0.01"
              />
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
