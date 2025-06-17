# Blockchain REST API Documentation

## Base URL
```
http://localhost:3000/api
```

## WebSocket Endpoint
```
ws://localhost:3000/ws
```

## Overview
This API provides access to blockchain data from both EVM and Substrate networks, including network information, blocks, transactions, accounts, contracts, extrinsics, and events. All endpoints return JSON responses in a standardized format and support standard HTTP methods.

---

## Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": any | null,
  "error": string | null
}
```

**Success Response:**
```json
{
  "success": true,
  "data": { /* actual response data */ },
  "error": null
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": "Error message description"
}
```

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

## Common Query Parameters

### Pagination Parameters
Most list endpoints support pagination with these optional query parameters:

- `limit` (integer, optional): Number of items to return (default: 20)
- `offset` (integer, optional): Number of items to skip (default: 0)

---

## Network Endpoints

### Get EVM Network Information
Retrieve current EVM network status and configuration information.

**Endpoint:** `GET /network`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/network"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chain_id": 1,
    "gas_price": 20000000000,
    "max_priority_fee": 2000000000,
    "max_fee": 30000000000,
    "latest_block_number": 869242,
    "syncing": false
  },
  "error": null
}
```

### Get Latest Substrate Block Number
Retrieve the latest block number from the Substrate blockchain.

**Endpoint:** `GET /latest_block`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/latest_block"
```

**Response:**
```json
{
  "success": true,
  "data": 1962278,
  "error": null
}
```

### Get Total Issuance
Retrieve the total token issuance amount from the Substrate blockchain.

**Endpoint:** `GET /get_total_issuance`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/get_total_issuance"
```

**Response:**
```json
{
  "success": true,
  "data": 196227800000000000000000,
  "error": null
}
```

### Get Era-Session Information
Retrieve current Era-Session information from the Substrate network.

**Endpoint:** `GET /session_era`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/session_era"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "era": 22,
    "start_at": 1749280805000,
    "end_at": 2000000000,
    "session": 30000000000
  },
  "error": null
}
```

### Get Total Staking
Retrieve the total staking amount from the Substrate blockchain.

**Endpoint:** `GET /get_total_staking`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/get_total_staking"
```

**Response:**
```json
{
  "success": true,
  "data": 150000000000000000000000,
  "error": null
}
```

---

## Address Conversion Endpoints

### Convert SS58 to EVM Address
Convert a Substrate SS58 address to an Ethereum-compatible H160 address.

**Endpoint:** `GET /convert/ss58_to_evm_address/{address}`

**Path Parameters:**
- `address` (string): The SS58 address to convert

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/convert/ss58_to_evm_address/5DM7PJEFPbcYViEzFXu5GjF96JgoSJ3rb6jfXLsmXqrPVG2o"
```

**Response:**
```json
{
  "success": true,
  "data": "0x742d35Cc6634C0532925a3b8D453211321312131",
  "error": null
}
```

### Convert EVM to SS58 Address
Convert an Ethereum-compatible H160 address to a Substrate SS58 address.

**Endpoint:** `GET /convert/evm_to_ss58_address/{address}`

**Path Parameters:**
- `address` (string): The EVM address to convert (must include 0x prefix)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/convert/evm_to_ss58_address/0x742d35Cc6634C0532925a3b8D453211321312131"
```

**Response:**
```json
{
  "success": true,
  "data": "5DM7PJEFPbcYViEzFXu5GjF96JgoSJ3rb6jfXLsmXqrPVG2o",
  "error": null
}
```

---

## EVM Block Endpoints

### Get All EVM Blocks (Paginated)
Retrieve a list of EVM blocks with pagination support.

**Endpoint:** `GET /evm/blocks`

**Query Parameters:**
- `limit` (integer, optional): Number of blocks to return (default: 20)
- `offset` (integer, optional): Number of blocks to skip (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/blocks?limit=20&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
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
  "error": null
}
```

### Get Latest EVM Block
Retrieve the most recently mined EVM block.

**Endpoint:** `GET /evm/blocks/latest`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/blocks/latest"
```

### Get EVM Block by Number
Retrieve a specific EVM block by its block number.

