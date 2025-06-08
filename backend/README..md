# Blockchain REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## Overview
This API provides access to blockchain data including network information, blocks, transactions, accounts, and contracts. All endpoints return JSON responses and support standard HTTP methods.

---

## Data Types and Enums

### TransactionStatus
- `"Success"`: Transaction executed successfully
- `"Failed"`: Transaction failed during execution
- `"Pending"`: Transaction is pending confirmation

### TransactionType
- `"Legacy"` (0): Legacy transaction format
- `"AccessList"` (1): EIP-2930 Access List transaction
- `"DynamicFee"` (2): EIP-1559 Dynamic Fee transaction

### NetworkType
- `"Evm"`: Ethereum Virtual Machine compatible network
- `"Substrate"`: Substrate-based network

### AddressType
- `"SS58"`: Substrate address format
- `"H160"`: Ethereum address format

### ContractType
- `"ERC20"`: ERC-20 token contract
- `"ERC721"`: ERC-721 NFT contract
- `"ERC1155"`: ERC-1155 multi-token contract
- `"DEX"`: Decentralized exchange contract
- `"LendingProtocol"`: Lending protocol contract
- `"Proxy"`: Proxy contract
- `"Oracle"`: Oracle contract
- `"Unknown"`: Unidentified contract type

---

## Field Descriptions

### Network Fields
- `chain_id`: Network chain identifier (integer)
- `gas_price`: Current base gas price in wei
- `max_priority_fee`: Maximum priority fee per gas (optional, in wei)
- `max_fee`: Maximum fee per gas (optional, in wei)
- `latest_block_number`: Most recent block number
- `syncing`: Boolean indicating if the node is currently syncing

### Block Fields
- `id`: Unique identifier for the block (format: "block:{number}")
- `number`: Sequential block number starting from 0
- `hash`: Unique block hash (64-character hex string with 0x prefix)
- `parent_hash`: Hash of the previous block
- `timestamp`: Unix timestamp in milliseconds
- `transaction_count`: Number of transactions in the block
- `size`: Block size in bytes
- `gas_used`: Total gas consumed by all transactions in the block
- `gas_limit`: Maximum gas allowed for the block
- `base_fee`: Base fee per gas unit (in wei)
- `burn_fee`: Amount of fees burned (as decimal)
- `validator`: Address of the block validator/miner
- `extra_data`: Additional data included by the validator (hex string)
- `nonce`: Proof-of-work nonce (null for non-PoW blocks)
- `session`: Session identifier
- `era`: Era identifier

### Transaction Fields
- `id`: Unique identifier for the transaction (format: "transaction:{id}")
- `hash`: Unique transaction hash (64-character hex string with 0x prefix)
- `block_number`: Block number containing this transaction
- `timestamp`: Unix timestamp in milliseconds when transaction was included
- `from`: Sender's address (42-character hex string with 0x prefix)
- `to`: Recipient's address (null for contract creation)
- `value`: Amount transferred in wei (smallest unit)
- `gas_price`: Price per gas unit in wei
- `gas_limit`: Maximum gas allowed for this transaction
- `gas_used`: Actual gas consumed by the transaction
- `nonce`: Transaction nonce (prevents replay attacks)
- `status`: Transaction execution status (see TransactionStatus enum)
- `transaction_type`: Type of transaction (see TransactionType enum)
- `network_type`: Network type (see NetworkType enum)
- `input`: Transaction input data (hex string, null if none)
- `fee`: Total transaction fee paid (gas_used × gas_price)
- `transaction_method`: Method signature for contract calls (null for transfers)

### Account Fields
- `address`: Account address (format depends on address_type)
- `balance_token`: Account balance in token units (decimal)
- `nonce`: Account nonce (number of transactions sent)
- `is_contract`: Boolean indicating if address is a contract
- `address_type`: Address format type (see AddressType enum)
- `created_at`: Unix timestamp when account was first seen
- `last_activity`: Unix timestamp of last account activity

### Contract Fields
- `address`: Contract address
- `contract_type`: Type of contract (see ContractType enum)
- `name`: Contract name (optional)
- `symbol`: Contract symbol (optional)
- `decimals`: Number of decimal places for tokens (optional)
- `total_supply`: Total token supply (optional, as string)
- `is_verified`: Boolean indicating if contract is verified
- `creator_info`: Contract creation information (optional)

