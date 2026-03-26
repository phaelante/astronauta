import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import ShoppingList from './pages/ShoppingList';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import Recipes from './pages/Recipes';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calculadora" element={<Calculator />} />
              <Route path="/lista" element={<ShoppingList />} />
              <Route path="/estoque" element={<Inventory />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/receitas" element={<Recipes />} />
              <Route path="/config" element={<Settings />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
}
