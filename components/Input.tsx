import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
      <input
        className={`w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${error ? 'border-red-500 focus:ring-red-200' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};