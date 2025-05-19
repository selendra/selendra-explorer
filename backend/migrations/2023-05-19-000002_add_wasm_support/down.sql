-- Drop indexes
DROP INDEX IF EXISTS idx_wasm_contract_calls_contract_address;
DROP INDEX IF EXISTS idx_wasm_contracts_code_hash;
DROP INDEX IF EXISTS idx_events_extrinsic_hash;
DROP INDEX IF EXISTS idx_events_section_method;
DROP INDEX IF EXISTS idx_events_block_number;
DROP INDEX IF EXISTS idx_extrinsics_section_method;
DROP INDEX IF EXISTS idx_extrinsics_signer;
DROP INDEX IF EXISTS idx_extrinsics_block_number;

-- Drop tables in reverse order to avoid foreign key constraints
DROP TABLE IF EXISTS wasm_contract_calls;
DROP TABLE IF EXISTS wasm_code_storage;
DROP TABLE IF EXISTS wasm_contracts;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS extrinsics;

-- Remove added columns
ALTER TABLE contracts DROP COLUMN IF EXISTS contract_type;
ALTER TABLE transactions DROP COLUMN IF EXISTS execution_type;
ALTER TABLE blocks DROP COLUMN IF EXISTS validator_set;
ALTER TABLE blocks DROP COLUMN IF EXISTS extrinsics_root;
ALTER TABLE blocks DROP COLUMN IF EXISTS finalized;
ALTER TABLE blocks DROP COLUMN IF EXISTS consensus_engine;
