// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (address) {
        address -> Varchar,
        balance -> Text,
        nonce -> Int4,
        code -> Nullable<Text>,
        is_contract -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    blocks (hash) {
        hash -> Varchar,
        number -> Int8,
        timestamp -> Timestamp,
        parent_hash -> Varchar,
        author -> Nullable<Varchar>,
        state_root -> Varchar,
        transactions_root -> Varchar,
        receipts_root -> Varchar,
        gas_used -> Int8,
        gas_limit -> Int8,
        extra_data -> Nullable<Text>,
        logs_bloom -> Nullable<Text>,
        size -> Nullable<Int4>,
        difficulty -> Nullable<Text>,
        total_difficulty -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        consensus_engine -> Nullable<Varchar>,
        finalized -> Nullable<Bool>,
        extrinsics_root -> Nullable<Varchar>,
        validator_set -> Nullable<Text>,
    }
}

diesel::table! {
    contracts (address) {
        address -> Varchar,
        creator_address -> Varchar,
        creator_transaction_hash -> Varchar,
        bytecode -> Text,
        abi -> Nullable<Text>,
        name -> Nullable<Text>,
        compiler_version -> Nullable<Text>,
        optimization_used -> Nullable<Bool>,
        runs -> Nullable<Int4>,
        verified -> Bool,
        verification_date -> Nullable<Timestamp>,
        license_type -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        contract_type -> Varchar,
    }
}

diesel::table! {
    events (id) {
        id -> Int4,
        block_hash -> Varchar,
        block_number -> Int8,
        extrinsic_hash -> Nullable<Varchar>,
        extrinsic_index -> Nullable<Int4>,
        event_index -> Int4,
        section -> Varchar,
        method -> Varchar,
        data -> Jsonb,
        phase -> Varchar,
        created_at -> Timestamp,
    }
}

