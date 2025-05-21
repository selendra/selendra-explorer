import type { Token, TokenType, NetworkType } from "../types";
import { getRandomAddress, getRandomInt } from "../utils/mockHelpers";

// Common token names and symbols for more realistic data
const tokenData = [
  { name: "Selendra", symbol: "SEL" },
  { name: "USD Tether", symbol: "USDT" },
  { name: "USD Coin", symbol: "USDC" },
  { name: "Dai Stablecoin", symbol: "DAI" },
  { name: "Wrapped Ether", symbol: "WETH" },
  { name: "Wrapped Bitcoin", symbol: "WBTC" },
  { name: "Wrapped Selendra", symbol: "WSEL" },
  { name: "Bitcoin", symbol: "BTC" },
  { name: "Ethereum", symbol: "ETH" },
  { name: "Polygon", symbol: "MATIC" },
  { name: "Binance Coin", symbol: "BNB" },
  { name: "Polkadot", symbol: "DOT" },
  { name: "Kusama", symbol: "KSM" },
  { name: "Selendra NFT", symbol: "SELNFT" },
  { name: "Crypto Punks", symbol: "PUNK" },
];

// Map symbols to their local logo files
const logoMap: Record<string, string> = {
  SEL: "/tokens/sel.png",
  USDT: "/tokens/usdt.png",
  USDC: "/tokens/usdc.png",
  DAI: "/tokens/dai.png",
  WSEL: "/tokens/wsel.png",
  BTC: "/tokens/btc.png",
  ETH: "/tokens/eth.png",
  MATIC: "/tokens/matic.png",
  BNB: "/tokens/bnb.png",
  DOT: "/tokens/dot.png",
  KSM: "/tokens/ksm.png",
  // Default for other tokens without specific logos
  DEFAULT: "/tokens/default.png",
};

// Generate a random token
export const generateMockToken = (
  index: number,
  networkType: NetworkType = Math.random() > 0.5 ? "evm" : "wasm"
): Token => {
  // Determine token type with weighted probabilities
  const rand = Math.random();
  let type: TokenType;

  if (rand < 0.7) {
    // 70% chance of being an ERC20/PSP22
    type = "erc20";
  } else if (rand < 0.9) {
    // 20% chance of being an ERC721/PSP34
    type = "erc721";
  } else {
    // 10% chance of being an ERC1155
    type = "erc1155";
  }

  // Random token data
  const tokenIndex = Math.floor(Math.random() * tokenData.length);
  const { name, symbol } = tokenData[tokenIndex];

  // Add some variation to the names
  const nameWithVariation = type === "erc721" ? `${name} Collection` : name;

  // Random date within the last year
  const createdAt = new Date(
    Date.now() - getRandomInt(1, 365) * 24 * 60 * 60 * 1000
  ).toISOString();

  // Add price and market cap data for ERC20 tokens
  const price = type === "erc20" ? (Math.random() * 100).toFixed(2) : undefined;
  const priceChange24h = type === "erc20" ? Math.random() * 20 - 10 : undefined;
  const marketCap =
    type === "erc20" && price
      ? (
          parseInt(price) * parseInt((Math.random() * 1000000000).toFixed(0))
        ).toString()
      : undefined;
  const holders = getRandomInt(10, 10000);

  return {
    id: `token-${index}`,
    address: getRandomAddress(networkType),
    name: nameWithVariation,
    symbol,
    decimals:
      type === "erc20" ? (symbol === "USDT" || symbol === "USDC" ? 6 : 18) : 0,
    totalSupply:
      type === "erc20"
        ? (Math.random() * 1000000000).toFixed(0)
        : type === "erc721"
        ? getRandomInt(1000, 10000).toString()
        : getRandomInt(1, 100).toString(),
    type: type,
    tokenType: type,
    networkType,
    creator: getRandomAddress(networkType),
    createdAt,
    holderCount: holders,
    transferCount: getRandomInt(100, 100000),
    logoUrl:
      logoMap[symbol] ||
      (symbol && logoMap[symbol.toUpperCase()]) ||
      logoMap["DEFAULT"],
    price,
    priceChange24h,
    marketCap,
    holders,
  };
};

// Generate a list of mock tokens
export const generateMockTokens = (count: number): Token[] => {
  const tokens: Token[] = [];

  for (let i = 0; i < count; i++) {
    tokens.push(generateMockToken(i));
  }

  return tokens;
};

// Pre-generated mock tokens for consistent data
export const mockTokens: Token[] = generateMockTokens(50);

// Get a specific token by address
export const getMockTokenByAddress = (address: string): Token | undefined => {
  return mockTokens.find((token) => token.address === address);
};

// Get a paginated list of tokens
export const getMockTokens = (
  page: number,
  pageSize: number,
  type?: TokenType,
  networkType?: NetworkType
) => {
  let filteredTokens = mockTokens;

  if (type) {
    filteredTokens = filteredTokens.filter((token) => token.type === type);
  }

  if (networkType) {
    filteredTokens = filteredTokens.filter(
      (token) => token.networkType === networkType
    );
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTokens = filteredTokens.slice(startIndex, endIndex);

  return {
    items: paginatedTokens,
    totalCount: filteredTokens.length,
    page,
    pageSize,
    hasMore: endIndex < filteredTokens.length,
  };
};
