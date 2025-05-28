import type { Block, NetworkType } from "../types/index";
import {
  generateRandomHash,
  getRandomInt,
  getRandomAddress,
} from "../utils/mockHelpers";

// Generate a random block
export const generateMockBlock = (
  number: number,
  networkType: NetworkType = Math.random() > 0.5 ? "evm" : "wasm"
): Block => {
  const timestamp = new Date(Date.now() - number * 12000).toISOString(); // ~12 seconds per block
  const transactionCount = getRandomInt(0, 50);
  const hash = generateRandomHash();
  const parentHash =
    number > 0
      ? generateRandomHash()
      : "0x0000000000000000000000000000000000000000000000000000000000000000";

  return {
    id: `block-${number}`,
    number,
    hash,
    parentHash,
    timestamp,
    transactionCount,
    size: getRandomInt(2000, 30000),
    gasUsed:
      networkType === "evm" ? getRandomInt(21000, 10000000).toString() : "0",
    gasLimit: networkType === "evm" ? "30000000" : "0",
    validator: getRandomAddress(networkType),
    networkType,
    extraData:
      networkType === "evm"
        ? "0x" + Math.random().toString(16).substring(2, 10)
        : undefined,
    stateRoot: generateRandomHash(),
    nonce:
      networkType === "evm"
        ? "0x" + Math.random().toString(16).substring(2, 18)
        : undefined,
  };
};

// Generate a list of mock blocks
export const generateMockBlocks = (count: number): Block[] => {
  const blocks: Block[] = [];
  const latestBlockNumber = 1000000; // Simulating a high block number for realism

  for (let i = 0; i < count; i++) {
    const blockNumber = latestBlockNumber - i;
    blocks.push(generateMockBlock(blockNumber));
  }

  return blocks;
};

// Pre-generated mock blocks for consistent data
export const mockBlocks: Block[] = generateMockBlocks(100);

// Get a specific block by number or hash
export const getMockBlockByNumberOrHash = (
  numberOrHash: string | number
): Block | undefined => {
  if (typeof numberOrHash === "number") {
    return mockBlocks.find((block) => block.number === numberOrHash);
  } else {
    return mockBlocks.find((block) => block.hash === numberOrHash);
  }
};

// Get a paginated list of blocks
export const getMockBlocks = (page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBlocks = mockBlocks.slice(startIndex, endIndex);

  return {
    items: paginatedBlocks,
    totalCount: mockBlocks.length,
    page,
    pageSize,
    hasMore: endIndex < mockBlocks.length,
  };
};
