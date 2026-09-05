import React from "react";

const StatsInfoCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-3xl p-6 shadow-lg flex items-center gap-5 min-w-[280px]">
    <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
      <span className="text-2xl inline-flex">{icon}</span>
    </div>
    <div className="flex-1">
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900 mt-0.5">{value}</div>
    </div>
  </div>
);

export default StatsInfoCard;
