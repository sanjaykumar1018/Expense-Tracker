import React, { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/hepler";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import PasswordInput from "../../components/Inputs/PasswordInput";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signup } = useUser();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName) {
      setError("Please enter your name");
      return;
    }

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
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", password);
      if (profilePic) {
        formData.append("profileImage", profilePic);
      }

      await signup(formData);
      toast.success("Account created successfully! Welcome aboard.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Signup failed. Please try again.";
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
          Create an Account
        </h3>
        <p className="text-[13px] text-slate-500 mt-2 mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John"
              type="text"
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />
            <div className="col-span-2">
              <PasswordInput
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary !mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
          </button>

          <p className="text-[13px] text-slate-500 text-center mt-4">
            Already have an account?{" "}
            <Link
              className="font-bold text-primary hover:underline ml-1"
              to="/login"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
