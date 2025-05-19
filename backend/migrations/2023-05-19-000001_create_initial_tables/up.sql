-- Create blocks table
CREATE TABLE blocks (
    hash VARCHAR(66) PRIMARY KEY,
    number BIGINT NOT NULL UNIQUE,
    timestamp TIMESTAMP NOT NULL,
    parent_hash VARCHAR(66) NOT NULL,
    author VARCHAR(42),
    state_root VARCHAR(66) NOT NULL,
    transactions_root VARCHAR(66) NOT NULL,
    receipts_root VARCHAR(66) NOT NULL,
    gas_used BIGINT NOT NULL,
    gas_limit BIGINT NOT NULL,
    extra_data TEXT,
    logs_bloom TEXT,
    size INTEGER,
    difficulty TEXT,
    total_difficulty TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    hash VARCHAR(66) PRIMARY KEY,
    block_hash VARCHAR(66) NOT NULL REFERENCES blocks(hash) ON DELETE CASCADE,
    block_number BIGINT NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    value TEXT NOT NULL,
    gas BIGINT NOT NULL,
    gas_price BIGINT NOT NULL,
    input TEXT,
    nonce INTEGER NOT NULL,
    transaction_index INTEGER NOT NULL,
    status BOOLEAN,
    transaction_type INTEGER,
    max_fee_per_gas BIGINT,
    max_priority_fee_per_gas BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE accounts (
    address VARCHAR(42) PRIMARY KEY,
    balance TEXT NOT NULL,
    nonce INTEGER NOT NULL,
    code TEXT,
    is_contract BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE contracts (
    address VARCHAR(42) PRIMARY KEY REFERENCES accounts(address) ON DELETE CASCADE,
    creator_address VARCHAR(42) NOT NULL,
    creator_transaction_hash VARCHAR(66) NOT NULL REFERENCES transactions(hash) ON DELETE CASCADE,
    bytecode TEXT NOT NULL,
    abi TEXT,
    name TEXT,
    compiler_version TEXT,
    optimization_used BOOLEAN,
    runs INTEGER,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_date TIMESTAMP,
    license_type TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tokens table (ERC20, ERC721, etc.)
CREATE TABLE tokens (
    address VARCHAR(42) PRIMARY KEY REFERENCES contracts(address) ON DELETE CASCADE,
    name TEXT,
    symbol TEXT,
    decimals INTEGER,
    total_supply TEXT,
    token_type VARCHAR(10) NOT NULL, -- ERC20, ERC721, etc.
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create token_transfers table
CREATE TABLE token_transfers (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(42) NOT NULL REFERENCES tokens(address) ON DELETE CASCADE,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    value TEXT NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL REFERENCES transactions(hash) ON DELETE CASCADE,
    log_index INTEGER NOT NULL,
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create logs table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(66) NOT NULL REFERENCES transactions(hash) ON DELETE CASCADE,
    block_hash VARCHAR(66) NOT NULL REFERENCES blocks(hash) ON DELETE CASCADE,
    block_number BIGINT NOT NULL,
    address VARCHAR(42) NOT NULL,
    data TEXT NOT NULL,
    log_index INTEGER NOT NULL,
    topic0 VARCHAR(66),
    topic1 VARCHAR(66),
    topic2 VARCHAR(66),
    topic3 VARCHAR(66),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_blocks_number ON blocks(number);
CREATE INDEX idx_transactions_block_number ON transactions(block_number);
CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);
CREATE INDEX idx_token_transfers_from_address ON token_transfers(from_address);
CREATE INDEX idx_token_transfers_to_address ON token_transfers(to_address);
CREATE INDEX idx_logs_address ON logs(address);
CREATE INDEX idx_logs_topic0 ON logs(topic0);
