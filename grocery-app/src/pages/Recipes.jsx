import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { Plus, Trash2, Edit3, X, Check, ChefHat, Star, Clock, Users, ChevronRight } from 'lucide-react';

const DIFFICULTY = [
  { value: 'facil', label: 'Fácil', color: 'green' },
  { value: 'medio', label: 'Médio', color: 'orange' },
  { value: 'dificil', label: 'Difícil', color: 'red' },
];

const MEAL_TYPES = ['Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Sobremesa'];

export default function Recipes() {
  const { state, dispatch } = useApp();
  const toast = useToast();
  const { recipes, inventory } = state;

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState(false);

  const [form, setForm] = useState({
    name: '',
    difficulty: 'facil',
    mealType: 'Almoço',
    servings: '2',
    prepTime: '',
    ingredients: '',
    instructions: '',
    favorite: false,
  });

  function resetForm() {
    setForm({
      name: '',
      difficulty: 'facil',
      mealType: 'Almoço',
      servings: '2',
      prepTime: '',
      ingredients: '',
      instructions: '',
      favorite: false,
    });
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      ...form,
      servings: parseInt(form.servings) || 2,
      prepTime: parseInt(form.prepTime) || 0,
      ingredients: form.ingredients
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
      instructions: form.instructions
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    };

    if (editId) {
      dispatch({ type: 'UPDATE_RECIPE', payload: { ...payload, id: editId } });
      setEditId(null);
      toast('Receita atualizada');
    } else {
      dispatch({ type: 'ADD_RECIPE', payload });
      toast(`${form.name} adicionada!`);
    }
    resetForm();
    setShowAdd(false);
  }

  function startEdit(recipe) {
    setEditId(recipe.id);
    setForm({
      name: recipe.name,
      difficulty: recipe.difficulty,
      mealType: recipe.mealType,
      servings: String(recipe.servings),
      prepTime: String(recipe.prepTime),
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions.join('\n'),
      favorite: recipe.favorite,
    });
    setShowAdd(true);
  }

  function toggleFavorite(recipe) {
    dispatch({
      type: 'UPDATE_RECIPE',
      payload: { id: recipe.id, favorite: !recipe.favorite },
    });
  }

  // Check which ingredients are available
  function checkAvailability(recipe) {
    return recipe.ingredients.map((ing) => {
      const ingName = ing.replace(/[\d.,]+\s*(kg|g|un|ml|L|pct|cx|dz)?\s*/i, '').trim().toLowerCase();
      const inStock = inventory.some(
        (inv) => inv.quantity > 0 && inv.name.toLowerCase().includes(ingName)
      );
      return { ingredient: ing, available: inStock };
    });
  }

  function canMake(recipe) {
    const availability = checkAvailability(recipe);
    const available = availability.filter((a) => a.available).length;
    return available / availability.length;
  }

  let filtered = recipes;
  if (filterType !== 'all') {
    filtered = filtered.filter((r) => r.mealType === filterType);
  }
  if (filterAvailable) {
    filtered = filtered.filter((r) => canMake(r) >= 0.7);
  }
  // Sort favorites first
  filtered.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Receitas</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setEditId(null); setShowAdd(true); }}>
          <Plus size={18} /> Nova
        </button>
      </div>

      {/* Filters */}
      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input flex-1"
        >
          <option value="all">Todas</option>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button
          className={`btn btn-sm ${filterAvailable ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setFilterAvailable(!filterAvailable)}
        >
          {filterAvailable ? '✓ ' : ''}Com estoque
        </button>
      </div>

      {/* Recipe cards */}
      {filtered.map((recipe) => {
        const diff = DIFFICULTY.find((d) => d.value === recipe.difficulty);
        const availability = checkAvailability(recipe);
        const availableCount = availability.filter((a) => a.available).length;
        const isExpanded = expanded === recipe.id;

        return (
          <div key={recipe.id} className="recipe-card">
            <div className="recipe-header" onClick={() => setExpanded(isExpanded ? null : recipe.id)}>
              <div className="recipe-title-row">
                <button
                  className="btn-icon"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe); }}
                >
                  <Star size={18} fill={recipe.favorite ? '#f59e0b' : 'none'} stroke={recipe.favorite ? '#f59e0b' : 'currentColor'} />
                </button>
                <h3 className="recipe-name">{recipe.name}</h3>
              </div>
              <div className="recipe-meta">
                <span className={`badge badge-${diff?.color}`}>{diff?.label}</span>
                <span className="badge">{recipe.mealType}</span>
                {recipe.prepTime > 0 && (
                  <span className="recipe-info"><Clock size={14} /> {recipe.prepTime}min</span>
                )}
                <span className="recipe-info"><Users size={14} /> {recipe.servings}</span>
                <span className={`badge ${availableCount === availability.length ? 'badge-green' : availableCount > 0 ? 'badge-orange' : 'badge-red'}`}>
                  {availableCount}/{availability.length} ingredientes
                </span>
              </div>
            </div>

            {isExpanded && (
              <div className="recipe-body">
                <div className="recipe-section">
                  <h4>Ingredientes</h4>
                  <ul className="ingredient-list">
                    {availability.map((a, i) => (
                      <li key={i} className={a.available ? 'available' : 'missing'}>
                        {a.available ? '✅' : '❌'} {a.ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="recipe-section">
                  <h4>Modo de Preparo</h4>
                  <ol className="instructions-list">
                    {recipe.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="recipe-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => startEdit(recipe)}>
                    <Edit3 size={14} /> Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (confirm(`Excluir "${recipe.name}"?`))
                        dispatch({ type: 'REMOVE_RECIPE', payload: recipe.id });
                    }}
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="empty-state">
          <ChefHat size={48} />
          <p>Nenhuma receita</p>
          <p className="text-muted">Adicione suas receitas favoritas</p>
        </div>
      )}

      {/* Add/Edit modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setEditId(null); }}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Editar Receita' : 'Nova Receita'}</h2>
              <button className="btn-icon" onClick={() => { setShowAdd(false); setEditId(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="recipe-form">
              <input
                type="text"
                placeholder="Nome da receita"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                autoFocus
              />
              <div className="form-row">
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="input flex-1"
                >
                  {DIFFICULTY.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <select
                  value={form.mealType}
                  onChange={(e) => setForm({ ...form, mealType: e.target.value })}
                  className="input flex-1"
                >
                  {MEAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Porções"
                  value={form.servings}
                  onChange={(e) => setForm({ ...form, servings: e.target.value })}
                  className="input flex-1"
                />
                <input
                  type="number"
                  placeholder="Tempo (min)"
                  value={form.prepTime}
                  onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                  className="input flex-1"
                />
              </div>
              <textarea
                placeholder="Ingredientes (um por linha)&#10;Ex: 500g de frango&#10;1 cebola&#10;2 dentes de alho"
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                className="input textarea"
                rows={5}
              />
              <textarea
                placeholder="Modo de preparo (um passo por linha)&#10;Ex: Tempere o frango&#10;Refogue a cebola&#10;Adicione o frango"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="input textarea"
                rows={5}
              />
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowAdd(false); setEditId(null); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>
                  {editId ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
