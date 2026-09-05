export const API_BASE_URL = "https://expense-tracker-oq2z.onrender.com";

const apiPaths = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/auth/signup",
  GET_USER_INFO: "/api/auth/me",
  UPDATE_PROFILE_IMAGE: "/api/auth/profile-image",

  ADD_INCOME: "/api/income",
  GET_ALL_INCOME: "/api/income",
  DELETE_INCOME: (id) => `/api/income/${id}`,
  DOWNLOAD_INCOME_EXCEL: "/api/income/download/excel",

  ADD_EXPENSE: "/api/expense",
  GET_ALL_EXPENSE: "/api/expense",
  DELETE_EXPENSE: (id) => `/api/expense/${id}`,
  DOWNLOAD_EXPENSE_EXCEL: "/api/expense/download/excel",

  DASHBOARD_SUMMARY: "/api/dashboard/summary",
  DASHBOARD_RECENT_TRANSACTIONS: "/api/dashboard/recent-transactions",
  DASHBOARD_EXPENSE_CATEGORY_WISE: "/api/dashboard/expense-category-wise",
  DASHBOARD_LAST_30_DAYS_EXPENSES: "/api/dashboard/last-30-days-expenses",
  DASHBOARD_LAST_60_DAYS_INCOME: "/api/dashboard/last-60-days-income",
  DASHBOARD_EXPENSE_DETAILS: "/api/dashboard/expense-details",
  DASHBOARD_INCOME_DETAILS: "/api/dashboard/income-details",
};

export default apiPaths;
