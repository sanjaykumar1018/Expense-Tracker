import React, { useEffect, useState } from "react";
import {
  LuTrendingUp,
  LuPlus,
  LuTrash2,
  LuDownload,
  LuWallet,
} from "react-icons/lu";
import api from "../../utils/api";
import apiPaths from "../../utils/apiPaths";
import { INCOME_CATEGORIES, COLORS } from "../../utils/data";
import {
  formatCurrency,
  formatDate,
  truncateText,
} from "../../utils/hepler";
import toast from "react-hot-toast";

const Income = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [incomes, setIncomes] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await api.get(apiPaths.GET_ALL_INCOME);
      setIncomes(res.data);
    } catch (err) {
      console.error("Fetch incomes error:", err);
      toast.error("Failed to load income data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleAddIncome = async (e) => {
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
      await api.post(apiPaths.ADD_INCOME, {
        title: title.trim(),
        amount: Number(amount),
        category,
        description: description.trim(),
        date,
      });
      toast.success("Income added successfully!");
      setTitle("");
      setAmount("");
      setCategory(INCOME_CATEGORIES[0]);
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      fetchIncomes();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to add income";
      toast.error(msg || "Failed to add income");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income entry?"))
      return;
    try {
      await api.delete(apiPaths.DELETE_INCOME(id));
      toast.success("Income deleted successfully");
      setIncomes((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete income";
      toast.error(msg);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const res = await api.get(apiPaths.DOWNLOAD_INCOME_EXCEL, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income-details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Income Excel downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <LuTrendingUp size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Income
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage and track all your income sources
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleDownloadExcel}
          disabled={downloading || incomes.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuDownload size={16} />
          {downloading ? "Downloading..." : "Download Excel"}
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-7 text-white shadow-xl shadow-emerald-200/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <LuWallet size={30} />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                Total Income
              </p>
              <p className="text-4xl font-bold mt-1">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Entries
              </p>
              <p className="text-2xl font-bold mt-1">{incomes.length}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Avg / Entry
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(
                  incomes.length > 0 ? totalIncome / incomes.length : 0
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
            <LuPlus size={20} className="text-emerald-500" />
            Add New Income
          </h3>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div>
              <label className="text-[13px] text-slate-800 font-medium">
                Income Title
              </label>
              <div className="input-box flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
                <input
                  type="text"
                  placeholder="e.g. Monthly Salary"
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
                  {INCOME_CATEGORIES.map((c) => (
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-200/50 flex items-center justify-center gap-2"
            >
              <LuPlus size={16} />
              {submitting ? "ADDING..." : "ADD INCOME"}
            </button>
          </form>
        </div>

        {/* Income List */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-5">
            Income History
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : incomes.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-4">
                <LuTrendingUp size={30} className="text-emerald-400" />
              </div>
              <p className="text-slate-500 font-medium">No income yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Add your first income entry using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-2">
              {incomes.map((income, idx) => (
                <div
                  key={income._id}
                  className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${COLORS[idx % COLORS.length]}20`,
                      color: COLORS[idx % COLORS.length],
                    }}
                  >
                    <LuTrendingUp size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {income.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          >
                            {income.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(income.date)}
                          </span>
                        </div>
                        {income.description && (
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            {truncateText(income.description, 80)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-base font-bold text-emerald-600">
                            +{formatCurrency(income.amount)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(income._id)}
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

export default Income;
