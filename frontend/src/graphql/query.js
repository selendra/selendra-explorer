import { gql } from '@apollo/client';

const QUERY_ACCOUNT = gql`
  query ($limit: Int, $offset: Int) {
    account(limit: $limit, offset: $offset) {
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

const QUERY_BLOCKS = gql`
  query ($limit: Int, $offset: Int) {
    block(limit: $limit, offset: $offset) {
      id
      finalized
      hash
      extrinsic_root
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

const QUERY_EXTRINSIC = gql`
  query ($limit: Int, $offset: Int) {
    extrinsic(limit: $limit, offset: $offset) {
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

const QUERY_STACKING = gql`
  query ($limit: Int, $offset: Int, $orderBy: [staking_order_by!]) {
    staking(limit: $limit, offset: $offset, order_by: $orderBy) {
      amount
      event_id
      id
      signer
      timestamp
      type
    }
  }
`;

export {
  QUERY_ACCOUNT,
  QUERY_BLOCKS,
  QUERY_ACCOUNT_BY_ADDRESS,
  QUERY_COUNT_COLUMNS_ACCOUNT,
  QUERY_EXTRINSIC,
  QUERY_STACKING,
};
