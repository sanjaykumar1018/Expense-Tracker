import { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/hepler";
import PasswordInput from "../../components/Inputs/PasswordInput";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful! Welcome back.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[550px] h-auto flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome Back
        </h3>

        <p className="text-[13px] text-slate-500 mt-2 mb-8">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />

          <PasswordInput
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 Characters"
          />

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary !mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

          <p className="text-[13px] text-slate-500 text-center mt-4">
            Don't have an account?{" "}
            <Link
              className="font-bold text-primary hover:underline ml-1"
              to="/signup"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
