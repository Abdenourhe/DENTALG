import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 hover:border-slate-400"
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
