import { isWeekend, nextMonday, previousFriday, format } from 'date-fns';

// Returns the next credit date considering business day rules
// If the date falls on Saturday -> previous Friday
// If the date falls on Sunday -> next Monday
export function getNextCreditDate(day, referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  let date = new Date(year, month, day);

  // If already passed this month, go to next month
  if (date < referenceDate) {
    date = new Date(year, month + 1, day);
  }

  // Adjust for weekends
  if (date.getDay() === 6) date = previousFriday(date); // Saturday -> Friday
  if (date.getDay() === 0) date = nextMonday(date);      // Sunday -> Monday

  return date;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date) {
  return format(date, 'dd/MM/yyyy');
}

// Default budget config
export const DEFAULT_BUDGETS = [
  {
    id: 'alelo',
    label: 'Alelo Refeição',
    owner: 'Você',
    amount: 1350,
    creditDay: 25,
    type: 'refeicao',
  },
  {
    id: 'ticket-refeicao',
    label: 'Ticket Refeição',
    owner: 'Esposa',
    amount: 0,
    creditDay: 30,
    type: 'refeicao',
  },
  {
    id: 'ticket-alimentacao',
    label: 'Ticket Alimentação',
    owner: 'Esposa',
    amount: 0,
    creditDay: 30,
    type: 'alimentacao',
  },
];
