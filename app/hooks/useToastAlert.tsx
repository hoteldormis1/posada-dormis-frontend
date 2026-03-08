import toast, { Toast } from "react-hot-toast";
import React from "react";

type ToastType = "success" | "error" | "info" | "loading";

const palette: Record<ToastType, { bg: string; accent: string; icon: string }> = {
  success: {
    bg: "linear-gradient(135deg, #0f2a1e 0%, #0d1f17 100%)",
    accent: "#22c55e",
    icon: "✓",
  },
  error: {
    bg: "linear-gradient(135deg, #2a0f0f 0%, #1f0d0d 100%)",
    accent: "#ef4444",
    icon: "✕",
  },
  info: {
    bg: "linear-gradient(135deg, #0f1a2a 0%, #0d1520 100%)",
    accent: "#6366f1",
    icon: "i",
  },
  loading: {
    bg: "linear-gradient(135deg, #1a1a0f 0%, #14140a 100%)",
    accent: "#f59e0b",
    icon: "⟳",
  },
};

const injectStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("toast-custom-styles")) return;
  const style = document.createElement("style");
  style.id = "toast-custom-styles";
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(-12px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes toast-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to   { opacity: 0; transform: translateY(-8px) scale(0.96); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .toast-root {
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px 12px 12px;
      border-radius: 14px;
      min-width: 280px;
      max-width: 380px;
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow:
        0 2px 8px rgba(0,0,0,0.4),
        0 12px 32px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.05);
      backdrop-filter: blur(12px);
      cursor: default;
    }
    .toast-root--visible {
      animation: toast-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .toast-root--hidden {
      animation: toast-out 0.2s ease-in both;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .toast-icon--loading {
      animation: spin 1s linear infinite;
    }

    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
      color: #e8e8ed;
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.07);
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      padding: 0;
      line-height: 1;
    }
    .toast-close:hover {
      background: rgba(255,255,255,0.14);
      color: #ccc;
    }
  `;
  document.head.appendChild(style);
};

const activeToasts = new Map<string, string>();

const createToast = (type: ToastType, message: string) => {
  injectStyles();

  const toastKey = `${type}-${message}`;
  if (activeToasts.has(toastKey)) return;

  const { bg, accent, icon } = palette[type];

  const toastId = toast.custom(
    (t: Toast) => (
      <div
        role="alert"
        className={`toast-root toast-root--${t.visible ? "visible" : "hidden"}`}
        style={{ background: bg }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: "3px",
            borderRadius: "0 3px 3px 0",
            background: accent,
            boxShadow: `0 0 8px ${accent}80`,
          }}
        />

        {/* Icon badge */}
        <div
          className={`toast-icon${type === "loading" ? " toast-icon--loading" : ""}`}
          style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}40` }}
        >
          {icon}
        </div>

        {/* Message */}
        <span className="toast-message">{message}</span>

        {/* Close */}
        <button
          className="toast-close"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    ),
    { duration: 3500 }
  );

  activeToasts.set(toastKey, toastId);
  setTimeout(() => activeToasts.delete(toastKey), 3600);
};

export const useToastAlert = () => ({
  successToast: (msg: string) => createToast("success", msg),
  errorToast:   (msg: string) => createToast("error", msg),
  infoToast:    (msg: string) => createToast("info", msg),
  loadingToast: (msg: string) => createToast("loading", msg),
});
