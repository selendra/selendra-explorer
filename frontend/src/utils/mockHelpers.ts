import type { NetworkType } from "../types/index";

/**
 * Optimized helper functions for generating mock data
 */

// Generate a random hash (0x + 64 hex characters)
export const generateRandomHash = (): string => {
  return (
    "0x" +
    Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")
  );
};

// Generate a random address based on network type
export const getRandomAddress = (networkType: NetworkType): string => {
  if (networkType === "evm") {
    // EVM address: 0x + 40 hex characters
    return (
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    );
  } else {
    // Substrate address (simplified for mock data)
    return (
      "5" +
      Array(47)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    );
  }
};

// Generate a random integer between min and max (inclusive)
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random value (for token amounts, transaction values, etc.)
export const getRandomValue = (): string => {
  const rand = Math.random();
  if (rand < 0.8) {
    // Small value: 0.001 - 10
    return (Math.random() * 10 + 0.001).toFixed(getRandomInt(3, 6));
  } else if (rand < 0.95) {
    // Medium value: A0 - 1000
    return (Math.random() * 990 + 10).toFixed(getRandomInt(2, 4));
  } else {
    // Large value: 1000 - 100000
    return (Math.random() * 99000 + 1000).toFixed(getRandomInt(0, 2));
  }
};

// Add artificial delay to simulate network latency
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
