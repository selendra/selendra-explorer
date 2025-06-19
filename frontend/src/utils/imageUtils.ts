/**
 * Utility function to handle image loading errors and prevent infinite loops
 */

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string
) => {
  const target = e.target as HTMLImageElement;

  // Prevent infinite loop by checking if we're already using the fallback
  if (target.src !== fallbackSrc && !target.src.endsWith(fallbackSrc)) {
    target.src = fallbackSrc;
  } else {
    // If fallback also fails, remove the image completely
    target.style.display = "none";
  }
};

export const handleChainImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  handleImageError(e, "/chains/default.png");
};

export const handleTokenImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  handleImageError(e, "/tokens/default.png");
};
