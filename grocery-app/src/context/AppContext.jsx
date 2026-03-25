import { createContext, useContext, useReducer, useEffect } from 'react';
import { load, save } from '../utils/storage';
import { DEFAULT_BUDGETS } from '../utils/budget';

const AppContext = createContext();

const initialState = {
  // Budget config
  budgets: load('budgets', DEFAULT_BUDGETS),
  // Shopping cart (current trip)
  cart: load('cart', []),
  // Shopping history
  shoppingHistory: load('shoppingHistory', []),
  // Inventory items
  inventory: load('inventory', []),
  // Shopping list (planned items)
  shoppingList: load('shoppingList', []),
  // Recipes
  recipes: load('recipes', []),
  // Monthly expenses
  expenses: load('expenses', []),
};

function reducer(state, action) {
  switch (action.type) {
    // === BUDGETS ===
    case 'UPDATE_BUDGETS':
      return { ...state, budgets: action.payload };

    // === CART ===
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, { ...action.payload, id: Date.now() }] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.id !== action.payload) };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map((i) => (i.id === action.payload.id ? { ...i, ...action.payload } : i)),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'FINISH_SHOPPING': {
      const trip = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: state.cart,
        total: state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
        store: action.payload?.store || '',
      };
      // Add items to inventory
      const updatedInventory = [...state.inventory];
      state.cart.forEach((cartItem) => {
        const existing = updatedInventory.find(
          (inv) => inv.name.toLowerCase() === cartItem.name.toLowerCase()
        );
        if (existing) {
          existing.quantity += cartItem.quantity;
          existing.lastPurchase = new Date().toISOString();
          existing.lastPrice = cartItem.price;
        } else {
          updatedInventory.push({
            id: Date.now() + Math.random(),
            name: cartItem.name,
            category: cartItem.category || 'outros',
            quantity: cartItem.quantity,
            unit: cartItem.unit || 'un',
            minQuantity: 1,
            lastPurchase: new Date().toISOString(),
            lastPrice: cartItem.price,
          });
        }
      });
      // Add expense
      const expense = {
        id: Date.now(),
        date: new Date().toISOString(),
        amount: trip.total,
        store: trip.store,
        itemCount: trip.items.length,
      };
      return {
        ...state,
        cart: [],
        shoppingHistory: [trip, ...state.shoppingHistory],
        inventory: updatedInventory,
        expenses: [expense, ...state.expenses],
      };
    }

    // === INVENTORY ===
    case 'ADD_INVENTORY':
      return {
        ...state,
        inventory: [...state.inventory, { ...action.payload, id: Date.now() }],
      };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i
        ),
      };
    case 'REMOVE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.filter((i) => i.id !== action.payload),
      };
    case 'USE_INVENTORY': {
      return {
        ...state,
        inventory: state.inventory.map((i) => {
          if (i.id === action.payload.id) {
            const newQty = Math.max(0, i.quantity - action.payload.amount);
            return { ...i, quantity: newQty };
          }
          return i;
        }),
      };
    }

    // === SHOPPING LIST ===
    case 'ADD_TO_LIST':
      return {
        ...state,
        shoppingList: [...state.shoppingList, { ...action.payload, id: Date.now(), checked: false }],
      };
    case 'TOGGLE_LIST_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.map((i) =>
          i.id === action.payload ? { ...i, checked: !i.checked } : i
        ),
      };
    case 'REMOVE_FROM_LIST':
      return {
        ...state,
        shoppingList: state.shoppingList.filter((i) => i.id !== action.payload),
      };
    case 'CLEAR_LIST':
      return { ...state, shoppingList: [] };

    // === RECIPES ===
    case 'ADD_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, { ...action.payload, id: Date.now() }],
      };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };
    case 'REMOVE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter((r) => r.id !== action.payload),
      };

    // === EXPENSES ===
    case 'REMOVE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist state changes
  useEffect(() => { save('budgets', state.budgets); }, [state.budgets]);
  useEffect(() => { save('cart', state.cart); }, [state.cart]);
  useEffect(() => { save('shoppingHistory', state.shoppingHistory); }, [state.shoppingHistory]);
  useEffect(() => { save('inventory', state.inventory); }, [state.inventory]);
  useEffect(() => { save('shoppingList', state.shoppingList); }, [state.shoppingList]);
  useEffect(() => { save('recipes', state.recipes); }, [state.recipes]);
  useEffect(() => { save('expenses', state.expenses); }, [state.expenses]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
