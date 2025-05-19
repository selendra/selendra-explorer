CREATE TABLE staking_rewards (
    id SERIAL PRIMARY KEY,
    address VARCHAR NOT NULL,
    validator_address VARCHAR NOT NULL,
    amount TEXT NOT NULL,
    era INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_at TIMESTAMP,
    transaction_hash VARCHAR,
    metadata JSONB,
    FOREIGN KEY (validator_address) REFERENCES validators(address)
);

CREATE INDEX staking_rewards_address_idx ON staking_rewards (address);
CREATE INDEX staking_rewards_validator_address_idx ON staking_rewards (validator_address);
CREATE INDEX staking_rewards_claimed_idx ON staking_rewards (claimed);
