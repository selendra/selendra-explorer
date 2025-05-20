import type {
  NetworkType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../types/index";
import { mockBlocks } from "./blocks";
import {
  generateRandomHash,
  getRandomInt,
  getRandomAddress,
  getRandomValue,
} from "../utils/mockHelpers";

// Generate a random transaction
export const generateMockTransaction = (
  blockNumber: number,
  index: number,
  networkType: NetworkType = Math.random() > 0.5 ? "evm" : "wasm"
): Transaction => {
  const block =
    mockBlocks.find((b) => b.number === blockNumber) || mockBlocks[0];
  const hash = generateRandomHash();
  const from = getRandomAddress(networkType);

  // Determine transaction type with weighted probabilities
  const rand = Math.random();
  let transactionType: TransactionType;
  let to: string | null = null;

  if (rand < 0.7) {
    // 70% chance of being a transfer
    transactionType = "transfer";
    to = getRandomAddress(networkType);
  } else if (rand < 0.9) {
    // 20% chance of being a contract call
    transactionType = "contract_call";
    to = getRandomAddress(networkType);
  } else {
    // 10% chance of being a contract creation
    transactionType = "contract_creation";
    to = null;
  }

  // Determine status with weighted probabilities
  const statusRand = Math.random();
  let status: TransactionStatus;

  if (statusRand < 0.95) {
    // 95% chance of success
    status = "success";
  } else if (statusRand < 0.98) {
    // 3% chance of failure
    status = "failed";
  } else {
    // 2% chance of pending
    status = "pending";
  }

  return {
    id: `tx-${blockNumber}-${index}`,
    hash,
    blockNumber,
    blockHash: block.hash,
    timestamp: block.timestamp,
    from,
    to,
    value: getRandomValue(),
    gasPrice:
      networkType === "evm" ? getRandomInt(1, 100).toString() : undefined,
    gasLimit:
      networkType === "evm"
        ? getRandomInt(21000, 100000).toString()
        : undefined,
    gasUsed:
      networkType === "evm"
        ? getRandomInt(21000, 100000).toString()
        : undefined,
    nonce: getRandomInt(0, 100),
    status,
    transactionType,
    networkType,
    input:
      transactionType !== "transfer"
        ? "0x" +
          Array(128)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16))
            .join("")
        : "0x",
    fee:
      networkType === "evm"
        ? (getRandomInt(1, 100) * 0.000001).toString()
        : (getRandomInt(1, 100) * 0.0001).toString(),
    logs: [],
    events: [],
  };
};

// Generate a list of mock transactions
export const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const blockIndex = i % mockBlocks.length;
    const block = mockBlocks[blockIndex];
    transactions.push(generateMockTransaction(block.number, i));
  }

  return transactions;
};

// Pre-generated mock transactions for consistent data
export const mockTransactions: Transaction[] = generateMockTransactions(500);

// Get a specific transaction by hash
export const getMockTransactionByHash = (
  hash: string
): Transaction | undefined => {
  return mockTransactions.find((tx) => tx.hash === hash);
};

// Get transactions for a specific block
export const getMockTransactionsByBlock = (
  blockNumber: number
): Transaction[] => {
  return mockTransactions.filter((tx) => tx.blockNumber === blockNumber);
};

// Get transactions for a specific address
export const getMockTransactionsByAddress = (
  address: string
): Transaction[] => {
  return mockTransactions.filter(
    (tx) => tx.from === address || tx.to === address
  );
};

// Get a paginated list of transactions
export const getMockTransactions = (
  page: number,
  pageSize: number,
  address?: string
) => {
  let filteredTransactions = mockTransactions;

  if (address) {
    filteredTransactions = getMockTransactionsByAddress(address);
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  return {
    items: paginatedTransactions,
    totalCount: filteredTransactions.length,
    page,
    pageSize,
    hasMore: endIndex < filteredTransactions.length,
  };
};
