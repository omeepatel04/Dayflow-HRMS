import { useState } from "react";
import { Eye, EyeOff, Building2, Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES, USER_ROLES } from "../../config/constants";

function InputField({
  icon: Icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  isPassword = false,
  showPassword,
  setShowPassword,
}) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.3em] text-[#b28fa1]">
        {name.replace(/([A-Z])/g, " $1").trim()}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-[#c4a3b3] transition-colors duration-300 group-focus-within:text-[#75516c]" />
        </div>
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          name={name}
          placeholder={placeholder}
          className="block w-full rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 pl-10 pr-4 py-3 text-sm text-[#2f1a2c] placeholder:text-[#c4a3b3] shadow-[0_10px_30px_rgba(117,81,108,0.08)] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#c4a3b3] transition hover:text-[#75516c]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const result = await login({
        loginId: formData.email,
        password: formData.password,
      });

      if (result.success) {
        if (result.user.role === USER_ROLES.HR_OFFICER) {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else {
          setErrorMsg(
            "Only HR/Admin personnel can login here. Please contact your administrator."
          );
        }
      } else {
        setErrorMsg(result.error || "Login failed");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
      console.error("Auth error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff9fb] via-[#fdeff3] to-[#fbe4ed] p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-0 h-48 w-48 rounded-full bg-[#f2c9d8] blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-[#f6dfe8] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-3xl border border-[rgba(117,81,108,0.18)] bg-white/90 shadow-[0_25px_70px_rgba(117,81,108,0.18)] backdrop-blur-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f0c9d9] via-[#d69ab6] to-[#75516c]" />

        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(117,81,108,0.25)] bg-[#fff4f7]">
              <Building2 className="h-6 w-6 text-[#75516c]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2f1a2c]">
              HR Admin Login
            </h2>
            <p className="mt-2 text-sm text-[#8f6d80]">
              Enter your credentials to access the HR management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              icon={Mail}
              type="text"
              name="email"
              placeholder="Username (e.g., testhr)"
              value={formData.email}
              onChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <InputField
              icon={Lock}
              type="password"
              name="password"
              placeholder="••••••••"
              isPassword={true}
              value={formData.password}
              onChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group mt-6 flex w-full items-center justify-center rounded-xl bg-[#75516c] py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(117,81,108,0.35)] transition hover:bg-[#6a4a63] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 border-t border-[rgba(117,81,108,0.2)] pt-6 text-center">
            <p className="text-sm text-[#8f6d80]">New HR Admin?</p>
            <p className="mt-2 text-xs text-[#c4a3b3]">
              Contact your system administrator to create an account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