**Endpoint:** `GET /evm/blocks/number/{block_number}`

**Path Parameters:**
- `block_number` (integer): The block number to retrieve

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/blocks/number/869242"
```

### Get EVM Block by Hash
Retrieve a specific EVM block by its hash.

**Endpoint:** `GET /evm/blocks/hash/{block_hash}`

**Path Parameters:**
- `block_hash` (string): The block hash to retrieve (must include 0x prefix)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/blocks/hash/0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d"
```

---

## EVM Transaction Endpoints

### Get All EVM Transactions (Paginated)
Retrieve a list of EVM transactions with pagination support.

**Endpoint:** `GET /evm/transactions`

**Query Parameters:**
- `limit` (integer, optional): Number of transactions to return (default: 20)
- `offset` (integer, optional): Number of transactions to skip (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/transactions?limit=20&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
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
      "fee": 420000000000,
      "transaction_method": null
    }
  ],
  "error": null
}
```

### Get Latest EVM Transaction
Retrieve the most recent EVM transaction.

**Endpoint:** `GET /evm/transactions/latest`

### Get EVM Transaction by Hash
Retrieve a specific EVM transaction by its hash.

**Endpoint:** `GET /evm/transactions/hash/{tx_hash}`

**Path Parameters:**
- `tx_hash` (string): The transaction hash to retrieve (must include 0x prefix)

### Get EVM Transactions by Block Number
Retrieve all EVM transactions within a specific block.

**Endpoint:** `GET /evm/transactions/block/{block_number}`

**Path Parameters:**
- `block_number` (integer): The block number to get transactions from

---

## EVM Account Endpoints

### Get All EVM Accounts (Paginated)
Retrieve a list of EVM accounts with pagination support.

**Endpoint:** `GET /evm/accounts`

**Query Parameters:**
- `limit` (integer, optional): Number of accounts to return (default: 20)
- `offset` (integer, optional): Number of accounts to skip (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/accounts?limit=50&offset=100"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "0x742d35Cc6634C0532925a3b8D453211321312131",
      "balance_token": 1.5,
      "free_balance": 1.5,
      "nonce": 42,
      "is_contract": false,
      "address_type": "H160",
      "created_at": 1704067200000,
      "last_activity": 1706610600000
    }
  ],
  "error": null
}
```

### Get EVM Account by Address
Retrieve a specific EVM account by its address.

**Endpoint:** `GET /evm/accounts/address/{address}`

**Path Parameters:**
- `address` (string): The account address to retrieve

### Get EVM Accounts by Balance Range
Retrieve EVM accounts within a specified balance range.

**Endpoint:** `GET /evm/accounts/balance`

**Query Parameters:**
- `min_balance` (float, optional): Minimum balance (default: 0.0)
- `max_balance` (float, optional): Maximum balance (default: f64::MAX)
- `limit` (integer, optional): Number of accounts to return (default: 20)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/accounts/balance?min_balance=1000&max_balance=50000&limit=10"
```

---

## EVM Contract Endpoints

### Get All EVM Contracts (Paginated)
Retrieve a list of EVM contracts with pagination support.

**Endpoint:** `GET /evm/contracts`

**Query Parameters:**
- `limit` (integer, optional): Number of contracts to return (default: 20)
- `offset` (integer, optional): Number of contracts to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
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
        "timestamp": 1706610600000,
        "creation_bytecode": "0x608060405234801561001057600080fd5b5..."
      }
    }
  ],
  "error": null
}
```

### Get EVM Contract by Address
Retrieve a specific EVM contract by its address.

**Endpoint:** `GET /evm/contracts/address/{address}`

**Path Parameters:**
- `address` (string): The contract address to retrieve

### Get EVM Contracts by Type
Retrieve EVM contracts filtered by contract type.

**Endpoint:** `GET /evm/contracts/type/{contract_type}`

**Path Parameters:**
- `contract_type` (string): The contract type to filter by (case-insensitive)
  - Valid values: `erc20`, `erc721`, `erc1155`, `dex`, `lending`, `lendingprotocol`, `proxy`, `oracle`, `unknown`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/contracts/type/erc20"
