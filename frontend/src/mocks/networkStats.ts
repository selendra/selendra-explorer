import type { NetworkStats } from '../types';
import { mockBlocks } from './blocks';
import { mockValidators } from './validators';

// Generate mock network stats
export const generateMockNetworkStats = (): NetworkStats => {
  const latestBlock = mockBlocks.length > 0 ? mockBlocks[0].number : 1000000;
  const activeValidators = mockValidators.filter(v => v.status === 'active').length;
  
  return {
    latestBlock,
    averageBlockTime: 6.5, // seconds
    totalTransactions: 15000000,
    activeAccounts: 50000,
    totalAccounts: 120000,
    gasPrice: '5', // gwei
    totalValueLocked: '250000000', // $250M
    validators: {
      total: mockValidators.length,
      active: activeValidators,
    },
  };
};

// Pre-generated mock network stats for consistent data
export const mockNetworkStats: NetworkStats = generateMockNetworkStats();

// Get the mock network stats
export const getMockNetworkStats = (): NetworkStats => {
  return mockNetworkStats;
};
