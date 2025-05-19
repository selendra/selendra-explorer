-- Add Selendra-specific fields to blocks table
ALTER TABLE blocks
ADD COLUMN consensus_engine VARCHAR(50),
ADD COLUMN finalized BOOLEAN DEFAULT FALSE,
ADD COLUMN extrinsics_root VARCHAR(66),
ADD COLUMN validator_set TEXT;

-- Add execution_type to transactions to distinguish between EVM and Substrate calls
ALTER TABLE transactions
ADD COLUMN execution_type VARCHAR(10) NOT NULL DEFAULT 'evm' CHECK (execution_type IN ('evm', 'wasm'));

-- Create extrinsics table for Substrate calls
CREATE TABLE extrinsics (
    hash VARCHAR(66) PRIMARY KEY,
    block_hash VARCHAR(66) NOT NULL REFERENCES blocks(hash) ON DELETE CASCADE,
    block_number BIGINT NOT NULL,
    index INTEGER NOT NULL,
    signer VARCHAR(66),
    section VARCHAR(100) NOT NULL,
    method VARCHAR(100) NOT NULL,
    args JSONB,
    success BOOLEAN NOT NULL,
    is_signed BOOLEAN NOT NULL,
    signature VARCHAR(200),
    nonce INTEGER,
    tip BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(block_number, index)
);

-- Create events table for Substrate events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    block_hash VARCHAR(66) NOT NULL REFERENCES blocks(hash) ON DELETE CASCADE,
    block_number BIGINT NOT NULL,
    extrinsic_hash VARCHAR(66) REFERENCES extrinsics(hash) ON DELETE CASCADE,
    extrinsic_index INTEGER,
    event_index INTEGER NOT NULL,
    section VARCHAR(100) NOT NULL,
    method VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    phase VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(block_number, event_index)
);

-- Create wasm_contracts table
CREATE TABLE wasm_contracts (
    address VARCHAR(66) PRIMARY KEY,
    creator_address VARCHAR(66) NOT NULL,
    creator_extrinsic_hash VARCHAR(66) NOT NULL REFERENCES extrinsics(hash) ON DELETE CASCADE,
    code_hash VARCHAR(66) NOT NULL,
    init_args JSONB,
    contract_type VARCHAR(20) NOT NULL, -- ink!, ask!, etc.
    metadata JSONB,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create wasm_contract_calls table
CREATE TABLE wasm_contract_calls (
    id SERIAL PRIMARY KEY,
    extrinsic_hash VARCHAR(66) NOT NULL REFERENCES extrinsics(hash) ON DELETE CASCADE,
    contract_address VARCHAR(66) NOT NULL REFERENCES wasm_contracts(address) ON DELETE CASCADE,
    method VARCHAR(100) NOT NULL,
    args JSONB,
    value TEXT,
    gas_limit BIGINT,
    gas_used BIGINT,
    success BOOLEAN NOT NULL,
    return_data TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create wasm_code_storage table
CREATE TABLE wasm_code_storage (
    code_hash VARCHAR(66) PRIMARY KEY,
    code BYTEA NOT NULL,
    uploaded_by VARCHAR(66) NOT NULL,
    upload_extrinsic_hash VARCHAR(66) NOT NULL REFERENCES extrinsics(hash) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Modify contracts table to add contract_type field
ALTER TABLE contracts
ADD COLUMN contract_type VARCHAR(10) NOT NULL DEFAULT 'evm' CHECK (contract_type IN ('evm', 'wasm'));

-- Create indexes for better query performance
CREATE INDEX idx_extrinsics_block_number ON extrinsics(block_number);
CREATE INDEX idx_extrinsics_signer ON extrinsics(signer);
CREATE INDEX idx_extrinsics_section_method ON extrinsics(section, method);
CREATE INDEX idx_events_block_number ON events(block_number);
CREATE INDEX idx_events_section_method ON events(section, method);
CREATE INDEX idx_events_extrinsic_hash ON events(extrinsic_hash);
CREATE INDEX idx_wasm_contracts_code_hash ON wasm_contracts(code_hash);
CREATE INDEX idx_wasm_contract_calls_contract_address ON wasm_contract_calls(contract_address);