```

### Get Verified EVM Contracts
Retrieve all verified EVM contracts.

**Endpoint:** `GET /evm/contracts/verified`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/evm/contracts/verified"
```

---

## Substrate Block Endpoints

### Get All Substrate Blocks (Paginated)
Retrieve a list of Substrate blocks with pagination support.

**Endpoint:** `GET /substrate/blocks`

**Query Parameters:**
- `limit` (integer, optional): Number of blocks to return (default: 20)
- `offset` (integer, optional): Number of blocks to skip (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/substrate/blocks?limit=20&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "number": 1962278,
      "timestamp": 1706610600,
      "is_finalize": true,
      "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
      "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
      "state_root": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "extrinsics_root": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
    }
  ],
  "error": null
}
```

### Get Latest Substrate Block
Retrieve the most recently finalized Substrate block with extended information.

**Endpoint:** `GET /substrate/blocks/latest`

**Response:**
```json
{
  "success": true,
  "data": {
    "number": 1962278,
    "timestamp": 1706610600,
    "is_finalize": true,
    "hash": "0xb3ccc19ca8b20e40082f4604031f447c3eb91210abb8b3efdc73874b7f71f01d",
    "parent_hash": "0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    "state_root": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "extrinsics_root": "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    "extrinscs_len": 15,
    "event_len": 42
  },
  "error": null
}
```

### Get Substrate Block by Number
Retrieve a specific Substrate block by its block number with extrinsic and event counts.

**Endpoint:** `GET /substrate/blocks/number/{block_number}`

**Path Parameters:**
- `block_number` (integer): The block number to retrieve

### Get Substrate Block by Hash
Retrieve a specific Substrate block by its hash with extrinsic and event counts.

**Endpoint:** `GET /substrate/blocks/hash/{block_hash}`

**Path Parameters:**
- `block_hash` (string): The block hash to retrieve

---

## Substrate Extrinsic Endpoints

### Get All Substrate Extrinsics (Paginated)
Retrieve a list of Substrate extrinsics with pagination support.

**Endpoint:** `GET /substrate/extrinsics`

**Query Parameters:**
- `limit` (integer, optional): Number of extrinsics to return (default: 20)
- `offset` (integer, optional): Number of extrinsics to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "block_number": 1962278,
      "extrinsic_index": 1,
      "is_signed": true,
      "signer": "5DM7PJEFPbcYViEzFXu5GjF96JgoSJ3rb6jfXLsmXqrPVG2o",
      "call_module": "Balances",
      "call_function": "transfer",
      "args": "{\"dest\": \"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY\", \"value\": 1000000000000}",
      "timestamp": 1706610600
    }
  ],
  "error": null
}
```

### Get Substrate Extrinsics by Block Number
Retrieve all Substrate extrinsics within a specific block.

**Endpoint:** `GET /substrate/extrinsics/block/{block_number}`

**Path Parameters:**
- `block_number` (integer): The block number to get extrinsics from

### Get Substrate Extrinsics by Signer
Retrieve Substrate extrinsics filtered by signer address.

**Endpoint:** `GET /substrate/extrinsics/signer/{signer}`

**Path Parameters:**
- `signer` (string): The signer address to filter by

**Query Parameters:**
- `limit` (integer, optional): Number of extrinsics to return (default: 20)

### Get Substrate Extrinsics by Module
Retrieve Substrate extrinsics filtered by module and optionally by function.

**Endpoint:** `GET /substrate/extrinsics/module`

**Query Parameters:**
- `module` (string, required): The module name to filter by
- `function` (string, optional): The function name to filter by
- `limit` (integer, optional): Number of extrinsics to return (default: 20)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/substrate/extrinsics/module?module=Balances&function=transfer&limit=10"
```

---

## Substrate Event Endpoints

### Get All Substrate Events (Paginated)
Retrieve a list of Substrate events with pagination support.

**Endpoint:** `GET /substrate/events`

**Query Parameters:**
- `limit` (integer, optional): Number of events to return (default: 20)
- `offset` (integer, optional): Number of events to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "block_number": 1962278,
      "event_index": 5,
      "phase": "ApplyExtrinsic(1)",
      "module": "Balances",
      "event": "Transfer",
      "data": "{\"from\": \"5DM7PJEFPbcYViEzFXu5GjF96JgoSJ3rb6jfXLsmXqrPVG2o\", \"to\": \"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY\", \"amount\": 1000000000000}",
      "timestamp": 1706610600
    }
  ],
  "error": null
}
```

