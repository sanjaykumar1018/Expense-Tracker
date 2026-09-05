import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuWallet,
  LuTrendingUp,
  LuTrendingDown,
  LuLogOut,
} from "react-icons/lu";
import { useUser } from "../../context/UserContext";
import { getInitials } from "../../utils/hepler";
import { API_BASE_URL } from "../../utils/apiPaths";
const DashboardSidebar = ({ children }) => {
 const { user, logout, isAuthenticated } = useUser();
 const navigate = useNavigate();
 const handleLogout = () => {
 logout();
 navigate("/login", { replace: true });
 };
 const navItems = [
 {
 to: "/dashboard",
 label: "Dashboard",
 icon: <LuLayoutDashboard size={20}/>,
 },
 {
 to: "/income",
 label: "Income",
 icon: <LuTrendingUp size={20}/>,
 },
 {
 to: "/expense",
 label: "Expense",
 icon: <LuTrendingDown size={20}/>,
 },
 ];
 return (<div className="min-h-screen bg-slate-50 flex">
 {/* Sidebar */}
 <aside className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col sticky top-0 h-screen">
 {/* Logo */}
 <div className="px-6 py-6 border-b border-slate-100">
 <div className="flex items-center gap-2">
 <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-purple-200">
 <LuWallet size={18}/>
 </div>
 <h1 className="text-lg font-bold text-slate-900 tracking-tight">
 Expense Tracker
 </h1>
 </div>
 </div>

 {/* User Profile */}
 {isAuthenticated && user && (<div className="px-5 py-5 border-b border-slate-100">
 <div className="flex items-center gap-3">
 {user.profileImage ? (<img src={`${API_BASE_URL}${user.profileImage}`} alt={user.fullName} className="w-11 h-11 rounded-full object-cover border-2 border-primary/20"/>) : (<div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
 {getInitials(user.fullName)}
 </div>)}
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-900 truncate">
 {user.fullName}
 </p>
 <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
 </div>
 </div>
 </div>)}

 {/* Nav Links */}
 <nav className="flex-1 px-3 py-5 space-y-1">
 {navItems.map((item) => (<NavLink key={item.to} to={item.to} className={({ isActive }) =>
 `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
 ? "bg-primary text-white shadow-md shadow-purple-200"
 : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
 }>
 <span className="flex-shrink-0">{item.icon}</span>
 <span>{item.label}</span>
 </NavLink>))}
 </nav>

 {/* Logout */}
 <div className="px-3 py-5 border-t border-slate-100">
 <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
 <LuLogOut size={20}/>
 <span>Logout</span>
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <main className="flex-1 min-h-screen">
 <div className="px-8 py-8 max-w-[1600px] mx-auto">{children}</div>
 </main>
 </div>);
};
export default DashboardSidebar;

