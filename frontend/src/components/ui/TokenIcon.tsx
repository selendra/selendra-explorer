import React, { useState, useEffect } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface TokenIconProps {
  name: string;
  symbol: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A reusable token icon component with error handling and fallback
 */
const TokenIcon: React.FC<TokenIconProps> = ({
  name,
  symbol,
  logoUrl,
  size = "md",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(logoUrl);

  // Update image source when logoUrl prop changes
  useEffect(() => {
    if (logoUrl !== imageSrc && !hasError) {
      setImageSrc(logoUrl);
      setHasError(false);
    }
  }, [logoUrl, imageSrc, hasError]);

  // Size classes mapping
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  // Handle image load error
  const handleError = () => {
    setHasError(true);

    // Try to load a fallback based on the token symbol
    if (symbol && logoUrl !== `/tokens/${symbol.toLowerCase()}.png`) {
      setImageSrc(`/tokens/${symbol.toLowerCase()}.png`);
    } else if (logoUrl !== "/tokens/default.png") {
      // If that fails, use the default token icon
      setImageSrc("/tokens/default.png");
    } else {
      // If even the default fails, use no image
      setImageSrc(undefined);
    }
  };

  const iconClass = `${sizeClasses[size]} flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`;

  // If no logo URL or all fallbacks have failed, show icon placeholder
  if (!imageSrc || (hasError && imageSrc === "/tokens/default.png")) {
    return (
      <div className={iconClass}>
        <CurrencyDollarIcon className="h-1/2 w-1/2 text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  // Show the token logo
  return (
    <div className={iconClass}>
      <img
        src={imageSrc}
        alt={`${name || symbol} logo`}
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );
};

export default TokenIcon;