### Get Substrate Events by Block Number
Retrieve all Substrate events within a specific block.

**Endpoint:** `GET /substrate/events/block/{block_number}`

**Path Parameters:**
- `block_number` (integer): The block number to get events from

### Get Substrate Events by Module
Retrieve Substrate events filtered by module and optionally by event name.

**Endpoint:** `GET /substrate/events/module`

**Query Parameters:**
- `module` (string, required): The module name to filter by
- `event` (string, optional): The event name to filter by
- `limit` (integer, optional): Number of events to return (default: 20)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/substrate/events/module?module=Balances&event=Transfer&limit=10"
```

### Get Substrate Events by Event Name
Retrieve Substrate events filtered by event name across all modules.

**Endpoint:** `GET /substrate/events/name/{event_name}`

**Path Parameters:**
- `event_name` (string): The event name to filter by

**Query Parameters:**
- `limit` (integer, optional): Number of events to return (default: 20)

### Get Recent Substrate Events
Retrieve recent Substrate events within a specified time window.

**Endpoint:** `GET /substrate/events/recent`

**Query Parameters:**
- `hours` (integer, optional): Number of hours to look back (default: 24)
- `limit` (integer, optional): Number of events to return (default: 20)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/substrate/events/recent?hours=48&limit=50"
```

---

## Field Descriptions

### EVM Block Fields
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

### EVM Transaction Fields
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
- `status`: Transaction execution status
- `transaction_type`: Type of transaction
- `fee`: Total transaction fee paid (gas_used × gas_price)
- `transaction_method`: Method signature for contract calls (null for transfers)

### Account Fields
- `address`: Account address (format depends on address_type)
- `balance_token`: Account balance in token units (decimal)
- `free_balance`: Account balance in token units that is transferable (decimal)
- `nonce`: Account nonce (number of transactions sent)
- `is_contract`: Boolean indicating if address is a contract
- `address_type`: Address format type
- `created_at`: Unix timestamp when account was first seen
- `last_activity`: Unix timestamp of last account activity

### Contract Fields
- `address`: Contract address
- `contract_type`: Type of contract
- `name`: Contract name (optional)
- `symbol`: Contract symbol (optional)
- `decimals`: Number of decimal places for tokens (optional)
- `total_supply`: Total token supply (optional, as string)
- `is_verified`: Boolean indicating if contract is verified
- `creator_info`: Contract creation information (optional)

### Substrate Block Fields
- `number`: Sequential block number
- `timestamp`: Unix timestamp in seconds
- `is_finalize`: Boolean indicating if block is finalized
- `hash`: Unique block hash
- `parent_hash`: Hash of the previous block
- `state_root`: State root hash
- `extrinsics_root`: Extrinsics root hash
- `extrinscs_len`: Number of extrinsics in the block (in detailed responses)
- `event_len`: Number of events in the block (in detailed responses)

### Substrate Extrinsic Fields
- `block_number`: Block number containing this extrinsic
- `extrinsic_index`: Index of the extrinsic within the block
- `is_signed`: Boolean indicating if extrinsic is signed
- `signer`: Address of the extrinsic signer (null for unsigned)
- `call_module`: Name of the runtime module being called
- `call_function`: Name of the function being called
- `args`: JSON serialized arguments passed to the function
- `timestamp`: Unix timestamp in seconds

### Substrate Event Fields
- `block_number`: Block number where the event occurred
- `event_index`: Index of the event within the block
- `phase`: Phase when the event was emitted (e.g., "ApplyExtrinsic(1)")
- `module`: Name of the runtime module that emitted the event
- `event`: Name of the event
- `data`: JSON serialized event data
- `timestamp`: Unix timestamp in seconds