diesel::table! {
    extrinsics (hash) {
        hash -> Varchar,
        block_hash -> Varchar,
        block_number -> Int8,
        index -> Int4,
        signer -> Nullable<Varchar>,
        section -> Varchar,
        method -> Varchar,
        args -> Nullable<Jsonb>,
        success -> Bool,
        is_signed -> Bool,
        signature -> Nullable<Varchar>,
        nonce -> Nullable<Int4>,
        tip -> Nullable<Int8>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    logs (id) {
        id -> Int4,
        transaction_hash -> Varchar,
        block_hash -> Varchar,
        block_number -> Int8,
        address -> Varchar,
        data -> Text,
        log_index -> Int4,
        topic0 -> Nullable<Varchar>,
        topic1 -> Nullable<Varchar>,
        topic2 -> Nullable<Varchar>,
        topic3 -> Nullable<Varchar>,
        created_at -> Timestamp,
    }
}

diesel::table! {
    token_transfers (id) {
        id -> Int4,
        token_address -> Varchar,
        from_address -> Varchar,
        to_address -> Varchar,
        value -> Text,
        transaction_hash -> Varchar,
        log_index -> Int4,
        block_number -> Int8,
        created_at -> Timestamp,
    }
}

diesel::table! {
    tokens (address) {
        address -> Varchar,
        name -> Nullable<Text>,
        symbol -> Nullable<Text>,
        decimals -> Nullable<Int4>,
        total_supply -> Nullable<Text>,
        token_type -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    transactions (hash) {
        hash -> Varchar,
        block_hash -> Varchar,
        block_number -> Int8,
        from_address -> Varchar,
        to_address -> Nullable<Varchar>,
        value -> Text,
        gas -> Int8,
        gas_price -> Int8,
        input -> Nullable<Text>,
        nonce -> Int4,
        transaction_index -> Int4,
        status -> Nullable<Bool>,
        transaction_type -> Nullable<Int4>,
        max_fee_per_gas -> Nullable<Int8>,
        max_priority_fee_per_gas -> Nullable<Int8>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        execution_type -> Varchar,
    }
}

diesel::table! {
    wasm_code_storage (code_hash) {
        code_hash -> Varchar,
        code -> Bytea,
        uploaded_by -> Varchar,
        upload_extrinsic_hash -> Varchar,
        created_at -> Timestamp,
    }
}

diesel::table! {
    wasm_contracts (address) {
        address -> Varchar,
        creator_address -> Varchar,
        creator_extrinsic_hash -> Varchar,
        code_hash -> Varchar,
        init_args -> Nullable<Jsonb>,
        contract_type -> Varchar,
        metadata -> Nullable<Jsonb>,
        verified -> Bool,
        verification_date -> Nullable<Timestamp>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    wasm_contract_calls (id) {
        id -> Int4,
        extrinsic_hash -> Varchar,
        contract_address -> Varchar,
        method -> Varchar,
        args -> Nullable<Jsonb>,
        value -> Nullable<Text>,
        gas_limit -> Nullable<Int8>,
        gas_used -> Nullable<Int8>,
        success -> Bool,
        return_data -> Nullable<Text>,
        created_at -> Timestamp,
    }
}

diesel::joinable!(contracts -> accounts (address));
diesel::joinable!(contracts -> transactions (creator_transaction_hash));
diesel::joinable!(events -> blocks (block_hash));
diesel::joinable!(events -> extrinsics (extrinsic_hash));
diesel::joinable!(extrinsics -> blocks (block_hash));
diesel::joinable!(logs -> blocks (block_hash));
diesel::joinable!(logs -> transactions (transaction_hash));
diesel::joinable!(token_transfers -> tokens (token_address));
diesel::joinable!(token_transfers -> transactions (transaction_hash));
diesel::joinable!(tokens -> contracts (address));
diesel::joinable!(transactions -> blocks (block_hash));
diesel::joinable!(wasm_code_storage -> extrinsics (upload_extrinsic_hash));
diesel::joinable!(wasm_contracts -> extrinsics (creator_extrinsic_hash));
diesel::joinable!(wasm_contract_calls -> extrinsics (extrinsic_hash));
diesel::joinable!(wasm_contract_calls -> wasm_contracts (contract_address));

diesel::table! {
    saved_code (id) {
        id -> Int4,
        user_address -> Varchar,
        code_name -> Varchar,
        code_content -> Text,
        language -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    saved_contracts (id) {
        id -> Int4,
        user_address -> Varchar,
        contract_address -> Varchar,
        contract_name -> Nullable<Varchar>,
        contract_type -> Varchar,
        list_name -> Varchar,
        notes -> Nullable<Text>,
        created_at -> Timestamp,
    }
}

diesel::table! {
    wallet_assets (id) {
        id -> Int4,
        address -> Varchar,
        asset_type -> Varchar,
        asset_address -> Nullable<Varchar>,
        balance -> Text,
        last_updated -> Timestamp,
        metadata -> Nullable<Jsonb>,
    }
}

diesel::table! {
    wallet_sessions (id) {
        id -> Int4,
        address -> Varchar,
        session_token -> Varchar,
        wallet_type -> Varchar,
        last_active -> Timestamp,
        created_at -> Timestamp,
        expires_at -> Timestamp,
        metadata -> Nullable<Jsonb>,
    }
}

diesel::table! {
    wallet_staking (id) {
        id -> Int4,
        address -> Varchar,
        validator_address -> Varchar,
        amount -> Text,
        reward_address -> Nullable<Varchar>,
        status -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    validators (id) {
        id -> Int4,
        address -> Varchar,
        name -> Nullable<Varchar>,
        identity -> Nullable<Varchar>,
        total_stake -> Text,
        self_stake -> Text,
        commission_rate -> Float8,
        active -> Bool,
        blocks_produced -> Int4,
        uptime_percentage -> Float8,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        metadata -> Nullable<Jsonb>,
    }
}

diesel::table! {
    staking_rewards (id) {
        id -> Int4,
        address -> Varchar,
        validator_address -> Varchar,
        amount -> Text,
        era -> Int4,
        timestamp -> Timestamp,
        claimed -> Bool,
        claimed_at -> Nullable<Timestamp>,
        transaction_hash -> Nullable<Varchar>,
        metadata -> Nullable<Jsonb>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    blocks,
    contracts,
    events,
    extrinsics,
    logs,
    saved_code,
    saved_contracts,
    staking_rewards,
    token_transfers,
    tokens,
    transactions,
    validators,
    wallet_assets,
    wallet_sessions,
    wallet_staking,
    wasm_code_storage,
    wasm_contracts,
    wasm_contract_calls,
);
