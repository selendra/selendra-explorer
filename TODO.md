# Selendra Blockchain Explorer - Task List

## Project Objective

Develop a blockchain explorer for the Selendra network. Selendra is an EVM-compatible, Layer 1 Substrate-based blockchain. The explorer will support both EVM and Wasm smart contracts, allowing users to view blocks, transactions, accounts, contracts, tokens, and validators. Functional requirements include wallet integration for asset management and contract interaction, a staking dashboard, contract bookmarking, and code snippet storage. The goal is a maintainable and scalable explorer for the Selendra blockchain.

## Implementation Phases and Tasks

(Derived from `implementation-plan.md` - check items as they are completed and verified)

### Phase 1: Core Infrastructure Setup (Partially Complete)

**Backend Infrastructure:**

- [ ] **Complete Database Schema & Migrations:**
  - [ ] Review and finalize all database tables (ensure comprehensive EVM & Wasm support).
  - [ ] Add necessary indexes for performance optimization based on query patterns.
  - [ ] Ensure all migrations are up-to-date and correctly versioned.
  - [ ] Set up database backup and recovery procedures (consider this for deployment).
- [ ] **Implement Blockchain Data Indexing Services (Initial Setup):**
  - [ ] Basic structure for EVM block/transaction indexing service using ethers-rs.
  - [ ] Basic structure for Substrate block/transaction indexing service using Polkadot.js or similar.
