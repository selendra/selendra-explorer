import { Block, SubstrateBlock } from "../types";

/**
 * Converts a SubstrateBlock to the frontend Block format for unified display
 */
export const convertSubstrateBlockToBlock = (
  substrateBlock: SubstrateBlock
): Block => {
  return {
    id: `substrate-${substrateBlock.number}`,
    number: substrateBlock.number,
    hash: substrateBlock.hash,
    parentHash: substrateBlock.parent_hash,
    timestamp: (substrateBlock.timestamp * 1000).toString(), // Convert seconds to milliseconds
    transactionCount: substrateBlock.extrinscs_len, // Note: using extrinsics count
    size: 0, // Not available in SubstrateBlock
    gasUsed: "0", // Not applicable for Substrate
    gasLimit: "0", // Not applicable for Substrate
    validator: "", // Not available in current SubstrateBlock structure
    networkType: "wasm" as const,
    stateRoot: substrateBlock.state_root,
    extraData: `Finalized: ${substrateBlock.is_finalize}`,
  };
};

/**
 * Formats timestamp differences between EVM (ms) and Substrate (s)
 */
export const formatBlockTimestamp = (
  timestamp: string | number,
  networkType: "evm" | "wasm"
): string => {
  let timestampMs: number;

  if (networkType === "wasm") {
    // Substrate timestamps are in seconds
    timestampMs =
      typeof timestamp === "string"
        ? parseInt(timestamp) * 1000
        : timestamp * 1000;
  } else {
    // EVM timestamps are in milliseconds
    timestampMs =
      typeof timestamp === "string" ? parseInt(timestamp) : timestamp;
  }

  return new Date(timestampMs).toISOString();
};

/**
 * Gets the appropriate transaction/extrinsic count label based on network type
 */
export const getTransactionCountLabel = (
  networkType: "evm" | "wasm"
): string => {
  return networkType === "wasm" ? "Extrinsics" : "Transactions";
};

/**
 * Determines if a block has transaction-like data based on network type
 */
export const hasTransactionData = (block: Block): boolean => {
  if (block.networkType === "wasm") {
    return block.transactionCount > 0; // For Substrate, this represents extrinsics
  }
  return block.transactionCount > 0; // For EVM, this represents transactions
};
