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

// const QUERY_ACCOUNT_BY_ADDRESS = gql`
//   query ($address: String!) {
//     account_by_pk(address: $address) {
//       address
//       voting_balance
//       vested_balance
//       timestamp
//       free_balance
//       evm_nonce
//       evm_address
//       available_balance
//       block_id
//       reserved_balance
//       locked_balance
//       nonce
//       active
//     }
//   }
// `;

const QUERY_ACCOUNT_BY_ADDRESS = gql`
   query ($account_id: String!) {
     account_by_pk(account_id: $account_id) {
      account_id
      timestamp
      free_balance
      locked_balance
      reserved_balance
      nonce
      available_balance
      block_height
      total_balance
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
      block_number
      doc
      error_message
      hash
      extrinsic_index
      method
      section
      is_signed
      signer
      success
      timestamp
      fee_info
      fee_details
    }
  }
`;

const QUERY_STAKING = gql`
  query ($limit: Int, $offset: Int, $where: staking_reward_bool_exp, $orderBy: [staking_reward_order_by!]) {
    staking_reward(limit: $limit, offset: $offset, where: $where, order_by: $orderBy) {
      event_index
      amount
      account_id
      validator_stash_address
      block_number
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
  query ($limit: Int, $offset: Int, $orderBy: [event_order_by!]) {
    event(limit: $limit, offset: $offset, order_by: $orderBy) {
      block_number
      data
      event_index
      method
      section
      timestamp
      types
      phase
      doc
    }
  }
  
`;

const QUERY_TRANSFER_BY_PK = gql`
  query ($blockNumber: bigint!, $extrinsicIndex: Int!) {
    transfer_by_pk(block_number: $blockNumber, extrinsic_index: $extrinsicIndex) {
      amount
      block_number
      destination
      error_message
      extrinsic_index
      fee_amount
      hash
      method
      section
      source
      success
      timestamp
    }
  }
`;

const QUERY_BLOCK_BY_PK = gql`
  query ($blockNumber: bigint!) {
    block_by_pk(block_number: $blockNumber) {
      extrinsics_root
      finalized
      state_root
      block_hash
      block_author
      block_author_name
      parent_hash
      current_index
      block_number
      timestamp
      extrinsics {
        block_number
        hash
        signer
        success
        timestamp
        method
        section
        extrinsic_index
        is_signed
      }
      logs {
        data
        block_number
        engine
        log_index
        timestamp
        type
      }
      events {
        block_number
        event_index
        method
        section
        timestamp
        types
      }
      transfers {
        amount
        fee_amount
        block_number
        destination
        hash
        method
        section
        source
        success
        timestamp
      }   
    }
  }
`;

const QUERY_EXTRINSIC_BY_PK = gql`
  query ($blockNumber: bigint!, $extrinsicIndex: Int!) {
    extrinsic_by_pk(block_number: $blockNumber, extrinsic_index: $extrinsicIndex) {
      args
      block_number
      doc
      error_message
      hash
      extrinsic_index
      method
      section
      signer
      success
      timestamp
      is_signed
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

// const QUERY_VALIDATOR = gql`
//   query ($limit: Int, $offset: Int, $orderBy: [validator_order_by!]) {
//     validator(limit: $limit, offset: $offset, order_by: $orderBy) {
//       stash_address
//       name
//       total_stake
//       verified_identity
//       rank
//       nominators
//       active_eras
//       self_stake
//       total_rating
//       performance
//       commission
//       block_id
//     }
//   }
// `;

const QUERY_VALIDATOR = gql`
  query ($limit: Int, $offset: Int, $orderBy: [ranking_order_by!]) {
    ranking(limit: $limit, offset: $offset, order_by: $orderBy) {
      active
      active_eras
      other_stake
      nominations
      nominators
      total_stake
      self_stake
      rank
      name
      performance
      verified_identity
      stash_address
      block_height
      total_rating
      commission
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
