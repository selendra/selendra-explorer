-- Drop indexes
DROP INDEX IF EXISTS idx_saved_code_user_address;
DROP INDEX IF EXISTS idx_saved_contracts_list_name;
DROP INDEX IF EXISTS idx_saved_contracts_user_address;
DROP INDEX IF EXISTS idx_wallet_staking_address;
DROP INDEX IF EXISTS idx_wallet_assets_address;
DROP INDEX IF EXISTS idx_wallet_sessions_token;
DROP INDEX IF EXISTS idx_wallet_sessions_address;

-- Drop tables in reverse order to avoid foreign key constraints
DROP TABLE IF EXISTS saved_code;
DROP TABLE IF EXISTS saved_contracts;
DROP TABLE IF EXISTS wallet_staking;
DROP TABLE IF EXISTS wallet_assets;
DROP TABLE IF EXISTS wallet_sessions;
