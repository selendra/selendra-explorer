import type { Validator } from '../types';
import { getRandomAddress, getRandomInt } from '../utils/mockHelpers';

// Common validator names for more realistic data
const validatorNames = [
  'Selendra Foundation',
  'Staking Capital',
  'Validator Pro',
  'Secure Node',
  'Blockchain Guardians',
  'Crypto Validators',
  'Node Masters',
  'Staking Hub',
  'Validator One',
  'Blockchain Sentinels',
  'Proof of Stake',
  'Consensus Keepers',
  'Finality Validators',
  'Block Producers',
  'Stake & Earn',
];

// Generate a random validator
export const generateMockValidator = (index: number): Validator => {
  // Determine validator status with weighted probabilities
  const rand = Math.random();
  let status: 'active' | 'waiting' | 'inactive';
  
  if (rand < 0.7) {
    // 70% chance of being active
    status = 'active';
  } else if (rand < 0.9) {
    // 20% chance of being waiting
    status = 'waiting';
  } else {
    // 10% chance of being inactive
    status = 'inactive';
  }
  
  // Random validator name
  const name = validatorNames[Math.floor(Math.random() * validatorNames.length)];
  
  // Add some variation to the names
  const nameWithVariation = `${name} ${Math.floor(Math.random() * 100)}`;
  
  const totalStake = (Math.random() * 1000000).toFixed(0);
  const selfStake = (Math.random() * 100000).toFixed(0);
  
  return {
    id: `validator-${index}`,
    address: getRandomAddress('wasm'),
    name: nameWithVariation,
    totalStake,
    selfStake,
    commission: (Math.random() * 20).toFixed(2),
    delegatorCount: getRandomInt(1, 1000),
    uptime: 95 + Math.random() * 5, // 95-100% uptime
    status,
    blocksProduced: getRandomInt(100, 10000),
    rewardPoints: getRandomInt(1000, 100000),
  };
};

// Generate a list of mock validators
export const generateMockValidators = (count: number): Validator[] => {
  const validators: Validator[] = [];
  
  for (let i = 0; i < count; i++) {
    validators.push(generateMockValidator(i));
  }
  
  return validators;
};

// Pre-generated mock validators for consistent data
export const mockValidators: Validator[] = generateMockValidators(100);

// Get a specific validator by address
export const getMockValidatorByAddress = (address: string): Validator | undefined => {
  return mockValidators.find(validator => validator.address === address);
};

// Get a paginated list of validators
export const getMockValidators = (page: number, pageSize: number, status?: 'active' | 'waiting' | 'inactive') => {
  let filteredValidators = mockValidators;
  
  if (status) {
    filteredValidators = mockValidators.filter(validator => validator.status === status);
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedValidators = filteredValidators.slice(startIndex, endIndex);
  
  return {
    items: paginatedValidators,
    totalCount: filteredValidators.length,
    page,
    pageSize,
    hasMore: endIndex < filteredValidators.length
  };
};
