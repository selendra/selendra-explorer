import React, { ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  padded?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  testId?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padded = true,
  hoverable = false,
  onClick,
  testId,
}) => {
  // Base classes that apply to all card variants
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  // Padding classes
  const paddingClasses = padded ? 'p-4 sm:p-5' : '';
  
  // Hoverable classes
  const hoverableClasses = hoverable 
    ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
    : '';
  
  // Classes for different card variants
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-md border border-gray-200/50 dark:border-gray-700/50',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl',
    flat: 'bg-gray-50 dark:bg-gray-900/50',
    outlined: 'bg-transparent border border-gray-200 dark:border-gray-700',
  };
  
  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${variantClasses[variant]} ${hoverableClasses} ${className}`}
      onClick={onClick}
      data-testid={testId}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  action,
}) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <div className="text-lg font-semibold text-gray-900 dark:text-white">{children}</div>
    {action && <div>{action}</div>}
  </div>
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => <div className={className}>{children}</div>;

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => (
  <div className={`mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default Card; 