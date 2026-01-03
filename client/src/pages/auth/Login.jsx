import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ROUTES } from "../../config/constants";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, isAdminOrHR, user } = useAuth();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = useMemo(() => {
    if (isAdminOrHR || user?.role === "ADMIN" || user?.role === "HR") {
      return ROUTES.ADMIN_DASHBOARD;
    }
    return ROUTES.EMPLOYEE_DASHBOARD;
  }, [isAdminOrHR, user]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, destination, navigate]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.loginId.trim() || !formData.password) {
      setError("Please fill in both fields");
      return;
    }

    setSubmitting(true);
    const result = await login({
      loginId: formData.loginId.trim(),
      password: formData.password,
    });
    setSubmitting(false);

    if (result.success) {
      const role = result.user?.role;
      const target =
        role === "ADMIN" || role === "HR"
          ? ROUTES.ADMIN_DASHBOARD
          : ROUTES.EMPLOYEE_DASHBOARD;
      navigate(target, { replace: true });
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  const busy = submitting || loading;

  return (
    <div className="min-h-screen bg-[#f8f4f7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#2f1627]">Welcome back</h1>
          <p className="text-sm text-[#7f5a6f]">
            Sign in to continue to your workspace
          </p>
        </div>

        <div className="glass-panel rounded-3xl border border-[rgba(117,81,108,0.2)] bg-white p-8 shadow-lg">
          <div className="mb-6 space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] text-[#b28fa1]">
              Secure access
            </p>
            <h2 className="text-xl font-semibold text-[#2f1627]">Sign in</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2f1627]">
                Email or Employee ID
              </label>
              <input
                name="loginId"
                type="text"
                value={formData.loginId}
                onChange={handleChange}
                disabled={busy}
                placeholder="you@example.com or EMP123"
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white px-4 py-3 text-sm text-[#2f1627] focus:border-[#75516c] focus:outline-none disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2f1627]">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={busy}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white px-4 py-3 text-sm text-[#2f1627] focus:border-[#75516c] focus:outline-none disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#75516c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6a4a63] disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#7f5a6f]">
            Need an account? Contact your HR admin to get invited.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
