import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { CATEGORIES, UNITS } from '../utils/categories';
import { formatCurrency } from '../utils/budget';
import { Plus, Trash2, Minus, PlusCircle, Edit3, X, Check, Package, Search } from 'lucide-react';

export default function Inventory() {
  const { state, dispatch } = useApp();
  const toast = useToast();
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
    toast(`${form.name.trim()} adicionado ao estoque`);
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
    toast('Item atualizado');
    setEditId(null);
    resetForm();
  }

  function adjustQuantity(item, delta) {
    const newQty = Math.max(0, item.quantity + delta);
    dispatch({ type: 'UPDATE_INVENTORY', payload: { id: item.id, quantity: newQty } });
  }

  let filtered = inventory;
  if (filter !== 'all') {
    filtered = filtered.filter((i) => i.category === filter);
  }
  if (search) {
    filtered = filtered.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  }

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Summary
  const totalItems = inventory.length;
  const lowCount = inventory.filter((i) => i.quantity <= i.minQuantity).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            {totalItems} itens{lowCount > 0 ? ` — ${lowCount} em alerta` : ''}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowAdd(true); }}>
          <Plus size={16} /> Novo
        </button>
      </div>

      {/* Search */}
      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 2 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
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
            <h3 className="section-title">{cat.icon} {cat.label} ({items.length})</h3>
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
                        inputMode="decimal"
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
                        inputMode="decimal"
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
                      {isLow && <span style={{ marginLeft: '0.25rem' }}>— estoque baixo</span>}
                    </span>
                    {item.lastPrice > 0 && (
                      <span className="text-muted text-sm">
                        {formatCurrency(item.lastPrice)}/{item.unit}
                      </span>
                    )}
                  </div>
                  <div className="inventory-actions">
                    <button
                      className="btn-icon"
                      onClick={() => adjustQuantity(item, -1)}
                      title="Usar 1"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => adjustQuantity(item, 1)}
                      title="Adicionar 1"
                    >
                      <PlusCircle size={16} />
                    </button>
                    <button className="btn-icon" onClick={() => handleEdit(item)} title="Editar">
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => {
                        if (confirm(`Remover "${item.name}" do estoque?`)) {
                          dispatch({ type: 'REMOVE_INVENTORY', payload: item.id });
                          toast(`${item.name} removido`, 'warning');
                        }
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
          <p>{search ? 'Nenhum resultado' : 'Estoque vazio'}</p>
          <p className="text-muted">
            {search
              ? `Nada encontrado para "${search}"`
              : 'Adicione itens manualmente ou finalize uma compra'}
          </p>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <h2>Novo Item</h2>
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
                style={{ marginBottom: '0.5rem' }}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
                style={{ marginBottom: '0.5rem' }}
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
                  inputMode="decimal"
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
                inputMode="decimal"
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                type="number"
                placeholder="Último preço (opcional)"
                value={form.lastPrice}
                onChange={(e) => setForm({ ...form, lastPrice: e.target.value })}
                className="input"
                step="0.01"
                inputMode="decimal"
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
