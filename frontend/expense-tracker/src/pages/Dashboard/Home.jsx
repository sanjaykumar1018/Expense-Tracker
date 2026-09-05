import React, { useEffect, useState } from "react";
import {
  LuWallet,
  LuTrendingUp,
  LuTrendingDown,
  LuReceipt,
} from "react-icons/lu";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatsInfoCard from "../../components/cards/StatsInfoCard";
import api from "../../utils/api";
import apiPaths from "../../utils/apiPaths";
import { useUser } from "../../context/UserContext";
import {
  formatCurrency,
  formatDate,
  truncateText,
} from "../../utils/hepler";
import { COLORS } from "../../utils/data";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [expenseCategoryWise, setExpenseCategoryWise] = useState([]);
  const [last30DaysExpenses, setLast30DaysExpenses] = useState([]);
  const [last60DaysIncome, setLast60DaysIncome] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [incomeDetails, setIncomeDetails] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        recentRes,
        expenseCatRes,
        last30Res,
        last60Res,
        expenseDetRes,
        incomeDetRes,
      ] = await Promise.all([
        api.get(apiPaths.DASHBOARD_SUMMARY),
        api.get(apiPaths.DASHBOARD_RECENT_TRANSACTIONS),
        api.get(apiPaths.DASHBOARD_EXPENSE_CATEGORY_WISE),
        api.get(apiPaths.DASHBOARD_LAST_30_DAYS_EXPENSES),
        api.get(apiPaths.DASHBOARD_LAST_60_DAYS_INCOME),
        api.get(apiPaths.DASHBOARD_EXPENSE_DETAILS),
        api.get(apiPaths.DASHBOARD_INCOME_DETAILS),
      ]);

      setSummary(summaryRes.data);
      setRecentTransactions(recentRes.data);
      setExpenseCategoryWise(expenseCatRes.data);
      setLast30DaysExpenses(last30Res.data);
      setLast60DaysIncome(last60Res.data);
      setExpenseDetails(expenseDetRes.data);
      setIncomeDetails(incomeDetRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalFinOverview =
    summary.totalIncome + summary.totalExpense;
  const financialOverviewData = totalFinOverview > 0
    ? [
        summary.totalIncome > 0 && {
          category: "Income",
          amount: summary.totalIncome,
        },
        ...expenseCategoryWise,
      ].filter(Boolean)
    : [];

  const expenseDetailsTotal = expenseDetails.reduce(
    (s, i) => s + i.amount,
    0
  );
  const incomeDetailsTotal = incomeDetails.reduce(
    (s, i) => s + i.amount,
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hello, {user?.fullName?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your money today.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsInfoCard
          icon={<LuTrendingUp />}
          label="Total Income"
          value={formatCurrency(summary.totalIncome)}
        />
        <StatsInfoCard
          icon={<LuTrendingDown />}
          label="Total Expense"
          value={formatCurrency(summary.totalExpense)}
        />
        <StatsInfoCard
          icon={<LuWallet />}
          label="Balance"
          value={formatCurrency(summary.balance)}
        />
        <StatsInfoCard
          icon={<LuReceipt />}
          label="Transactions"
          value={summary.incomeCount + summary.expenseCount}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Row 1: Recent Transactions + Financial Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Recent Transactions */}
            <div className="xl:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Transactions
                </h3>
              </div>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {recentTransactions.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-slate-400 text-sm">
                      No transactions yet. Start by adding your first income or expense.
                    </p>
                  </div>
                ) : (
                  recentTransactions.map((txn) => (
                    <div
                      key={txn._id}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                          txn.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {txn.type === "income" ? (
                          <LuTrendingUp size={20} />
                        ) : (
                          <LuTrendingDown size={20} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {txn.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {txn.category} · {formatDate(txn.date)}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          txn.type === "income"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {txn.type === "income" ? "+" : "-"}
                        {formatCurrency(txn.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Overview Pie */}
            <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Financial Overview
              </h3>
              <div className="h-[360px]">
                {financialOverviewData.length === 0 || totalFinOverview === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400 text-sm text-center">
                      No data available yet.
                      <br />
                      Add income or expense to see insights.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialOverviewData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {financialOverviewData.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Last 30 Days Expenses Bar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Last 30 Days Expenses
            </h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last30DaysExpenses} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    name="Expenses"
                    fill="#875cf5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Last 60 Days Income Pie + Expense Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last 60 Days Income */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Last 60 Days Income
              </h3>
              <div className="h-[340px]">
                {last60DaysIncome.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-slate-400 text-sm">
                      No income in the last 60 days.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={last60DaysIncome}
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, percent }) =>
                          `${truncateText(category, 8)} ${(
                            percent * 100
                          ).toFixed(0)}%`
                        }
                      >
                        {last60DaysIncome.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLORS[(idx + 2) % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                          fontSize: "13px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Expense Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Expense Details
              </h3>
              {expenseDetails.length === 0 ? (
                <div className="h-[340px] flex items-center justify-center">
                  <p className="text-slate-400 text-sm">
                    No expense data yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseDetails.map((item, idx) => {
                    const pct =
                      expenseDetailsTotal > 0
                        ? (item.amount / expenseDetailsTotal) * 100
                        : 0;
                    return (
                      <div key={item.category}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {item.category}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Income Details */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Income Details
            </h3>
            {incomeDetails.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-400 text-sm">
                  No income data yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incomeDetails.map((item, idx) => {
                  const pct =
                    incomeDetailsTotal > 0
                      ? (item.amount / incomeDetailsTotal) * 100
                      : 0;
                  return (
                    <div
                      key={item.category}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                COLORS[(idx + 3) % COLORS.length],
                            }}
                          />
                          <span className="text-sm font-semibold text-slate-800">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              COLORS[(idx + 3) % COLORS.length],
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        {pct.toFixed(1)}% of total income
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
