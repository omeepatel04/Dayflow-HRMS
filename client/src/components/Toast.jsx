import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nextToast = {
        id,
        title: toast.title,
        description: toast.description,
        variant: toast.variant || "info",
        duration: toast.duration || 3500,
      };
      setToasts((prev) => [...prev, nextToast]);
      window.setTimeout(() => removeToast(id), nextToast.duration);
      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ pushToast, removeToast }),
    [pushToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

const ToastViewport = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClasses(toast.variant)}
          role="status"
          aria-live="polite"
        >
          <div>
            <p className="font-semibold text-[#2f1627]">{toast.title}</p>
            {toast.description ? (
              <p className="text-xs text-[#7f5a6f]">{toast.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-[#9b7891] transition hover:text-[#2f1627]"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const getToastClasses = (variant) => {
  const base =
    "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg bg-white";
  const tone = {
    success: "border-[#b5e1cd] text-[#2f1627]",
    error: "border-[#f5bac8] text-[#2f1627]",
    warning: "border-[#f0c59c] text-[#2f1627]",
    info: "border-[rgba(117,81,108,0.2)] text-[#2f1627]",
  };
  return `${base} ${tone[variant] || tone.info}`;
};

export default ToastProvider;
