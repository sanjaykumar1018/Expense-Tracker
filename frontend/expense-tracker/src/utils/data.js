export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Business",
  "Gifts",
  "Rental Income",
  "Sales",
  "Refunds",
  "Other Income",
];

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Rent",
  "Personal Care",
  "Other Expense",
];

export const COLORS = [
  "#875cf5",
  "#f55c7a",
  "#5cf5a2",
  "#f5d95c",
  "#5ca2f5",
  "#f59c5c",
  "#a25cf5",
  "#5cf5e6",
  "#f55c9c",
  "#9cf55c",
  "#5c7af5",
  "#f5c95c",
];

export const getRandomColor = (index) => {
  return COLORS[index % COLORS.length];
};