### Contract Creation Info Fields
- `contract_address`: Address of the created contract
- `creator_address`: Address that created the contract (optional)
- `transaction_hash`: Hash of creation transaction (optional)
- `block_number`: Block number where contract was created
- `timestamp`: Creation timestamp
- `creation_bytecode`: Bytecode used to create the contract

---

## Network Endpoints

### Get Network Information
Retrieve current network status and configuration information.

**Endpoint:** `GET /network`

**Example Request:**
```
GET /api/network
```

**Response:**
```json
{
  "chain_id": 1,
  "gas_price": 20000000000,
  "max_priority_fee": 2000000000,
  "max_fee": 30000000000,
  "latest_block_number": 869242,
  "syncing": false
}
```

### Get Latest Block Information

Retrieve the latest block number from the blockchain.

**Endpoint:** `GET /latest_block`

**Example Request:**
```
GET /api/latest_block
```

**Response:**
```json
{
  "success": true,
  "data": 1962278,
  "error": null
}
```

**Response Fields:**
- `success` (boolean): Indicates whether the request was successful
- `data` (u32): The latest block number
- `error` (null|string): Error message if the request failed, null if successful

### Get total issuance Information

Retrieve the total issuance amount from the blockchain.

**Endpoint:** `GET /get_total_issuance`

**Example Request:**
```
GET /api/get_total_issuance
```

**Response:**
```json
{
  "success": true,
  "data": 196227800000000000000000,
  "error": null
}
```

**Response Fields:**
- `success` (boolean): Indicates whether the request was successful
- `data` (u128): Total issuance amount
- `error` (null|string): Error message if the request failed, null if successful

### Get era Information

Retrieve the era from the blockchain.

**Endpoint:** `GET /active_era`

**Example Request:**
```
GET /api/active_era
```

**Response:**
```json
{
  "success": true,
  "data": 22,
  "error": null
}
```

**Response Fields:**
- `success` (boolean): Indicates whether the request was successful
- `data` (u32): Current active Era
- `error` (null|string): Error message if the request failed, null if successful

### Get session Information

Retrieve the session from the blockchain.

**Endpoint:** `GET /active_seesion`

**Example Request:**
```
GET /api/active_seesion
```

**Response:**
```json
{
  "success": true,
  "data": 1080,
  "error": null
}
```

**Response Fields:**
- `success` (boolean): Indicates whether the request was successful
- `data` (u32): Current active seesion 
- `error` (null|string): Error message if the request failed, null if successful


## Blocks Endpoints

### Get All Blocks (Paginated)
Retrieve a list of blocks with pagination support.

**Endpoint:** `GET /blocks`

**Query Parameters:**
- `limit` (integer, optional): Number of blocks to return (default: 20)
- `offset` (integer, optional): Number of blocks to skip (default: 0)

**Example Request:**
```
GET /api/blocks?limit=20&offset=0
```

**Response:**
```json
{
  "blocks": [
    {
      "id": "block:869242",
      "number": 869242,
      "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
      "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
      "timestamp": 1706610600000,
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
  ],
  "total": 869243,
  "limit": 20,
  "offset": 0
}
```

### Get Latest Block
Retrieve the most recently mined block.

**Endpoint:** `GET /blocks/latest`

**Example Request:**
```
GET /api/blocks/latest
```

