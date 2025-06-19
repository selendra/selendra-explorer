# Frontend Integration TODO

This document outlines all the tasks needed to integrate the backend API with the frontend explorer application. The backend provides comprehensive REST API endpoints for both EVM and Substrate blockchain data, while the frontend currently uses mock data.

## 🎯 High Priority Tasks

### 1. API Service Overhaul

- [x] **Replace mock API service with real backend integration**
  - [x] Update `src/services/api.ts` to call actual backend endpoints
  - [x] Remove mock data dependencies
  - [x] Implement proper error handling for network failures
  - [x] Add retry logic with exponential backoff
  - [x] Configure base URL from environment variables

### 2. Backend API Response Format Integration

- [ ] **Update data types to match backend response format**
  - [ ] All API responses follow format: `{ success: boolean, data: any | null, error: string | null }`
  - [ ] Update all API calls to handle this response format
  - [ ] Update error handling throughout the application

### 3. Network/Chain Information Integration

- [ ] **Implement network info endpoints**
  - [ ] `GET /api/network` - EVM network information
  - [ ] `GET /api/latest_block` - Latest Substrate block number
  - [ ] `GET /api/get_total_issuance` - Total token issuance
  - [ ] `GET /api/session_era` - Era-Session information
  - [ ] `GET /api/get_total_staking` - Total staking amount
  - [ ] Update `NetworkStats` component with real data

## 🔧 Core Data Integration

### 4. EVM Block Integration

- [ ] **Update EVM block endpoints**
  - [ ] `GET /api/evm/blocks` - Paginated blocks list
  - [ ] `GET /api/evm/blocks/latest` - Latest EVM block
  - [ ] `GET /api/evm/blocks/number/{block_number}` - Block by number
  - [ ] `GET /api/evm/blocks/hash/{block_hash}` - Block by hash
  - [ ] Update `Block` type to match backend response
  - [ ] Update `Blocks.tsx` component to use real data
  - [ ] Update `BlockDetails.tsx` component

### 5. EVM Transaction Integration

- [ ] **Update EVM transaction endpoints**
  - [ ] `GET /api/evm/transactions` - Paginated transactions list
  - [ ] `GET /api/evm/transactions/latest` - Latest transaction
  - [ ] `GET /api/evm/transactions/hash/{tx_hash}` - Transaction by hash
  - [ ] `GET /api/evm/transactions/block/{block_number}` - Transactions by block
  - [ ] Update `Transaction` type to match backend response
  - [ ] Update `Transactions.tsx` component
  - [ ] Update `TransactionDetails.tsx` component

### 6. EVM Account Integration

- [ ] **Update EVM account endpoints**
  - [ ] `GET /api/evm/accounts` - Paginated accounts list
  - [ ] `GET /api/evm/accounts/address/{address}` - Account by address
  - [ ] `GET /api/evm/accounts/balance` - Accounts by balance range
  - [ ] Update `Account` type to match backend response
  - [ ] Update `Accounts.tsx` component
  - [ ] Update `AccountDetails.tsx` component

### 7. EVM Contract Integration

- [ ] **Update EVM contract endpoints**
  - [ ] `GET /api/evm/contracts` - Paginated contracts list
  - [ ] `GET /api/evm/contracts/address/{address}` - Contract by address
  - [ ] `GET /api/evm/contracts/type/{contract_type}` - Contracts by type
  - [ ] `GET /api/evm/contracts/verified` - Verified contracts
  - [ ] Update `Contract` type to match backend response
  - [ ] Update `Contracts.tsx` component
  - [ ] Update `ContractDetails.tsx` component

## 🏗️ Substrate Integration

### 8. Substrate Block Integration

- [ ] **Update Substrate block endpoints**
  - [ ] `GET /api/substrate/blocks` - Paginated substrate blocks
  - [ ] `GET /api/substrate/blocks/latest` - Latest substrate block
  - [ ] `GET /api/substrate/blocks/number/{block_number}` - Block by number
  - [ ] `GET /api/substrate/blocks/hash/{block_hash}` - Block by hash
  - [ ] Create separate `SubstrateBlock` type
  - [ ] Update components to handle both EVM and Substrate blocks

### 9. Substrate Extrinsic Integration

- [ ] **Update Substrate extrinsic endpoints**
  - [ ] `GET /api/substrate/extrinsics` - Paginated extrinsics list
  - [ ] `GET /api/substrate/extrinsics/block/{block_number}` - Extrinsics by block
  - [ ] `GET /api/substrate/extrinsics/signer/{signer}` - Extrinsics by signer
  - [ ] `GET /api/substrate/extrinsics/module` - Extrinsics by module/function
  - [ ] Update `Extrinsics.tsx` component
  - [ ] Update `ExtrinsicDetails.tsx` component
  - [ ] Create proper `Extrinsic` type based on backend response

