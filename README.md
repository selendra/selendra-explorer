# Selendra Blockchain Explorer

A comprehensive blockchain explorer for Selendra—an EVM-compatible, L1 Substrate-based network designed for developers and enterprise adoption in Cambodia. This explorer supports both EVM and Wasm smart contracts, providing a unified interface for exploring the Selendra blockchain.

## Features

- **Dual Contract Support**: Explore both EVM and Wasm smart contracts
- **Wallet Integration**: Connect your wallet to manage assets and interact with contracts
- **Comprehensive Data**: View blocks, transactions, accounts, contracts, tokens, and validators
- **Staking Dashboard**: Manage your staking positions and track rewards
- **Contract Management**: Save and organize your favorite contracts
- **Code Storage**: Save and manage contract code snippets

## Tech Stack

### Backend

- Rust with Actix-web framework
- Diesel ORM with PostgreSQL
- Ethers-rs for Ethereum interaction
- Substrate/Polkadot.js for Substrate interaction

### Frontend

- React with TypeScript
- Vite for fast development
- React Router for navigation
- Tailwind CSS for styling
- Polkadot.js and Ethers.js for blockchain interaction

## Getting Started

### Prerequisites

- Rust (latest stable)
- Node.js (v16+)
- PostgreSQL
- Access to a Selendra node (local or remote)

### Backend Setup

1. Clone the repository:

   ```
   git clone https://github.com/selendra/selendra-explorer.git
   cd selendra-explorer
   ```

2. Set up the database:

   ```
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Run migrations:

   ```
   diesel setup
   diesel migration run
   ```

4. Build and run the backend:
   ```
   cargo run
   ```

### Frontend Setup

1. Install dependencies:

   ```
   cd frontend
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Project Structure

```
selendra-explorer/
├── backend/
│   ├── migrations/       # Database migrations
│   ├── src/
│   │   ├── api/          # API endpoints
│   │   ├── db/           # Database connection and models
│   │   ├── models/       # Data models
│   │   ├── schema.rs     # Database schema
│   │   ├── services/     # Business logic
│   │   └── main.rs       # Application entry point
│   └── Cargo.toml        # Rust dependencies
│
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── contexts/     # React contexts
    │   ├── pages/        # Application pages
    │   ├── App.tsx       # Main application component
    │   └── main.tsx      # Entry point
    └── package.json      # JavaScript dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Selendra Network for their support
- The Substrate and Ethereum communities for their excellent documentation
- All contributors who have helped shape this project
