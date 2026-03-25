export const CATEGORIES = [
  { id: 'carnes', label: 'Carnes', icon: '🥩', unit: 'kg' },
  { id: 'frutas', label: 'Frutas', icon: '🍎', unit: 'kg' },
  { id: 'verduras', label: 'Verduras e Legumes', icon: '🥬', unit: 'un' },
  { id: 'graos', label: 'Grãos e Cereais', icon: '🌾', unit: 'kg' },
  { id: 'laticinios', label: 'Laticínios', icon: '🧀', unit: 'un' },
  { id: 'bebidas', label: 'Bebidas', icon: '🥤', unit: 'un' },
  { id: 'padaria', label: 'Padaria', icon: '🍞', unit: 'un' },
  { id: 'frios', label: 'Frios e Embutidos', icon: '🥓', unit: 'kg' },
  { id: 'congelados', label: 'Congelados', icon: '🧊', unit: 'un' },
  { id: 'limpeza', label: 'Limpeza', icon: '🧹', unit: 'un' },
  { id: 'higiene', label: 'Higiene', icon: '🧴', unit: 'un' },
  { id: 'temperos', label: 'Temperos e Condimentos', icon: '🧂', unit: 'un' },
  { id: 'enlatados', label: 'Enlatados e Conservas', icon: '🥫', unit: 'un' },
  { id: 'massas', label: 'Massas e Molhos', icon: '🍝', unit: 'un' },
  { id: 'snacks', label: 'Snacks e Biscoitos', icon: '🍪', unit: 'un' },
  { id: 'pets', label: 'Pet', icon: '🐾', unit: 'kg' },
  { id: 'outros', label: 'Outros', icon: '📦', unit: 'un' },
];

export const UNITS = ['un', 'kg', 'g', 'L', 'ml', 'pct', 'cx', 'dz'];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