### 10. Substrate Event Integration

- [ ] **Update Substrate event endpoints**
  - [ ] `GET /api/substrate/events` - Paginated events list
  - [ ] `GET /api/substrate/events/block/{block_number}` - Events by block
  - [ ] `GET /api/substrate/events/module` - Events by module/event name
  - [ ] `GET /api/substrate/events/name/{event_name}` - Events by name
  - [ ] `GET /api/substrate/events/recent` - Recent events
  - [ ] Create `Events.tsx` component (if not exists)
  - [ ] Create `EventDetails.tsx` component

## 🔄 Address Conversion Integration

### 11. Address Conversion Features

- [ ] **Implement address conversion endpoints**
  - [ ] `GET /api/convert/ss58_to_evm_address/{address}` - SS58 to EVM conversion
  - [ ] `GET /api/convert/evm_to_ss58_address/{address}` - EVM to SS58 conversion
  - [ ] Add address conversion utility functions
  - [ ] Add address format detection utilities
  - [ ] Update search functionality to handle both address formats
  - [ ] Add address conversion UI component

## 🔍 Search Functionality Enhancement

### 12. Enhanced Search Implementation

- [ ] **Update search to work with backend data**
  - [ ] Remove mock search implementation
  - [ ] Implement search for blocks (by number/hash)
  - [ ] Implement search for transactions (by hash)
  - [ ] Implement search for accounts/addresses
  - [ ] Implement search for contracts
  - [ ] Add search for extrinsics and events
  - [ ] Update `Search.tsx` component
  - [ ] Add search suggestions/autocomplete

## 📊 Data Display Components

### 13. Update Data Display Components

- [ ] **Update table components for new data structures**
  - [ ] Update `DataTable` component to handle both EVM and Substrate data
  - [ ] Update pagination components
  - [ ] Add proper loading states
  - [ ] Add error states and retry functionality
  - [ ] Update `TimeAgo` component for different timestamp formats (ms vs s)

### 14. Network Type Handling

- [ ] **Implement proper network type switching**
  - [ ] Add network switcher UI component
  - [ ] Update all components to handle network type context
  - [ ] Add EVM/Substrate badges and indicators
  - [ ] Update navigation to support network-specific routes
  - [ ] Handle mixed data display (showing both EVM and Substrate data)

## 🎨 UI/UX Improvements

### 15. Enhanced Data Visualization

- [ ] **Update chart components with real data**
  - [ ] Remove mock chart data
  - [ ] Integrate real transaction volume data
  - [ ] Integrate real block production data
  - [ ] Add network statistics dashboard
  - [ ] Update `Charts.tsx` with backend data

### 16. Real-time Updates (Future Enhancement)

- [ ] **WebSocket integration for live data**
  - [ ] Connect to `ws://localhost:3000/ws` endpoint
  - [ ] Implement real-time block updates
  - [ ] Implement real-time transaction updates
  - [ ] Add live indicators and animations
  - [ ] Update relevant components with live data

## 🔧 Technical Infrastructure

### 17. Error Handling & User Experience

- [ ] **Implement comprehensive error handling**
  - [ ] Create error boundary components
  - [ ] Add network error handling
  - [ ] Add loading states for all API calls
  - [ ] Add empty states for no data scenarios
  - [ ] Implement retry mechanisms
  - [ ] Add user-friendly error messages

### 18. Performance Optimization

- [ ] **Optimize data fetching and caching**
  - [ ] Implement proper React Query configuration
  - [ ] Add appropriate cache times for different data types
  - [ ] Implement data prefetching for common routes
  - [ ] Add infinite scrolling for large datasets
  - [ ] Optimize re-renders with proper memoization

### 19. Type Safety & Validation

- [ ] **Update TypeScript types to match backend**
  - [ ] Create comprehensive API response types
  - [ ] Add runtime type validation for API responses
  - [ ] Update all component prop types
  - [ ] Add proper error types
  - [ ] Create utility types for common patterns

## 🧪 Testing & Quality

### 20. Testing Integration

- [ ] **Update tests for backend integration**
  - [ ] Mock backend API calls in tests
  - [ ] Test error scenarios
  - [ ] Test loading states
  - [ ] Add integration tests
  - [ ] Update component tests with new data structures

