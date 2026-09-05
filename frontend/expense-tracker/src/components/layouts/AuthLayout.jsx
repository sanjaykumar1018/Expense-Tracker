import React from "react";
import StatsInfoCard from "../cards/StatsInfoCard";
import CARD_2 from "../../assets/images/card2.png";

const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17h2l4-5 3 3 6-8 3 2v-6h-6l2 2-4 5-3-3-7 10z" />
  </svg>
);

const AuthLayout = ({ children }) => {
  return (
    <div className="flex bg-white">
      {/* Left side */}
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Expense Tracker
        </h2>
        <div className="mt-24 md:mt-28">{children}</div>
      </div>

      {/* Right side */}
      <div className="hidden md:block w-[40vw] h-screen bg-violet-50 relative overflow-hidden p-10">
        {/* Decorative background shapes */}
        <div className="w-64 h-64 rounded-[60px] bg-purple-600/10 absolute -top-10 -left-10 rotate-12" />
        <div className="w-48 h-48 rounded-[40px] bg-purple-600 absolute -top-7 -left-4" />
        <div className="w-48 h-56 rounded-[40px] border-[20px] border-fuchsia-600 absolute bottom-7 left-4" />
        <div className="w-48 h-48 rounded-[40px] bg-violet-500 absolute bottom-7 right-4" />

        {/* Top Stat Card */}
        <div className="absolute top-12 right-12 z-20 w-[80%]">
          <div className="bg-white/80 backdrop-blur-md p-1 rounded-3xl shadow-xl shadow-purple-200/50">
            <StatsInfoCard
              icon={<TrendIcon />}
              label="Track Your Income & Expenses"
              value="$430,000"
            />
          </div>
        </div>

        {/* Transactions Card with image replacement */}
        <div className="absolute bottom-12 right-12 z-20 w-[92%] transform hover:scale-[1.02] transition-transform duration-300">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/60">
            <img
              src={CARD_2}
              alt="Transaction Chart"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
