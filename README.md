# Selendra Explorer

A comprehensive blockchain explorer for the Selendra network, supporting both EVM and WebAssembly (Wasm) smart contracts.

![Selendra Explorer](frontend/public/sel/coin.png)

## Overview

Selendra Explorer provides a comprehensive interface for exploring the Selendra blockchain. It supports both EVM and Wasm smart contracts, offering a unified experience for all users. The explorer is designed with a focus on usability, performance, and visual appeal.

### Key Features

- **Dual Contract Support:** Seamlessly explore both EVM and Wasm smart contracts
- **Comprehensive Data:** View blocks, transactions, accounts, contracts, tokens, and validators
- **Interactive Analytics:** Visual charts and statistics for blockchain metrics
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **API Access:** Programmatic access to blockchain data

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **State Management:** React Context API
- **Charts & Visualization:** Chart.js
- **Animations:** Framer Motion
- **API Integration:** REST API

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # UI components
│   │   ├── charts/  # Chart components
│   │   ├── data/    # Data display components
│   │   ├── layout/  # Layout components
│   │   └── ui/      # Reusable UI elements
│   ├── contexts/    # React context providers
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── types/       # TypeScript type definitions
│   └── utils/       # Utility functions
├── package.json     # Dependencies and scripts
└── tailwind.config.js # Tailwind CSS configuration
```

## Color Palette

Selendra Explorer uses a carefully crafted color palette based on the Selendra branding:

- **Primary:** Purple (#8C30F5) - Used for EVM-related elements
- **Secondary:** Blue/Teal (#0CCBD6) - Used for Wasm-related elements
- **Navy:** Dark Blue (#1A237E) - Used for accents and highlights
- **Supporting Colors:** Success green, warning amber, danger red, and information blue

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/selendra-explorer.git
   cd selendra-explorer
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Documentation

The Selendra Explorer provides a comprehensive API for developers. The API documentation is available at the `/api` endpoint of the explorer.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Selendra Foundation for their support and guidance
- The Substrate and Ethereum communities for their excellent documentation and tools 
