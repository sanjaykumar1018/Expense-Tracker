import React from 'react'

const Input = ({ value, onChange, label, placeholder, type }) => {
  return (
    <div>
      <label className="text-[13px] text-slate-800">{label}</label>

      <div className="input-box flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full text-[13px] bg-transparent py-3 outline-none"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Input