### Era Information Fields
- `era`: Current era number
- `start_at`: Era start block number
- `end_at`: Era end block number
- `session`: Current session number

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "error": "Invalid parameter format"
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "data": null,
  "error": "Internal server error occurred"
}
```

---

## Usage Examples

### JavaScript/TypeScript Examples

**Get network information:**
```javascript
const response = await fetch('http://localhost:3000/api/network');
const result = await response.json();
if (result.success) {
  console.log('Network info:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Get recent Substrate events:**
```javascript
const response = await fetch('http://localhost:3000/api/substrate/events/recent?hours=24&limit=50');
const result = await response.json();
if (result.success) {
  result.data.forEach(event => {
    console.log(`${event.module}.${event.event} at block ${event.block_number}`);
  });
}
```

**Get EVM contracts by type:**
```javascript
const response = await fetch('http://localhost:3000/api/evm/contracts/type/erc20');
const result = await response.json();
if (result.success) {
  console.log(`Found ${result.data.length} ERC20 contracts`);
}
```

### Python Examples

```python
import requests

# Get total issuance
response = requests.get('http://localhost:3000/api/get_total_issuance')
data = response.json()
if data['success']:
    print(f"Total issuance: {data['data']}")

# Get Substrate extrinsics by module
response = requests.get(
    'http://localhost:3000/api/substrate/extrinsics/module',
    params={'module': 'Balances', 'function': 'transfer', 'limit': 10}
)
data = response.json()
if data['success']:
    for ext in data['data']:
        print(f"Transfer from {ext['signer']} at block {ext['block_number']}")
```

---

## Rate Limiting

This API implements a 30-second timeout per request. For high-frequency usage, consider implementing request queuing or batching on the client side.

## CORS Policy

The API allows cross-origin requests from any origin with GET methods only. All response headers are permitted.

## Notes

- All hash values must include the `0x` prefix where applicable
- EVM block numbers are integers starting from 0 (genesis block)
- Substrate block numbers follow the substrate blockchain numbering
- Pagination is 0-indexed (offset=0 returns the first set of results)
- EVM timestamps are in milliseconds, Substrate timestamps are in seconds
- All monetary values in EVM are returned in wei (1 ETH = 10^18 wei)
- Substrate token balances are returned in token units (converted from planck units)
- The `nonce` field in EVM blocks can be null for non-Proof-of-Work consensus
- The `to` field in EVM transactions can be null for contract creation transactions
- Contract type filtering is case-insensitive
- Address conversion endpoints return the converted address as a string value in the `data` field
- SS58 addresses are used in Substrate-based networks while H160 addresses are used in EVM-compatible networks
- Address conversions maintain the same underlying account but represent it in different formats
- Substrate extrinsics can be unsigned (system extrinsics) where `signer` will be null
- Event phases indicate when during block execution the event was emitted
- Era and session information is specific to Substrate's consensus mechanism
- All JSON response fields follow snake_case naming convention
- Timestamps before 1970 are not supported and will return as 0 or null

## Architecture Overview

The API is built using:
- **Framework**: Axum (Rust async web framework)
- **Database**: SurrealDB for data persistence
- **Blockchain Integration**: 
  - EVM integration via ethers-rs and custom blockscan library
  - Substrate integration via subxt library
- **Middleware**: CORS, timeout (30s), and tracing support
- **Data Models**: Shared models crate for type consistency

## Development Information

### Dependencies
The API uses the following major dependencies:
- `axum`: Web framework with macro support
- `surrealdb`: Database for storing blockchain data
- `subxt`: Substrate blockchain client
- `tower-http`: HTTP middleware (CORS, timeout, tracing)
- `tokio`: Async runtime
- `serde`: Serialization/deserialization
- `anyhow`: Error handling
- `tracing`: Structured logging

### Configuration
The API requires the following environment variables:
- `DATABASE_URL`: SurrealDB connection URL
- `DATABASE_USERNAME`: Database username
- `DATABASE_PASSWORD`: Database password  
- `DATABASE_NAMESPACE`: Database namespace
- `DATABASE_TABLE`: Database table name
- `EVM_RPC_URL`: EVM node RPC endpoint
- `SUBSTRATE_URL`: Substrate node WebSocket endpoint
- `BLOCKS_PER_ERA`: Number of blocks per era (Substrate-specific)

### Server Configuration
- **Host**: 127.0.0.1 (localhost)
- **Port**: 3000
- **Timeout**: 30 seconds per request
- **CORS**: Enabled for all origins with GET methods

## Data Relationships

### EVM Data Flow
1. **Blocks** contain multiple **Transactions**
2. **Transactions** are sent from/to **Accounts**
3. **Contracts** are special types of **Accounts**
4. **Accounts** can have multiple **Transactions** (sent/received)

### Substrate Data Flow
1. **Blocks** contain multiple **Extrinsics** and **Events**
2. **Extrinsics** can generate multiple **Events**
3. **Events** are emitted by runtime modules during extrinsic execution
4. **Blocks** are organized into **Sessions** and **Eras**

### Cross-Chain Relationships
- EVM addresses and Substrate SS58 addresses can represent the same underlying account
- Address conversion endpoints provide mapping between formats
- Both networks can run in parallel (parachain architecture)

## Performance Considerations

### Pagination
- Default pagination limit is 20 items to balance performance and usability
- Maximum recommended limit is 1000 items per request
- Use offset-based pagination for consistent results during active blockchain indexing

### Caching Recommendations
- Network information changes infrequently - cache for 30-60 seconds
- Latest block information changes every block time - cache for 6-12 seconds
- Historical block/transaction data is immutable - cache indefinitely
- Account balances and contract data change frequently - cache for 10-30 seconds

### Query Optimization
- Use specific endpoints (by hash, by number) instead of filtered lists when possible
- Batch multiple requests when fetching related data
- Consider WebSocket connections for real-time data updates (not provided by this REST API)

## Common Integration Patterns

### Block Synchronization
```javascript
// Example: Sync recent blocks
async function syncRecentBlocks() {
  const evmLatest = await fetch('/api/evm/blocks/latest').then(r => r.json());
  const substrateLatest = await fetch('/api/substrate/blocks/latest').then(r => r.json());
  
  if (evmLatest.success && substrateLatest.success) {
    console.log(`EVM: ${evmLatest.data.number}, Substrate: ${substrateLatest.data.number}`);
  }
}
```

### Transaction Monitoring
```javascript
// Example: Monitor transactions for specific address
async function monitorAddress(address) {
  const evmAccount = await fetch(`/api/evm/accounts/address/${address}`).then(r => r.json());
  
  if (evmAccount.success && evmAccount.data) {
    console.log(`Account balance: ${evmAccount.data.balance_token} tokens`);
    console.log(`Transaction count: ${evmAccount.data.nonce}`);
  }
}
```

### Cross-Chain Address Tracking
```javascript
// Example: Track same account across both networks
async function trackCrossChainAccount(evmAddress) {
  const ss58Address = await fetch(`/api/convert/evm_to_ss58_address/${evmAddress}`)
    .then(r => r.json());
  
  if (ss58Address.success) {
    const [evmAccount, substrateEvents] = await Promise.all([
      fetch(`/api/evm/accounts/address/${evmAddress}`).then(r => r.json()),
      fetch(`/api/substrate/events/recent?hours=24`).then(r => r.json())
    ]);
    
    // Process cross-chain account activity
  }
}
```

## Error Handling Best Practices

### Graceful Degradation
```javascript
async function safeApiCall(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      console.error(`API Error: ${data.error}`);
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error(`Network Error: ${error.message}`);
    return null;
  }
}
```

### Retry Logic
```javascript
async function apiCallWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await safeApiCall(url);
      if (result !== null) return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

## Security Considerations

- All endpoints are read-only (GET methods only)
- No authentication required for public blockchain data
- Rate limiting should be implemented on the client side
- Validate all input parameters before making requests
- Sanitize display of addresses and hashes to prevent XSS
- Be cautious when displaying contract data as it may contain user-generated content

## Future Enhancements

Potential areas for API expansion:
- WebSocket endpoints for real-time updates
- Batch query endpoints for multiple requests
- Advanced filtering and sorting options
- GraphQL endpoint for flexible querying
- Subscription endpoints for event monitoring
- Historical data aggregation endpoints
- Performance metrics and analytics endpoints