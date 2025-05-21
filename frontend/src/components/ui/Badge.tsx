import React, { ReactNode } from 'react';

type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'evm' 
  | 'wasm' 
  | 'neutral';

type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  outlined?: boolean;
  className?: string;
  icon?: ReactNode;
  testId?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  pill = false,
  outlined = false,
  className = '',
  icon,
  testId,
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'text-xs py-0.5 px-1.5',
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1 px-2.5',
  };

  // Border radius based on pill prop
  const roundedClasses = pill ? 'rounded-full' : 'rounded';

  // Variant classes for filled badges
  const filledVariantClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    evm: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    wasm: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  // Variant classes for outlined badges
  const outlinedVariantClasses = {
    primary: 'border border-primary-500 text-primary-700 dark:border-primary-600 dark:text-primary-400',
    secondary: 'border border-secondary-500 text-secondary-700 dark:border-secondary-600 dark:text-secondary-400',
    success: 'border border-green-500 text-green-700 dark:border-green-600 dark:text-green-400',
    danger: 'border border-red-500 text-red-700 dark:border-red-600 dark:text-red-400',
    warning: 'border border-yellow-500 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400',
    info: 'border border-blue-500 text-blue-700 dark:border-blue-600 dark:text-blue-400',
    evm: 'border border-purple-500 text-purple-700 dark:border-purple-600 dark:text-purple-400',
    wasm: 'border border-indigo-500 text-indigo-700 dark:border-indigo-600 dark:text-indigo-400',
    neutral: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-400',
  };

  const variantClasses = outlined ? outlinedVariantClasses[variant] : filledVariantClasses[variant];

  return (
    <span
      className={`inline-flex items-center font-medium ${sizeClasses[size]} ${roundedClasses} ${variantClasses} ${className}`}
      data-testid={testId}
    >
      {icon && <span className="mr-1 -ml-0.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge; 