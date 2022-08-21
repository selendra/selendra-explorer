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

const TOTAL_BLOCKS = gql`
  query {
    block_aggregate {
      aggregate {
        count
      }
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

const TOTAL_ACCOUNT = gql`
  query {
    account_aggregate {
      aggregate {
        count
      }
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

export {
  QUERY_ACCOUNT,
  QUERY_BLOCKS,
  TOTAL_BLOCKS,
  TOTAL_ACCOUNT,
  TOTAL_EXTRINSIC,
  TOTAL_TRANSFER,
  TOTAL_VALIDATOR,
  LATEST_BLOCK,
};
