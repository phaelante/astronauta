import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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
      <BrowserRouter>
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
      </BrowserRouter>
    </AppProvider>
  );
}
