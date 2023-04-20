import { gql } from "@apollo/client";

const QUERY_ACCOUNTS = gql`
  query ($limit: Int, $offset: Int, $orderBy: [account_order_by!]) {
    account(limit: $limit, offset: $offset, order_by: $orderBy) {
      account_id
      free_balance
      available_balance
      nonce
      reserved_balance
      total_balance
      timestamp
      locked_balance
      block_height
      identity
      identity_display
      identity_display_parent
    }
  }
`;

const TOTAL_BLOCKS = gql`
  query ($orderBy: [block_order_by!], $limit: Int, $offset: Int) {
    block(order_by: $orderBy, limit: $limit, offset: $offset){
      block_number
    }
  }
`;

const TOTAL_ISSUANCE = gql`
  query ($orderBy: [block_order_by!], $limit: Int, $offset: Int) {
    block(order_by: $orderBy, limit: $limit, offset: $offset){
      total_issuance
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
      block_author
      extrinsics_root
      finalized
      block_hash      
      parent_hash
      state_root
      timestamp
      block_number
    }
  }
`;

const TOTAL_ACCOUNT = gql`
  query {
    account_aggregate {
      aggregate {
        sum {
          free_balance
        }
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
    $orderBy: [transfer_order_by!]
    $where: transfer_bool_exp
  ) {
    transfer(
      limit: $limit
      offset: $offset
      order_by: $orderBy
      where: $where
    ) {
      amount
      block_number
      source
      destination
      extrinsic_index
      fee_amount
      hash
      success
      timestamp
      error_message
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
      extrinsic {
        hash
      }
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
      extrinsics {
        block_id
        hash
        index
        section
        timestamp
        status
        method
      }
      logs {
        block_id
        data
        engine
        index
        timestamp
        type
      }
      events {
        block_id
        index
        method
        section
        timestamp
      }
      transfers {
        success
        amount
        from_address
        to_address
      }
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

const QUERY_VALIDATOR_BY_PK = gql`
  query ($blockId: bigint!, $stashAddress: String!) {
    validator_by_pk(block_id: $blockId, stash_address: $stashAddress) {
      timestamp
      identity
      stash_address
      controller_address
      commission
      total_stake
      block_id
      commission_rating
      name
      nominations
      stake_history
      era_points_history
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
      block_id
    }
  }
`;

const QUERY_CHAIN_INFO = gql`
  query {
    total {
      count
      name
    }
  }
`;

const TOTAL_VALIDATOR = gql`
  query {
    validator_aggregate {
      aggregate {
        sum {
          total_stake
          self_stake
        }
      }
    }
  }
`;

export {
	QUERY_ACCOUNTS,
	QUERY_BLOCKS,
	TOTAL_BLOCKS,
	TOTAL_ISSUANCE,
	TOTAL_ACCOUNT,
	TOTAL_EXTRINSIC,
	TOTAL_TRANSFER,
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
	QUERY_VALIDATOR_BY_PK,
	TOTAL_VALIDATOR,
};
