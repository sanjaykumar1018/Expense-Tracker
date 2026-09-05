import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder, label }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div>
      <label className="text-[13px] text-slate-800">{label}</label>

      <div className="flex items-center bg-violet-50/50 px-3 rounded-md mt-1">
        <input
          value={value}
          onChange={onChange}
          type={isShowPassword ? "text" : "password"}
          placeholder={placeholder || "Password"}
          className="w-full text-[13px] bg-transparent py-3 mr-3 outline-none"
        />

        {isShowPassword ? (
          <FaRegEye
            size={18}
            className="text-primary cursor-pointer"
            onClick={() => toggleShowPassword()}
          />
        ) : (
          <FaRegEyeSlash
            size={18}
            className="text-slate-400 cursor-pointer"
            onClick={() => toggleShowPassword()}
          />
        )}
      </div>
    </div>
  );
};

export default PasswordInput;
