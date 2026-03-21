'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  variant?: 'inline' | 'card';
}

export function ErrorMessage({ message, onDismiss, variant = 'inline' }: ErrorMessageProps) {
  const baseClasses = 'flex items-start gap-3 p-4 rounded-lg';
  const variantClasses = {
    inline: 'bg-red-50 border border-red-200',
    card: 'bg-white shadow-md border border-red-200',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-grow">
        <p className="text-red-800 text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
          aria-label="关闭"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
