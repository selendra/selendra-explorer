-- Drop tables in reverse order to avoid foreign key constraints
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS token_transfers;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS blocks;
