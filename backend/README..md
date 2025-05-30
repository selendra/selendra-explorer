# Blockchain REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## Overview
This API provides access to blockchain data including blocks and transactions. All endpoints return JSON responses and support standard HTTP methods.

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
      "number": 869242,
      "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
      "timestamp": "2024-01-30T10:30:00Z",
      "transactions": [...],
      "...": "additional block data"
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
  "number": 869242,
  "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
  "timestamp": "2024-01-30T10:30:00Z",
  "transactions": [...],
  "...": "additional block data"
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
  "number": 0,
  "hash": "0x...",
  "timestamp": "2024-01-01T00:00:00Z",
  "transactions": [...],
  "...": "additional block data"
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
  "number": 869242,
  "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
  "timestamp": "2024-01-30T10:30:00Z",
  "transactions": [...],
  "...": "additional block data"
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
      "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
      "blockNumber": 869242,
      "from": "0x...",
      "to": "0x...",
      "value": "1000000000000000000",
      "gas": 21000,
      "gasPrice": "20000000000",
      "...": "additional transaction data"
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
  "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
  "blockNumber": 869242,
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "gas": 21000,
  "gasPrice": "20000000000",
  "...": "additional transaction data"
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
  "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
  "blockNumber": 869242,
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "gas": 21000,
  "gasPrice": "20000000000",
  "...": "additional transaction data"
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
  "blockNumber": 869242,
  "transactions": [
    {
      "hash": "0xa04c8c80ed7646c70033c00d67f11904ea7d1bfafe60583aeea1813914c9ed75",
      "from": "0x...",
      "to": "0x...",
      "value": "1000000000000000000",
      "gas": 21000,
      "gasPrice": "20000000000",
      "...": "additional transaction data"
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

## Rate Limiting

This API may implement rate limiting. If you exceed the allowed request rate, you'll receive a `429 Too Many Requests` response.

## Notes

- All hash values must include the `0x` prefix
- Block numbers are integers starting from 0 (genesis block)
- Pagination is 0-indexed (offset=0 returns the first set of results)
- All timestamps are in ISO 8601 format (UTC)
- Values are returned as strings to preserve precision for large numbers