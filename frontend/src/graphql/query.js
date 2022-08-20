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

export { QUERY_ACCOUNT, QUERY_BLOCKS };