- [ ] **Synchronization with Selendra Blockchain Nodes:**
  - [ ] Establish and test RPC connections to Selendra endpoints (e.g., https://rpcx.selendra.org, https://rpc.selendra.org).
  - [ ] Implement basic logic for fetching initial data.
- [ ] **API Route Placeholders:**
  - [ ] API route structure defined. (As per `implementation-plan.md`)
  - [ ] Refine API route definitions based on finalized frontend needs.

**Frontend Infrastructure:**

- [ ] **Basic Page Structure & Routing:** (As per `implementation-plan.md`)
- [ ] **Context Providers (API & Wallet):** (As per `implementation-plan.md`)
- [ ] **Component Structure (Layout & Pages):** (As per `implementation-plan.md`)
- [ ] **Complete API Context and Service Implementations:**
  - [ ] Implement frontend services to consume all backend API endpoints.
- [ ] **Wallet Connection (Initial Setup):**
  - [ ] Basic UI and logic for connecting EVM wallets (e.g., MetaMask).
  - [ ] Basic UI and logic for connecting Substrate wallets (e.g., Polkadot.js extension).
- [ ] **Basic UI Components & Layout:**
  - [ ] Develop a consistent and responsive main layout.
  - [ ] Create common UI components (buttons, inputs, cards, tables, etc.).
- [ ] **Build and Deployment Pipeline (Initial Setup):**
  - [ ] Configure Vite for development and production builds.
  - [ ] Set up basic CI/CD (e.g., GitHub Actions) for automated linting, testing, and building.

### Phase 2: Data Indexing and API Implementation

**Backend:**

- [ ] **Block and Transaction Indexing:**
  - [ ] **EVM Indexing:**
    - [ ] Implement robust EVM block indexing service (ethers-rs).
    - [ ] Implement EVM transaction and event indexing.
    - [ ] Handle chain reorganizations.
  - [ ] **Substrate/Wasm Indexing:**
    - [ ] Implement robust Substrate block indexing (Polkadot.js/substrate-api-sidecar).
    - [ ] Implement Substrate transaction, extrinsic, and event indexing.
    - [ ] Handle Wasm contract calls and events.
  - [ ] **Data Storage:**
    - [ ] Ensure efficient storage of indexed data in PostgreSQL.
    - [ ] Implement conflict resolution and data integrity checks.
  - [ ] **Real-time Updates:**
    - [ ] Add real-time updates for new blocks and transactions (e.g., WebSockets or polling).
- [ ] **API Endpoint Implementation:**
  - [ ] **Blocks:**
    - [ ] GET /blocks
    - [ ] GET /blocks/{blockNumberOrHash}
  - [ ] **Transactions:**
    - [ ] GET /transactions
    - [ ] GET /transactions/{txHash}
    - [ ] Endpoints for EVM-specific transaction details.
    - [ ] Endpoints for Substrate-specific extrinsic details.
  - [ ] **Accounts:**
    - [ ] GET /accounts/{address} (supporting both EVM and Substrate formats)
    - [ ] GET /accounts/{address}/transactions
    - [ ] GET /accounts/{address}/token_balances (EVM ERC20, Substrate Assets Pallet)
    - [ ] GET /accounts/{address}/contract_interactions
  - [ ] **Contracts:**
    - [ ] GET /contracts (list with filters for EVM/Wasm)
    - [ ] GET /contracts/{contractAddress} (unified view if possible, or type-specific)
    - [ ] GET /wasm-contracts (list of Wasm contracts)
    - [ ] GET /wasm-contracts/{contractAddress} (Wasm contract details)
    - [ ] POST /contracts/{contractAddress}/verify (for EVM and Wasm)
    - [ ] GET /contracts/{contractAddress}/source_code (if verified)
    - [ ] GET /contracts/{contractAddress}/abi_or_metadata (if verified)
  - [ ] **Tokens:**
    - [ ] GET /tokens (list ERC20, ERC721, Substrate assets)
    - [ ] GET /tokens/{tokenAddressOrAssetId}
    - [ ] GET /tokens/{tokenAddressOrAssetId}/holders
    - [ ] GET /tokens/{tokenAddressOrAssetId}/transfers
  - [ ] **Validators & Staking (Substrate):**
    - [ ] GET /validators
    - [ ] GET /validators/{validatorId}
    - [ ] GET /staking/info (general staking overview)
    - [ ] GET /accounts/{address}/staking (user-specific staking info)
  - [ ] **Search:**
    - [ ] GET /search?query={block/tx/account/contract}
  - [ ] **General API Features:**
    - [ ] Implement pagination for all list endpoints.
    - [ ] Implement filtering and sorting options.
    - [ ] Implement comprehensive error handling and consistent response formats.
    - [ ] Add logging for all API requests and critical operations.
    - [ ] Secure sensitive endpoints if any (e.g., for future admin features).

### Phase 3: Frontend Implementation

**UI/UX Development:**

- [ ] **Home Page:**
  - [ ] Display network statistics (current block, transaction count, active validators, etc.).
  - [ ] Recent blocks and transactions feed.
  - [ ] Search bar.
- [ ] **Block Explorer Pages:**
  - [ ] List of blocks (paginated).
  - [ ] Detailed block view (block info, transactions in block).
- [ ] **Transaction Explorer Pages:**
  - [ ] List of transactions (paginated, filterable by EVM/Wasm).
  - [ ] Detailed transaction view (sender, receiver, value, gas, status, logs/events).
- [ ] **Extrinsic Explorer Pages:**
  - [ ] List of extrinsics (paginated, filterable by section/method).
  - [ ] Detailed extrinsic view (signer, section, method, args, status).
- [ ] **Account Explorer Pages:**
  - [ ] Account overview (balance, transaction count).
  - [ ] List of transactions for an account.
  - [ ] Token balances (ERC20, Substrate native/custom assets).
  - [ ] Wasm contract interactions.
- [ ] **Contract Explorer Pages:**
  - [ ] List of contracts (filterable by EVM/Wasm, verified status).
  - [ ] Detailed contract view:
    - [ ] General info (address, creator, type).
    - [ ] Verification status & UI to submit for verification.
    - [ ] Display source code and ABI/metadata (if verified).
    - [ ] UI for reading contract state (read methods).
    - [ ] UI for writing to contracts (write methods, requires wallet integration).
    - [ ] Transaction history for the contract.
    - [ ] Events emitted by the contract.
- [ ] **Token Pages:**
  - [ ] List of known tokens.
  - [ ] Detailed token page (info, holders, transfers).
- [ ] **Search Functionality:**
  - [ ] Implement UI for global search (blocks, txs, accounts, contracts).
  - [ ] Display search results clearly.
- [ ] **UI Components:**
  - [ ] Finalize all reusable UI components.
  - [ ] Ensure responsiveness across devices.
  - [ ] Implement dark/light mode support.
  - [ ] Implement accessibility features (ARIA attributes, keyboard navigation).
- [ ] **State Management:**
  - [ ] Refine and optimize React Contexts or adopt a dedicated state management library if needed (e.g., Zustand, Redux Toolkit).
- [ ] **Error Handling & Loading States:**
  - [ ] Implement user-friendly loading indicators for all data fetching.
  - [ ] Display clear error messages for API errors or invalid user input.

### Phase 4: Advanced Features

**Wallet Integration (Full):**

- [] **EVM Wallet Connection:**
  - [] Robust connection with MetaMask and other common EVM wallets (e.g., using Web3Modal or RainbowKit).
  - [] Display connected account and balance.
  - [] Sign and send transactions for contract interactions.
- [] **Substrate Wallet Connection:**
  - [] Robust connection with Polkadot.js extension and other Substrate wallets.
  - [] Display connected account and balance.
  - [] Sign and send extrinsics for contract interactions and staking.
- [ ] **Asset Management:**
  - [ ] Unified view of assets (native, EVM tokens, Substrate assets).
  - [ ] Send/transfer assets (native, tokens).
- [ ] **Transaction Submission UI:**
  - [ ] Clear UI for constructing and submitting transactions/extrinsics.
  - [ ] Gas estimation and fee display.
- [ ] **Account Management & Security:**
  - [ ] Display transaction history initiated via the explorer.
  - [ ] Securely handle private key interactions (delegated to wallets).

**Staking Dashboard (Substrate):**

- [ ] **Validator List & Details:**
  - [ ] Display list of active and waiting validators.
  - [ ] Detailed page for each validator (commission, points, nominators).
- [ ] **Staking Management:**
  - [ ] UI for nominating validators.
  - [ ] UI for bonding/unbonding funds.
  - [ ] UI for withdrawing unbonded funds.
- [ ] **Reward Tracking:**
  - [ ] Display staking rewards history.
  - [ ] Estimated future rewards.
- [ ] **Delegation Management (if applicable to Selendra's staking model).**

**Contract Management:**

- [ ] **Saved/Favorite Contracts:**
  - [ ] Backend API to save/unsave favorite contracts per user (requires user accounts or local storage).
  - [ ] Frontend UI to mark/unmark contracts as favorite.
  - [ ] Page to list user's favorite contracts.
- [ ] **Code Storage (Snippets):**
  - [ ] Backend API to save/manage code snippets (e.g., common contract interaction scripts) per user.
  - [ ] Frontend UI to create, edit, delete, and run (if feasible) code snippets.
- [ ] **Contract Deployment UI (Optional - Ambitious):**
  - [ ] UI to deploy pre-compiled EVM contracts.
  - [ ] UI to deploy pre-compiled Wasm contracts.
- [ ] **Contract Interaction History:**
  - [ ] Log interactions made through the explorer for the connected user.

### Phase 5: Testing, Optimization, and Deployment

**Testing:**

- [ ] **Unit Testing:**
  - [ ] Backend: Test all API endpoints, services, and utility functions (Rust `#[test]`).
  - [ ] Frontend: Test all components, hooks, and utility functions (e.g., Jest, React Testing Library).
- [ ] **Integration Testing:**
  - [ ] Test backend-frontend API integrations.
  - [ ] Test blockchain data indexing accuracy.
  - [ ] Test wallet connection and transaction signing flows.
  - [ ] Test contract interaction flows for both EVM and Wasm.
- [ ] **End-to-End Testing:**
  - [ ] Test complete user flows (e.g., Cypress, Playwright).
  - [ ] Test performance under load.
  - [ ] Test responsiveness on different screen sizes.
- [ ] **User Acceptance Testing (UAT):**
  - [ ] Conduct UAT on a staging environment connected to Selendra testnet.

**Optimization:**

- [ ] **Backend Performance:**
  - [ ] Optimize database queries (analyze query plans, add/tune indexes).
  - [ ] Profile and optimize slow API endpoints.
  - [ ] Implement caching strategies where appropriate (e.g., Redis).
- [ ] **Frontend Performance:**
  - [ ] Optimize React component rendering (memoization, virtualized lists).
  - [ ] Code splitting and lazy loading of routes/components.
  - [ ] Optimize asset delivery (image compression, browser caching).
- [ ] **Security Hardening:**
  - [ ] Review for common web vulnerabilities (XSS, CSRF, SQLi, etc.).
  - [ ] Implement appropriate security headers.
  - [ ] Regularly update dependencies.

**Deployment:**

- [ ] **Development Environment:**
  - [] Local development setup functional.
  - [ ] Enhance CI/CD pipeline for automated testing and deployment previews.
- [ ] **Staging Environment:**
  - [ ] Set up a staging environment mirroring production.
  - [ ] Deploy to staging for UAT and pre-production testing.
- [ ] **Production Environment:**
  - [ ] Prepare production server infrastructure.
  - [ ] Configure domain, SSL certificates.
  - [ ] Deploy to production (connected to Selendra mainnet).
  - [ ] Implement monitoring and alerting (Prometheus, Grafana, Sentry).
  - [ ] Finalize backup and recovery procedures for database and application state.
