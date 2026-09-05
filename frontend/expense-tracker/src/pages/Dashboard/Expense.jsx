import React, { useEffect, useState } from "react";
import {
  LuTrendingDown,
  LuPlus,
  LuTrash2,
  LuDownload,
  LuCreditCard,
} from "react-icons/lu";
import api from "../../utils/api";
import apiPaths from "../../utils/apiPaths";
import { EXPENSE_CATEGORIES, COLORS } from "../../utils/data";
import {
  formatCurrency,
  formatDate,
  truncateText,
} from "../../utils/hepler";
import toast from "react-hot-toast";

const Expense = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get(apiPaths.GET_ALL_EXPENSE);
      setExpenses(res.data);
    } catch (err) {
      console.error("Fetch expenses error:", err);
      toast.error("Failed to load expense data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(apiPaths.ADD_EXPENSE, {
        title: title.trim(),
        amount: Number(amount),
        category,
        description: description.trim(),
        date,
      });
      toast.success("Expense added successfully!");
      setTitle("");
      setAmount("");
      setCategory(EXPENSE_CATEGORIES[0]);
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      fetchExpenses();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add expense";
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this expense entry?")
    )
      return;
    try {
      await api.delete(apiPaths.DELETE_EXPENSE(id));
      toast.success("Expense deleted successfully");
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to delete expense";
      toast.error(msg);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const res = await api.get(apiPaths.DOWNLOAD_EXPENSE_EXCEL, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense-details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Expense Excel downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <LuTrendingDown size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Expense
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage and track all your spending
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleDownloadExcel}
          disabled={downloading || expenses.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuDownload size={16} />
          {downloading ? "Downloading..." : "Download Excel"}
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-7 text-white shadow-xl shadow-rose-200/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <LuCreditCard size={30} />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                Total Expense
              </p>
              <p className="text-4xl font-bold mt-1">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Entries
              </p>
              <p className="text-2xl font-bold mt-1">{expenses.length}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Avg / Entry
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(
                  expenses.length > 0 ? totalExpense / expenses.length : 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form + List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Add Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit sticky top-8">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <LuPlus size={20} className="text-rose-500" />
            Add New Expense
          </h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="text-[13px] text-slate-800 font-medium">
                Expense Title
              </label>
              <div className="input-box flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
                <input
                  type="text"
                  placeholder="e.g. Grocery Shopping"
                  className="w-full text-[13px] bg-transparent py-3 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] text-slate-800 font-medium">
                  Amount ($)
                </label>
                <div className="input-box flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full text-[13px] bg-transparent py-3 outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[13px] text-slate-800 font-medium">
                  Date
                </label>
                <div className="input-box flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
                  <input
                    type="date"
                    className="w-full text-[13px] bg-transparent py-3 outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[13px] text-slate-800 font-medium">
                Category
              </label>
              <div className="input-box flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
                <select
                  className="w-full text-[13px] bg-transparent py-3 outline-none appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[13px] text-slate-800 font-medium">
                Description (Optional)
              </label>
              <div className="bg-violet-50/50 px-3 rounded-md mt-1">
                <textarea
                  placeholder="Add any notes..."
                  rows="3"
                  className="w-full text-[13px] bg-transparent py-3 outline-none resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-rose-200/50 flex items-center justify-center gap-2"
            >
              <LuPlus size={16} />
              {submitting ? "ADDING..." : "ADD EXPENSE"}
            </button>
          </form>
        </div>

        {/* Expense List */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-5">
            Expense History
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 mx-auto flex items-center justify-center mb-4">
                <LuTrendingDown size={30} className="text-rose-400" />
              </div>
              <p className="text-slate-500 font-medium">No expenses yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Add your first expense entry using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
              {expenses.map((expense, idx) => (
                <div
                  key={expense._id}
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${COLORS[idx % COLORS.length]}20`,
                      color: COLORS[idx % COLORS.length],
                    }}
                  >
                    <LuTrendingDown size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {expense.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          >
                            {expense.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(expense.date)}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            {truncateText(expense.description, 80)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-base font-bold text-rose-600">
                            -{formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expense;
