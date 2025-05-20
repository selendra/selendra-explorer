import type { Contract, NetworkType } from "../types/index";
import {
  generateRandomHash,
  getRandomAddress,
  getRandomInt,
} from "../utils/mockHelpers";

// Common contract names for more realistic data
const contractNames = [
  "Token",
  "Marketplace",
  "Staking",
  "Governance",
  "Vault",
  "Bridge",
  "Swap",
  "Lending",
  "Oracle",
  "NFT",
  "MultiSig",
  "Timelock",
  "Auction",
  "Escrow",
  "Lottery",
];

// Generate a random contract
export const generateMockContract = (
  index: number,
  networkType: NetworkType = Math.random() > 0.5 ? "evm" : "wasm"
): Contract => {
  const address = getRandomAddress(networkType);
  const creator = getRandomAddress(networkType);
  const creationTransaction = generateRandomHash();

  // Random date within the last year
  const createdAt = new Date(
    Date.now() - getRandomInt(1, 365) * 24 * 60 * 60 * 1000
  ).toISOString();

  // 30% chance of being verified
  const verified = Math.random() < 0.3;
  const verifiedAt = verified
    ? new Date(
        Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000
      ).toISOString()
    : undefined;

  // Random contract name
  const name = contractNames[Math.floor(Math.random() * contractNames.length)];

  // Random contract type
  const contractTypes =
    networkType === "evm"
      ? ["ERC20", "ERC721", "ERC1155", "Custom"]
      : ["PSP22", "PSP34", "Custom"];
  const contractType =
    contractTypes[Math.floor(Math.random() * contractTypes.length)];

  return {
    id: `contract-${index}`,
    address,
    creator,
    creationTransaction,
    createdAt,
    networkType,
    name: `${name}${Math.floor(Math.random() * 1000)}`,
    verified,
    verifiedAt,
    sourceCode: verified
      ? "pragma solidity ^0.8.0;\n\ncontract Example {\n    // Mock source code\n}"
      : undefined,
    abi: verified
      ? [
          {
            type: "function",
            name: "transfer",
            inputs: [
              { name: "to", type: "address" },
              { name: "value", type: "uint256" },
            ],
          },
        ]
      : undefined,
    bytecode:
      "0x" +
      Array(100)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join(""),
    contractType,
  };
};

// Generate a list of mock contracts
export const generateMockContracts = (count: number): Contract[] => {
  const contracts: Contract[] = [];

  for (let i = 0; i < count; i++) {
    contracts.push(generateMockContract(i));
  }

  return contracts;
};

// Pre-generated mock contracts for consistent data
export const mockContracts: Contract[] = generateMockContracts(100);

// Get a specific contract by address
export const getMockContractByAddress = (
  address: string
): Contract | undefined => {
  return mockContracts.find((contract) => contract.address === address);
};

// Get a paginated list of contracts
export const getMockContracts = (
  page: number,
  pageSize: number,
  networkType?: NetworkType
) => {
  let filteredContracts = mockContracts;

  if (networkType) {
    filteredContracts = mockContracts.filter(
      (contract) => contract.networkType === networkType
    );
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  return {
    items: paginatedContracts,
    totalCount: filteredContracts.length,
    page,
    pageSize,
    hasMore: endIndex < filteredContracts.length,
  };
};
