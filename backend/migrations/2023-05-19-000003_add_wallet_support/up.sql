-- Create wallet_sessions table for managing wallet connections
CREATE TABLE wallet_sessions (
    id SERIAL PRIMARY KEY,
    address VARCHAR(66) NOT NULL,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    wallet_type VARCHAR(20) NOT NULL, -- 'substrate', 'evm', etc.
    last_active TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    metadata JSONB
);

-- Create wallet_assets table for tracking user assets
CREATE TABLE wallet_assets (
    id SERIAL PRIMARY KEY,
    address VARCHAR(66) NOT NULL,
    asset_type VARCHAR(20) NOT NULL, -- 'native', 'token', 'nft', etc.
    asset_address VARCHAR(66), -- null for native tokens
    balance TEXT NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(address, asset_type, asset_address)
);

-- Create wallet_staking table for tracking staking and delegation
CREATE TABLE wallet_staking (
    id SERIAL PRIMARY KEY,
    address VARCHAR(66) NOT NULL,
    validator_address VARCHAR(66) NOT NULL,
    amount TEXT NOT NULL,
    reward_address VARCHAR(66),
    status VARCHAR(20) NOT NULL, -- 'active', 'unbonding', etc.
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(address, validator_address)
);

-- Create saved_contracts table for user's saved contracts
CREATE TABLE saved_contracts (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(66) NOT NULL,
    contract_address VARCHAR(66) NOT NULL,
    contract_name VARCHAR(100),
    contract_type VARCHAR(10) NOT NULL, -- 'evm', 'wasm'
    list_name VARCHAR(100) DEFAULT 'Default',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_address, contract_address)
);

-- Create saved_code table for user's saved code
CREATE TABLE saved_code (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(66) NOT NULL,
    code_name VARCHAR(100) NOT NULL,
    code_content TEXT NOT NULL,
    language VARCHAR(20) NOT NULL, -- 'solidity', 'ink', etc.
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_wallet_sessions_address ON wallet_sessions(address);
CREATE INDEX idx_wallet_sessions_token ON wallet_sessions(session_token);
CREATE INDEX idx_wallet_assets_address ON wallet_assets(address);
CREATE INDEX idx_wallet_staking_address ON wallet_staking(address);
CREATE INDEX idx_saved_contracts_user_address ON saved_contracts(user_address);
CREATE INDEX idx_saved_contracts_list_name ON saved_contracts(list_name);
CREATE INDEX idx_saved_code_user_address ON saved_code(user_address);
