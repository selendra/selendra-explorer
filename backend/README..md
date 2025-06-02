# Blockchain REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## Overview
This API provides access to blockchain data including blocks and transactions. All endpoints return JSON responses and support standard HTTP methods.

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

---

## Field Descriptions

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

---

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
  "message": "Block/Transaction not found"
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