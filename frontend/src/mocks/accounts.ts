import type {
  Account,
  AccountType,
  NetworkType,
  TokenBalance,
} from "../types/index";
import {
  getRandomAddress,
  getRandomInt,
  getRandomValue,
} from "../utils/mockHelpers";

// Generate a random token balance
const generateRandomTokenBalance = (): TokenBalance => {
  const symbols = [
    "SEL",
    "USDT",
    "USDC",
    "DAI",
    "WETH",
    "WBTC",
    "LINK",
    "UNI",
    "AAVE",
    "COMP",
  ];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

  return {
    tokenAddress: getRandomAddress("evm"),
    tokenName: `${randomSymbol} Token`,
    tokenSymbol: randomSymbol,
    tokenDecimals: randomSymbol === "USDT" || randomSymbol === "USDC" ? 6 : 18,
    balance: getRandomValue(),
  };
};

// Generate a random account
export const generateMockAccount = (
  index: number,
  networkType: NetworkType = Math.random() > 0.5 ? "evm" : "wasm"
): Account => {
  // Determine account type with weighted probabilities
  const rand = Math.random();
  let type: AccountType;

  if (rand < 0.8) {
    // 80% chance of being an EOA
    type = "eoa";
  } else if (rand < 0.9) {
    // 10% chance of being an EVM contract
    type = "contract_evm";
  } else {
    // 10% chance of being a Wasm contract
    type = "contract_wasm";
  }

  // Generate random token balances (0-5 tokens)
  const tokenCount = getRandomInt(0, 5);
  const tokens: TokenBalance[] = [];

  for (let i = 0; i < tokenCount; i++) {
    tokens.push(generateRandomTokenBalance());
  }

  const address = getRandomAddress(networkType);
  const createdAt = new Date(
    Date.now() - getRandomInt(1, 365) * 24 * 60 * 60 * 1000
  ).toISOString();

  return {
    id: `account-${index}`,
    address,
    balance: getRandomValue(),
    nonce: getRandomInt(0, 100),
    type,
    createdAt,
    transactionCount: getRandomInt(1, 1000),
    networkType,
    code:
      type !== "eoa"
        ? "0x" +
          Array(100)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")
        : undefined,
    tokens: tokens.length > 0 ? tokens : undefined,
  };
};

// Generate a list of mock accounts
export const generateMockAccounts = (count: number): Account[] => {
  const accounts: Account[] = [];

  for (let i = 0; i < count; i++) {
    accounts.push(generateMockAccount(i));
  }

  return accounts;
};

// Pre-generated mock accounts for consistent data
export const mockAccounts: Account[] = generateMockAccounts(200);

// Get a specific account by address
export const getMockAccountByAddress = (
  address: string
): Account | undefined => {
  return mockAccounts.find((account) => account.address === address);
};

// Get a paginated list of accounts
export const getMockAccounts = (page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = mockAccounts.slice(startIndex, endIndex);

  return {
    items: paginatedAccounts,
    totalCount: mockAccounts.length,
    page,
    pageSize,
    hasMore: endIndex < mockAccounts.length,
  };
};
