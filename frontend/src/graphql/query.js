import { gql } from '@apollo/client';

const QUERY_ACCOUNTS = gql`
  query ($limit: Int, $offset: Int, $orderBy: [account_order_by!]) {
    account(limit: $limit, offset: $offset, order_by: $orderBy) {
      address
      voting_balance
      vested_balance
      timestamp
      free_balance
      evm_nonce
      evm_address
      available_balance
      block_id
      reserved_balance
      locked_balance
      nonce
      active
    }
  }
`;

const TOTAL_BLOCKS = gql`
  query {
    block_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const QUERY_ACCOUNT_BY_ADDRESS = gql`
  query ($address: String!) {
    account_by_pk(address: $address) {
      address
      voting_balance
      vested_balance
      timestamp
      free_balance
      evm_nonce
      evm_address
      available_balance
      block_id
      reserved_balance
      locked_balance
      nonce
      active
    }
  }
`;

const TOTAL_EVENTS = gql`
  query {
    event_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const QUERY_BLOCKS = gql`
  query ($offset: Int, $limit: Int, $orderBy: [block_order_by!]) {
    block(offset: $offset, limit: $limit, order_by: $orderBy) {
      author
      crawler_timestamp
      extrinsic_root
      finalized
      hash
      id
      parent_hash
      state_root
      timestamp
    }
  }
`;

const TOTAL_ACCOUNT = gql`
  query {
    account_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const QUERY_COUNT_COLUMNS_ACCOUNT = gql`
  query account_aggregate($columns: [account_select_column!]) {
    aggregate(columns: $column) {
      count(columns: $columns)
    }
  }
`;

const TOTAL_EXTRINSIC = gql`
  query {
    extrinsic_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const TOTAL_TRANSFER = gql`
  query {
    transfer_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const TOTAL_VALIDATOR = gql`
  query MyQuery {
    staking_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const LATEST_BLOCK = gql`
  query {
    block(limit: 5) {
      id
      hash
      timestamp
      author
    }
  }
`;
const QUERY_EXTRINSIC = gql`
  query (
    $limit: Int
    $offset: Int
    $where: extrinsic_bool_exp
    $orderBy: [extrinsic_order_by!]
  ) {
    extrinsic(
      limit: $limit
      offset: $offset
      where: $where
      order_by: $orderBy
    ) {
      args
      block_id
      docs
      error_message
      hash
      id
      index
      inherent_data
      method
      section
      signed_data
      signer
      status
      timestamp
      type
    }
  }
`;

const QUERY_STAKING = gql`
  query (
    $limit: Int
    $offset: Int
    $orderBy: [staking_order_by!]
    $where: staking_bool_exp
  ) {
    staking(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
      amount
      event_id
      id
      signer
      timestamp
      type
    }
  }
`;

const QUERY_TRANSFERS = gql`
  query (
    $limit: Int
    $offset: Int
    $orderBy: [transfer_order_by]
    $where: transfer_bool_exp
  ) {
    transfer(
      limit: $limit
      offset: $offset
      order_by: $orderBy
      where: $where
    ) {
      amount
      block_id
      denom
      error_message
      extrinsic_id
      fee_amount
      from_address
      from_evm_address
      id
      nft_id
      success
      timestamp
      to_address
      to_evm_address
      token_address
      type
    }
  }
`;

const QUERY_EVENTS = gql`
  query (
    $offset: Int
    $limit: Int
    $orderBy: [event_order_by!]
    $where: event_bool_exp
  ) {
    event(offset: $offset, limit: $limit, order_by: $orderBy, where: $where) {
      block_id
      data
      extrinsic_id
      id
      index
      method
      phase
      section
      timestamp
    }
  }
`;

const QUERY_TRANSFER_BY_PK = gql`
  query ($transferByPkId: bigint!) {
    transfer_by_pk(id: $transferByPkId) {
      amount
      block_id
      denom
      error_message
      extrinsic_id
      fee_amount
      from_address
      from_evm_address
      id
      nft_id
      success
      timestamp
      to_address
      to_evm_address
      token_address
      type
    }
  }
`;

const QUERY_BLOCK_BY_PK = gql`
  query ($blockByPkId: bigint!) {
    block_by_pk(id: $blockByPkId) {
      author
      crawler_timestamp
      extrinsic_root
      finalized
      hash
      id
      parent_hash
      state_root
      timestamp
    }
  }
`;

const QUERY_EXTRINSIC_BY_PK = gql`
  query ($extrinsicByPkId: bigint!) {
    extrinsic_by_pk(id: $extrinsicByPkId) {
      args
      block_id
      docs
      error_message
      hash
      id
      index
      inherent_data
      method
      section
      signed_data
      signer
      status
      timestamp
      type
    }
  }
`;

const QUERY_VALIDATOR = gql`
  query ($limit: Int, $offset: Int, $orderBy: [validator_order_by!]) {
    validator(limit: $limit, offset: $offset, order_by: $orderBy) {
      stash_address
      name
      total_stake
      verified_identity
      rank
      nominators
      active_eras
      self_stake
      total_rating
      performance
      commission
    }
  }
`;

const QUERY_CHAIN_INFO = gql`
  query {
    chain_info {
      count
      name
    }
  }
`;

export {
  QUERY_ACCOUNTS,
  QUERY_BLOCKS,
  TOTAL_BLOCKS,
  TOTAL_ACCOUNT,
  TOTAL_EXTRINSIC,
  TOTAL_TRANSFER,
  TOTAL_VALIDATOR,
  TOTAL_EVENTS,
  LATEST_BLOCK,
  QUERY_ACCOUNT_BY_ADDRESS,
  QUERY_COUNT_COLUMNS_ACCOUNT,
  QUERY_EXTRINSIC,
  QUERY_STAKING,
  QUERY_TRANSFERS,
  QUERY_TRANSFER_BY_PK,
  QUERY_BLOCK_BY_PK,
  QUERY_EXTRINSIC_BY_PK,
  QUERY_EVENTS,
  QUERY_VALIDATOR,
  QUERY_CHAIN_INFO,
};
