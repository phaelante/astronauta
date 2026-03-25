import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/budget';
import { Save, Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [budgets, setBudgets] = useState(state.budgets);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({
      type: 'UPDATE_BUDGETS',
      payload: budgets.map((b) => ({ ...b, amount: parseFloat(b.amount) || 0 })),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feira-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.budgets) dispatch({ type: 'UPDATE_BUDGETS', payload: data.budgets });
        // Reload the page to apply all data
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem('feira_' + key, JSON.stringify(value));
        });
        window.location.reload();
      } catch {
        alert('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  }

  function handleClearAll() {
    if (
      confirm(
        'ATENÇÃO: Isso vai apagar TODOS os dados do aplicativo (estoque, receitas, histórico). Tem certeza?'
      )
    ) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('feira_'))
        .forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Configurações</h1>

      {/* Budget settings */}
      <div className="section">
        <h2 className="section-title">Orçamento Mensal</h2>
        {budgets.map((budget, i) => (
          <div key={budget.id} className="config-item">
            <div className="config-label">
              <strong>{budget.label}</strong>
              <span className="text-muted"> — {budget.owner}</span>
            </div>
            <div className="form-row">
              <div className="input-group flex-2">
                <span className="input-prefix">R$</span>
                <input
                  type="number"
                  value={budget.amount}
                  onChange={(e) => {
                    const updated = [...budgets];
                    updated[i] = { ...budget, amount: e.target.value };
                    setBudgets(updated);
                  }}
                  className="input"
                  step="0.01"
                  inputMode="decimal"
                />
              </div>
              <div className="input-group flex-1">
                <span className="input-prefix">Dia</span>
                <input
                  type="number"
                  value={budget.creditDay}
                  onChange={(e) => {
                    const updated = [...budgets];
                    updated[i] = { ...budget, creditDay: parseInt(e.target.value) || 1 };
                    setBudgets(updated);
                  }}
                  className="input"
                  min="1"
                  max="31"
                />
              </div>
            </div>
          </div>
        ))}
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} /> {saved ? 'Salvo!' : 'Salvar Orçamento'}
        </button>
      </div>

      {/* Data management */}
      <div className="section">
        <h2 className="section-title">Dados</h2>
        <p className="text-muted">
          Faça backup dos seus dados ou restaure de um arquivo anterior.
        </p>
        <div className="config-buttons">
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={18} /> Exportar Backup
          </button>
          <label className="btn btn-outline">
            <Upload size={18} /> Importar Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-danger" onClick={handleClearAll}>
            <Trash2 size={18} /> Apagar Tudo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="section">
        <h2 className="section-title">Estatísticas</h2>
        <div className="stats-list">
          <div className="stat-row">
            <span>Itens no estoque</span>
            <strong>{state.inventory.length}</strong>
          </div>
          <div className="stat-row">
            <span>Receitas salvas</span>
            <strong>{state.recipes.length}</strong>
          </div>
          <div className="stat-row">
            <span>Compras realizadas</span>
            <strong>{state.shoppingHistory.length}</strong>
          </div>
          <div className="stat-row">
            <span>Total gasto (histórico)</span>
            <strong>
              {formatCurrency(
                state.expenses.reduce((sum, e) => sum + e.amount, 0)
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
