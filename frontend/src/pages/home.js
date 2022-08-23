import { Col, Row } from 'antd';
import Search from '../components/Search';
import Overview from '../components/Overview';
import BlocksTable from '../components/BlocksTable';
import TransferTable from '../components/TransferTable';
import AccountsTable from '../components/AccountsTable';
import {
  TOTAL_BLOCKS,
  TOTAL_EXTRINSIC,
  TOTAL_ACCOUNT,
  TOTAL_TRANSFER,
  TOTAL_VALIDATOR,
  QUERY_BLOCKS,
  QUERY_ACCOUNTS,
  QUERY_TRANSFERS,
} from '../graphql/query';
import { useQuery } from '@apollo/client';
import { useGraphQL } from '../context/useApp';

export default function Home() {
  const { query } = useGraphQL();
  const blocks = query(
    useQuery(QUERY_BLOCKS, {
      variables: {
        limit: 5,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    })
  );

  const accounts = query(
    useQuery(QUERY_ACCOUNTS, {
      variables: {
        limit: 5,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    })
  );

  const transfers = query(
    useQuery(QUERY_TRANSFERS, {
      variables: {
        limit: 5,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    })
  );

  const { block_aggregate } = query(useQuery(TOTAL_BLOCKS));
  const { extrinsic_aggregate } = query(useQuery(TOTAL_EXTRINSIC));
  const { account_aggregate } = query(useQuery(TOTAL_ACCOUNT));
  const { transfer_aggregate } = query(useQuery(TOTAL_TRANSFER));
  const { staking_aggregate } = query(useQuery(TOTAL_VALIDATOR));

  const total_issuance = '';
  const total_lockBalance = '';
  const waitingCount = '';

  return (
    <div>
      <div className="home-container">
        <div className="home-info">
          <h1>Selendra Blocks Explorer</h1>
          <div className="spacing" />
          <Search />
          <div className="spacing" />
          <Overview
            total_blocks={block_aggregate?.aggregate.count}
            total_blocksFinalized={block_aggregate?.aggregate.count}
            total_extrinsicSigned={extrinsic_aggregate?.aggregate.count}
            total_accounts={account_aggregate?.aggregate.count}
            total_transfers={transfer_aggregate?.aggregate.count}
            total_validators={staking_aggregate?.aggregate.count}
            // total_issuance={total_issuance}
            // total_lockBalance={total_lockBalance}
            // waitingCount={waitingCount}
          />
        </div>
      </div>
      <div className="home-info">
        <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <Col xs={24} md={24} lg={12} xl={12}>
            <div className="home-table">
              {blocks.block ? (
                <BlocksTable short data={blocks?.block} />
              ) : (
                blocks
              )}
            </div>
          </Col>
          <Col xs={24} md={24} lg={12} xl={12}>
            {accounts.account ? (
              <AccountsTable short accounts={accounts?.account} />
            ) : (
              accounts
            )}
          </Col>
        </Row>
      </div>
      <div className="home-info">
        <div className="home-table">
          {transfers.transfer ? (
            <TransferTable short data={transfers?.transfer} />
          ) : (
            transfers
          )}
        </div>
      </div>
    </div>
  );
}
