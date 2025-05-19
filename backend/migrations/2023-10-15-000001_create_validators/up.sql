CREATE TABLE validators (
    id SERIAL PRIMARY KEY,
    address VARCHAR NOT NULL UNIQUE,
    name VARCHAR,
    identity VARCHAR,
    total_stake TEXT NOT NULL,
    self_stake TEXT NOT NULL,
    commission_rate FLOAT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    blocks_produced INTEGER NOT NULL DEFAULT 0,
    uptime_percentage FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX validators_active_idx ON validators (active);
CREATE INDEX validators_commission_rate_idx ON validators (commission_rate);