### 21. Configuration & Environment

- [ ] **Production configuration**
  - [ ] Add environment variables for API base URL
  - [ ] Configure different endpoints for dev/staging/prod
  - [ ] Add API version handling
  - [ ] Configure CORS settings
  - [ ] Add health check endpoints

## 📋 Specific Backend Response Format Updates

### 22. Backend Response Format Integration

All backend responses follow this format:

```json
{
  "success": boolean,
  "data": any | null,
  "error": string | null
}
```

- [ ] **Update API service to handle this format**
- [ ] **Update all components expecting data directly**
- [ ] **Add proper error handling for `success: false` responses**

### 23. Backend Data Type Mappings

#### EVM Block Backend Response:

```json
{
  "number": 869242,
  "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
  "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "timestamp": 1706610600000, // milliseconds
  "transaction_count": 125,
  "size": 45632,
  "gas_used": 8450000,
  "gas_limit": 15000000,
  "base_fee": 20000000000,
  "burn_fee": 0.125,
  "validator": "0x742d35Cc6634C0532925a3b8D45C55321321321321",
  "extra_data": "0x476574682f76312e302e302f6c696e75782f676f312e342e32",
  "nonce": 12345678,
  "session": 1024,
  "era": 256
}
```

#### EVM Transaction Backend Response:

```json
{
  "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
  "block_number": 869242,
  "timestamp": 1706610600000,  // milliseconds
  "from": "0x742d35Cc6634C0532925a3b8D453211321312131",
  "to": "0x8ba1f109551bD432803012645Hac136c55321321",
  "value": 1000000000000000000,  // wei
  "gas_price": 20000000000,
  "gas_limit": 21000,
  "gas_used": 21000,
  "nonce": 42,
  "status": "Success" | "Failed" | "Pending",
  "transaction_type": "Legacy" | "AccessList" | "DynamicFee",
  "fee": 420000000000,
  "transaction_method": null
}
```

#### Substrate Block Backend Response:

```json
{
  "number": 1962278,
  "timestamp": 1706610600, // seconds (not milliseconds!)
  "is_finalize": true,
  "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
  "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "state_root": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "extrinsics_root": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
  "extrinscs_len": 15, // note the typo in backend - 'extrinscs'
  "event_len": 42
}
```

- [ ] **Update frontend types to match these exact field names and formats**
- [ ] **Handle timestamp differences (ms vs s) between EVM and Substrate**
- [ ] **Handle snake_case vs camelCase conversion**

## 🚀 Implementation Priority

### Phase 1 (Critical - Complete First)

1. API Service Overhaul (#1)
2. Backend API Response Format Integration (#2)
3. Network Information Integration (#3)
4. EVM Block Integration (#4)

### Phase 2 (Core Features)

5. EVM Transaction Integration (#5)
6. EVM Account Integration (#6)
7. EVM Contract Integration (#7)
8. Error Handling & UX (#17)

### Phase 3 (Substrate Features)

9. Substrate Block Integration (#8)
10. Substrate Extrinsic Integration (#9)
11. Substrate Event Integration (#10)
12. Address Conversion Integration (#11)

### Phase 4 (Enhancement)

13. Enhanced Search (#12)
14. Data Display Components (#13)
15. Network Type Handling (#14)
16. Enhanced Data Visualization (#15)

### Phase 5 (Polish)

17. Performance Optimization (#18)
18. Type Safety & Validation (#19)
19. Testing Integration (#20)
20. Real-time Updates (#16)

## 📝 Notes

- **Backend Base URL**: `http://localhost:3000/api`
- **WebSocket URL**: `ws://localhost:3000/ws`
- **Pagination**: Backend uses `limit` and `offset` parameters
- **Network Types**: Backend distinguishes between EVM and Substrate data
- **Address Formats**: Support both SS58 (Substrate) and H160 (EVM) addresses
- **Timestamp Formats**: EVM uses milliseconds, Substrate uses seconds
- **Field Naming**: Backend uses snake_case, frontend uses camelCase

## 🎯 Success Criteria

The integration is complete when:

- [ ] All mock data is removed from the frontend
- [ ] All pages display real data from the backend
- [ ] Both EVM and Substrate data are properly displayed
- [ ] Search functionality works with real data
- [ ] Error handling provides good user experience
- [ ] Address conversion works properly
- [ ] Performance is acceptable with real data loads
- [ ] All TypeScript types are accurate and safe

This comprehensive TODO list should guide the complete integration of the backend API with the frontend application, transforming it from a mock-based explorer to a fully functional blockchain explorer.