**Response:**
```json
{
  "id": "block:869242",
  "number": 869242,
  "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
  "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "timestamp": 1706610600000,
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

### Get Block by Number
Retrieve a specific block by its block number.

**Endpoint:** `GET /blocks/number/{blockNumber}`

**Path Parameters:**
- `blockNumber` (integer): The block number to retrieve

**Example Request:**
```
GET /api/blocks/number/0
```

**Response:**
```json
{
  "id": "block:0",
  "number": 0,
  "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "parent_hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp": 1704067200000,
  "transaction_count": 0,
  "size": 1024,
  "gas_used": 0,
  "gas_limit": 15000000,
  "base_fee": 10000000000,
  "burn_fee": 0.0,
  "validator": "0x0000000000000000000000000000000000000000",
  "extra_data": "0x47656e6573697320426c6f636b",
  "nonce": null,
  "session": 0,
  "era": 0
}
```

### Get Block by Hash
Retrieve a specific block by its hash.

**Endpoint:** `GET /blocks/hash/{blockHash}`

**Path Parameters:**
- `blockHash` (string): The block hash to retrieve (must include 0x prefix)

**Example Request:**
```
GET /api/blocks/hash/0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d
```

**Response:**
```json
{
  "id": "block:869242",
  "number": 869242,
  "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
  "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
  "timestamp": 1706610600000,
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

---

## Transactions Endpoints

### Get All Transactions (Paginated)
Retrieve a list of transactions with pagination support.

**Endpoint:** `GET /transactions`

**Query Parameters:**
- `limit` (integer, optional): Number of transactions to return (default: 20)
- `offset` (integer, optional): Number of transactions to skip (default: 0)

**Example Request:**
```
GET /api/transactions?limit=20&offset=0
```

**Response:**
```json
{
  "transactions": [
    {
      "id": "transaction:tx123",
      "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
      "block_number": 869242,
      "timestamp": 1706610600000,
      "from": "0x742d35Cc6634C0532925a3b8D453211321312131",
      "to": "0x8ba1f109551bD432803012645Hac136c55321321",
      "value": 1000000000000000000,
      "gas_price": 20000000000,
      "gas_limit": 21000,
      "gas_used": 21000,
      "nonce": 42,
      "status": "Success",
      "transaction_type": "DynamicFee",
      "network_type": "Evm",
      "input": null,
      "fee": 420000000000,
      "transaction_method": null
    }
  ],
  "total": 1500000,
  "limit": 20,
  "offset": 0
}
```

### Get Transaction by Hash
Retrieve a specific transaction by its hash.

**Endpoint:** `GET /transactions/hash/{transactionHash}`

**Path Parameters:**
- `transactionHash` (string): The transaction hash to retrieve (must include 0x prefix)

**Example Request:**
```
GET /api/transactions/hash/0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75
```

**Response:**
```json
{
  "id": "transaction:tx123",
  "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
  "block_number": 869242,
  "timestamp": 1706610600000,
  "from": "0x742d35Cc6634C0532925a3b8D453211321312131",
  "to": "0x8ba1f109551bD432803012645Hac136c55321321",
  "value": 1000000000000000000,
  "gas_price": 20000000000,
  "gas_limit": 21000,
  "gas_used": 21000,
  "nonce": 42,
  "status": "Success",
  "transaction_type": "DynamicFee",
  "network_type": "Evm",
  "input": null,
  "fee": 420000000000,
  "transaction_method": null
}
```

### Get Latest Transaction
Retrieve the most recent transaction.

**Endpoint:** `GET /transactions/latest`

**Example Request:**
```
GET /api/transactions/latest
```

**Response:**
```json
{
  "id": "transaction:tx456",
  "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
  "block_number": 869242,
  "timestamp": 1706610600000,
  "from": "0x742d35Cc6634C0532925a3b8D453211321312131",
  "to": "0x8ba1f109551bD432803012645Hac136c55321321",
  "value": 1000000000000000000,
  "gas_price": 20000000000,
  "gas_limit": 21000,
  "gas_used": 21000,
  "nonce": 42,
  "status": "Success",
  "transaction_type": "DynamicFee",
  "network_type": "Evm",
  "input": null,
  "fee": 420000000000,
  "transaction_method": null
}
```

### Get Transactions by Block Number
Retrieve all transactions within a specific block.

**Endpoint:** `GET /transactions/block/{blockNumber}`

**Path Parameters:**
- `blockNumber` (integer): The block number to get transactions from

**Example Request:**
```
GET /api/transactions/block/869242
```

**Response:**
```json
{
  "block_number": 869242,
  "transactions": [
    {
      "id": "transaction:tx789",
      "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
      "block_number": 869242,
      "timestamp": 1706610600000,
      "from": "0x742d35Cc6634C0532925a3b8D453211321312131",
      "to": "0x8ba1f109551bD432803012645Hac136c55321321",
      "value": 1000000000000000000,
      "gas_price": 20000000000,
      "gas_limit": 21000,
      "gas_used": 21000,
      "nonce": 42,
      "status": "Success",
      "transaction_type": "DynamicFee",
      "network_type": "Evm",
      "input": null,
      "fee": 420000000000,
      "transaction_method": null
    }
  ],
  "total": 125
}
```

---

## Accounts Endpoints

### Get All Accounts (Paginated)
Retrieve a list of accounts with pagination support.

**Endpoint:** `GET /accounts`

**Query Parameters:**
- `limit` (integer, optional): Number of accounts to return (default: 20)
- `offset` (integer, optional): Number of accounts to skip (default: 0)

**Example Request:**
```
GET /api/accounts?limit=50&offset=100
```

**Response:**
```json
{
  "accounts": [
    {
      "address": "0x742d35Cc6634C0532925a3b8D453211321312131",
      "balance_token": 1.5,
      "nonce": 42,
      "is_contract": false,
      "address_type": "H160",
      "created_at": 1704067200000,
      "last_activity": 1706610600000
    }
  ],
  "total": 12500,
  "limit": 50,
  "offset": 100
}
```

### Get Account by Address
Retrieve a specific account by its address.

**Endpoint:** `GET /accounts/address/{address}`

**Path Parameters:**
- `address` (string): The account address to retrieve

**Example Request:**
```
GET /api/accounts/address/0x742d35Cc6634C0532925a3b8D453211321312131
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D453211321312131",
  "balance_token": 1.5,
  "nonce": 42,
  "is_contract": false,
  "address_type": "H160",
  "created_at": 1704067200000,
  "last_activity": 1706610600000
}
```

### Get Accounts by Balance Range
Retrieve accounts within a specified balance range.

**Endpoint:** `GET /accounts/balance`

**Query Parameters:**
- `min_balance` (float, optional): Minimum balance in wei (default: 0.0)
- `max_balance` (float, optional): Maximum balance in wei (default: f64::MAX)
- `limit` (float, optional): Number of accounts to return (default: 20)
- `offset` (float, optional): Number of accounts to skip (default: 0)

**Example Requests:**
```
GET /api/accounts/balance
GET /api/accounts/balance?min_balance=1000
GET /api/accounts/balance?max_balance=50000
GET /api/accounts/balance?min_balance=1000&max_balance=50000&limit=10
```

**Response:**
```json
{
  "accounts": [
    {
      "address": "0x742d35Cc6634C0532925a3b8D453211321312131",
      "balance_token": 1.5,
      "nonce": 42,
      "is_contract": false,
      "address_type": "H160",
      "created_at": 1704067200000,
      "last_activity": 1706610600000
    },
    {
      "address": "0x8ba1f109551bD432803012645Hac136c55321321",
      "balance_token": 0.25,
      "nonce": 7,
      "is_contract": true,
      "address_type": "H160",
      "created_at": 1704067300000,
      "last_activity": 1706610500000
    }
  ],
  "total": 1250,
  "limit": 20,
  "offset": 0,
  "min_balance": 0,
  "max_balance": 340282366920938463463374607431768211455
}
```

---

## Contracts Endpoints

### Get All Contracts (Paginated)
Retrieve a list of contracts with pagination support.

**Endpoint:** `GET /contracts`

**Query Parameters:**
- `limit` (integer, optional): Number of contracts to return (default: 20)
- `offset` (integer, optional): Number of contracts to skip (default: 0)

**Example Request:**
```
GET /api/contracts?limit=50&offset=100
```

**Response:**
```json
{
  "contracts": [
    {
      "address": "0x8ba1f109551bD432803012645Hac136c55321321",
      "contract_type": "ERC20",
      "name": "Example Token",
      "symbol": "EXT",
      "decimals": 18,
      "total_supply": "1000000000000000000000000",
      "is_verified": true,
      "creator_info": {
        "contract_address": "0x8ba1f109551bD432803012645Hac136c55321321",
        "creator_address": "0x742d35Cc6634C0532925a3b8D453211321312131",
        "transaction_hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
        "block_number": 869000,
        "timestamp": "2024-01-30T10:30:00Z",
        "creation_bytecode": "0x608060405234801561001057600080fd5b5..."
      }
    }
  ],
  "total": 5420,
  "limit": 50,
  "offset": 100
}
```

### Get Contract by Address
Retrieve a specific contract by its address.

**Endpoint:** `GET /contracts/address/{address}`

**Path Parameters:**
- `address` (string): The contract address to retrieve

**Example Request:**
```
GET /api/contracts/address/0x8ba1f109551bD432803012645Hac136c55321321
```

**Response:**
```json
{
  "address": "0x8ba1f109551bD432803012645Hac136c55321321",
  "contract_type": "ERC20",
  "name": "Example Token",
  "symbol": "EXT",
  "decimals": 18,
  "total_supply": "1000000000000000000000000",
  "is_verified": true,
  "creator_info": {
    "contract_address": "0x8ba1f109551bD432803012645Hac136c55321321",
    "creator_address": "0x742d35Cc6634C0532925a3b8D453211321312131",
    "transaction_hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
    "block_number": 869000,
    "timestamp": "2024-01-30T10:30:00Z",
    "creation_bytecode": "0x608060405234801561001057600080fd5b5..."
  }
}
```

### Get Contracts by Type
Retrieve contracts filtered by contract type.

**Endpoint:** `GET /contracts/type/{contract_type}`

**Path Parameters:**
- `contract_type` (string): The contract type to filter by (case-insensitive)
  - Valid values: `erc20`, `erc721`, `erc1155`, `dex`, `lending`, `proxy`, `oracle`, `unknown`

**Example Requests:**
```
GET /api/contracts/type/erc20
GET /api/contracts/type/DEX
```

**Response:**
```json
{
  "contract_type": "ERC20",
  "contracts": [
    {
      "address": "0x8ba1f109551bD432803012645Hac136c55321321",
      "contract_type": "ERC20",
      "name": "Example Token",
      "symbol": "EXT",
      "decimals": 18,
      "total_supply": "1000000000000000000000000",
      "is_verified": true,
      "creator_info": {
        "contract_address": "0x8ba1f109551bD432803012645Hac136c55321321",
        "creator_address": "0x742d35Cc6634C0532925a3b8D453211321312131",
        "transaction_hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
        "block_number": 869000,
        "timestamp": "2024-01-30T10:30:00Z",
        "creation_bytecode": "0x608060405234801561001057600080fd5b5..."
      }
    }
  ],
  "total": 245
}
```

### Get Verified Contracts
Retrieve all verified contracts.

**Endpoint:** `GET /contracts/verified`

**Example Request:**
```
GET /api/contracts/verified
```

**Response:**
```json
{
  "contracts": [
    {
      "address": "0x8ba1f109551bD432803012645Hac136c55321321",
      "contract_type": "ERC20",
      "name": "Example Token",
      "symbol": "EXT",
      "decimals": 18,
      "total_supply": "1000000000000000000000000",
      "is_verified": true,
      "creator_info": {
        "contract_address": "0x8ba1f109551bD432803012645Hac136c55321321",
        "creator_address": "0x742d35Cc6634C0532925a3b8D453211321312131",
        "transaction_hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
        "block_number": 869000,
        "timestamp": "2024-01-30T10:30:00Z",
        "creation_bytecode": "0x608060405234801561001057600080fd5b5..."
      }
    }
  ],
  "total": 1250
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid parameter format"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Block/Transaction/Account/Contract not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Usage Examples

### cURL Examples

**Get network information:**
```bash
curl -X GET "http://localhost:3000/api/network"
```

**Get latest 20 blocks:**
```bash
curl -X GET "http://localhost:3000/api/blocks?limit=20&offset=0"
```

**Get specific block by hash:**
```bash
curl -X GET "http://localhost:3000/api/blocks/hash/0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d"
```

**Get transaction by hash:**
```bash
curl -X GET "http://localhost:3000/api/transactions/hash/0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75"
```

**Get all accounts:**
```bash
curl -X GET "http://localhost:3000/api/accounts?limit=50&offset=0"
```

**Get specific account by address:**
```bash
curl -X GET "http://localhost:3000/api/accounts/address/0x742d35Cc6634C0532925a3b8D453211321312131"
```

**Get accounts with balance >= 1000:**
```bash
curl -X GET "http://localhost:3000/api/accounts/balance?min_balance=1000"
```

**Get ERC20 contracts:**
```bash
curl -X GET "http://localhost:3000/api/contracts/type/erc20"
```

**Get verified contracts:**
```bash
curl -X GET "http://localhost:3000/api/contracts/verified"
```

---

## Rate Limiting

This API may implement rate limiting. If you exceed the allowed request rate, you'll receive a `429 Too Many Requests` response.

## Notes

- All hash values must include the `0x` prefix
- Block numbers are integers starting from 0 (genesis block)
- Pagination is 0-indexed (offset=0 returns the first set of results)
- All timestamps are Unix timestamps in milliseconds
- Values are returned as numbers (not strings) to preserve precision
- The `nonce` field in blocks can be null for non-Proof-of-Work consensus
- The `to` field in transactions can be null for contract creation transactions
- Gas values are in wei (1 ETH = 10^18 wei)
- The `id` field follows the format "{type}:{identifier}" for both blocks and transactions
- Balance ranges use inclusive bounds (min_balance <= balance <= max_balance)
- Contract type filtering is case-insensitive
- Account balances are returned in token units (converted from wei)
- Contract addresses follow the same format as transaction addresses
- Creation timestamps in contract creation info are ISO 8601 formatted strings
- Network information reflects the current state of the EVM-compatible blockchain
- The `syncing` field indicates whether the node is actively synchronizing with the network