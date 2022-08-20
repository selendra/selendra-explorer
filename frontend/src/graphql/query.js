import { gql } from '@apollo/client';

const QUERY_ACCOUNT = gql`
  query {
    account {
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

const QURERY_BLOCKS = gql`
  query {
    block_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export { QUERY_ACCOUNT, QURERY_BLOCKS };
