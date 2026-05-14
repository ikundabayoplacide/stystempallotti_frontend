import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function Input({ label, error, fullWidth = false, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-secondary-100 font-family-primary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          px-4 py-2.5 rounded-xl border bg-style-500 text-secondary-100
          font-family-primary text-sm
          placeholder:text-custom-700
          border-custom-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-primary-400 focus:ring-primary-200" : ""}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-primary-600 font-family-primary">{error}</span>
      )}
    </div>
  );
}
