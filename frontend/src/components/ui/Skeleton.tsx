import React from 'react';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';
type SkeletonAnimation = 'pulse' | 'wave' | 'none';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: SkeletonAnimation;
  count?: number;
  inline?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
  count = 1,
  inline = false,
}) => {
  // Base skeleton styles
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 relative overflow-hidden';

  // Define styles for variants
  const variantClasses: Record<SkeletonVariant, string> = {
    text: 'rounded h-4',
    circle: 'rounded-full',
    rect: 'rounded-md',
    card: 'rounded-lg',
  };

  // Animation classes
  const animationClasses: Record<SkeletonAnimation, string> = {
    pulse: 'animate-pulse',
    wave: 'before:absolute before:inset-0 before:-translate-x-full before:animate-wave before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
    none: '',
  };

  // Style object for width/height
  const style: React.CSSProperties = {};
  
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const renderSkeleton = () => {
    const items = [];
    const display = inline ? 'inline-block' : 'block';
    
    for (let i = 0; i < count; i++) {
      items.push(
        <span
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${display} ${className}`}
          style={{
            ...style,
            marginRight: inline && i < count - 1 ? '0.5rem' : undefined,
            marginBottom: !inline && i < count - 1 ? '0.5rem' : undefined,
          }}
          aria-hidden="true"
          data-testid="skeleton"
        ></span>
      );
    }
    
    return items;
  };

  return <>{renderSkeleton()}</>;
};

export default Skeleton;

/**
 * Note: Add the following animation to tailwind.config.js:
 * 
 * @keyframes wave {
 *   100% {
 *     transform: translateX(100%);
 *   }
 * }
 * 
 * In the theme.extend.animation:
 * animation: {
 *   wave: 'wave 1.5s infinite',
 * }
 */ 