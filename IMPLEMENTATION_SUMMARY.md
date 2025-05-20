# Selendra Explorer UI Implementation Plan

## Overview

This document outlines our approach to building a beautiful, user-friendly blockchain explorer UI for Selendra using mock data. By focusing on UI/UX first with mock data, we can rapidly iterate on design and user experience before integrating with actual blockchain data.

## Design Philosophy

Our design approach is inspired by best-in-class blockchain explorers while tailoring the experience specifically for Selendra's dual EVM/Wasm capabilities and Cambodian user base:

- **Clean, Modern Aesthetic**: Minimalist design with ample whitespace and clear typography
- **Intuitive Navigation**: Logical information hierarchy with breadcrumbs and consistent navigation patterns
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliance with proper contrast ratios and keyboard navigation
- **Performance-First**: Optimized loading times with skeleton screens and progressive loading
- **Selendra Brand Identity**: Incorporating Selendra's color palette and design language

## UI Components & Pages

### 1. Home Page

- **Network Overview Dashboard**
  - Key metrics with animated counters (blocks, transactions, accounts, validators)
  - Network health indicators with visual status indicators
  - Price chart with customizable time ranges (mock data)
  - Latest blocks and transactions in card-based layout
- **Search Component**
  - Prominent, intelligent search bar with autocomplete
  - Multi-entity search (blocks, transactions, accounts, contracts)
  - Recent search history and search suggestions

### 2. Block Explorer

- **Block List View**
  - Infinite-scroll table with smooth animations
  - Visual indicators for block finality status
  - Time-ago timestamps with hover for exact time
  - Micro-visualizations for block size and transaction count
- **Block Detail View**
  - Header with key block information and navigation
  - Visual representation of block position in chain
  - Expandable sections for transactions, events, and logs
  - JSON view option for developers
  - Copy-to-clipboard functionality for all data points

### 3. Transaction Explorer

- **Transaction List**
  - Filterable by transaction type (EVM/Wasm)
  - Status indicators with tooltips explaining transaction states
  - Visual differentiation between transaction types
  - Compact and expanded view options
- **Transaction Detail**
  - Visual transaction flow diagram
  - Decoded input data in human-readable format
  - Gas usage visualization
  - Event timeline for transaction lifecycle
  - Related transactions suggestion

### 4. Account Explorer

- **Account Overview**
  - Balance history chart with mock data
  - Visual representation of account type (EOA, Contract, Substrate)
  - Activity heatmap showing transaction frequency
  - Assets portfolio breakdown with pie chart
- **Account Transactions**
  - Categorized transaction history (transfers, contract interactions, etc.)
  - Filterable timeline view
  - Transaction impact indicators (positive/negative value changes)

### 5. Contract Explorer

- **Contract List**
  - Categorized by contract type (ERC20, ERC721, Custom, Wasm)
  - Activity indicators showing recent interaction levels
  - Verification status badges
- **Contract Detail**
  - Interactive contract visualization showing relationships
  - Read/Write interface with form validation and helpful tooltips
  - Source code viewer with syntax highlighting
  - Event log visualization

### 6. Token Explorer

- **Token Overview**
  - Token metadata with logo and social links
  - Price chart with mock historical data
  - Supply distribution visualization
  - Top holders table with percentage holdings
- **Token Transfers**
  - Transfer visualization showing flow between accounts
  - Filterable transfer history

### 7. Validator Dashboard

- **Validator List**
  - Performance metrics with visual indicators
  - Staking return calculator
  - Uptime visualization
- **Validator Detail**
  - Historical performance charts
  - Delegator list with stake amounts
  - Commission history

## Mock Data Implementation

### Mock Data Strategy

- Create comprehensive JSON fixtures for all entity types
- Implement realistic data relationships between entities
- Generate time-series data for charts and historical views
- Simulate network latency for realistic loading states
- Include edge cases and error states in mock data

### Mock API Service

- Implement service layer that mimics actual API responses
- Add configurable delay to simulate network conditions
- Include pagination, filtering, and sorting capabilities
- Provide both success and error response scenarios

## UI Best Practices from Top Blockchain Explorers

### From Etherscan

- Clean transaction receipt design with clear status indicators
- Effective use of tabs to organize related information
- Copy-to-clipboard functionality throughout
- Verified contract badge system

### From Subscan

- Elegant data visualization for staking and governance
- Effective use of cards for displaying complex information
- Intuitive mobile navigation

### From Blockscout

- Dark/light mode toggle with smooth transitions
- Interactive transaction graphs
- Decoded contract interactions

### From Polkascan

- Effective handling of specialized substrate data
- Clear visualization of on-chain governance

## Technical Implementation Plan

### 1. Setup & Foundation (Week 1)

- Initialize React project with TypeScript and Vite
- Set up Tailwind CSS with custom Selendra theme
- Create component library and design system
- Implement responsive layout templates
- Set up mock data services and fixtures

### 2. Core Components (Week 2)

- Develop reusable UI components:
  - Data tables with sorting/filtering
  - Search components with autocomplete
  - Block and transaction cards
  - Chart components for time-series data
  - Status indicators and badges
  - Navigation components

### 3. Page Implementation (Weeks 3-4)

- Implement main pages with mock data:
  - Home/Dashboard
  - Block explorer (list and detail views)
  - Transaction explorer (list and detail views)
  - Account explorer
  - Contract explorer
  - Token explorer
  - Validator dashboard

### 4. Advanced UI Features (Week 5)

- Implement dark/light mode
- Add animations and transitions
- Create interactive visualizations
- Implement advanced search functionality
- Add responsive optimizations for mobile

### 5. Testing & Refinement (Week 6)

- Conduct usability testing with mock data
- Optimize performance (lazy loading, code splitting)
- Implement accessibility improvements
- Add comprehensive error states and empty states
- Polish animations and micro-interactions

## Next Steps After UI Implementation

### 1. API Integration

- Replace mock services with actual API calls
- Implement proper error handling for API responses
- Add loading states for real network conditions

### 2. Wallet Integration

- Integrate MetaMask for EVM interactions
- Integrate Polkadot.js for Substrate interactions
- Implement transaction signing flow

### 3. Real-time Updates

- Add WebSocket connections for live data
- Implement notification system for updates

### 4. Performance Optimization

- Implement caching strategies
- Optimize for large datasets
- Add progressive loading for heavy pages
