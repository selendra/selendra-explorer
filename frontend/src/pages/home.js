import { Col, Row } from 'antd';
import Search from '../components/Search';
import Overview from '../components/Overview';
import BlocksTable from '../components/BlocksTable';
import TransferTable from '../components/TransferTable';
import AccountsTable from '../components/AccountsTable';
// import { useAPIState } from '../context/APIContext';
// import bannerImg from '../assets/loading.png';
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
        offset: 0,
      },
    }),
  );

  const accounts = query(
    useQuery(QUERY_ACCOUNTS, {
      variables: {
        limit: 5,
        offset: 0,
      },
    }),
  );

  const transfers = query(
    useQuery(QUERY_TRANSFERS, {
      variables: {
        limit: 5,
        offset: 0,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    }),
  );

  const { block_aggregate } = query(useQuery(TOTAL_BLOCKS));
  const { extrinsic_aggregate } = query(useQuery(TOTAL_EXTRINSIC));
  const { account_aggregate } = query(useQuery(TOTAL_ACCOUNT));
  const { transfer_aggregate } = query(useQuery(TOTAL_TRANSFER));
  const { staking_aggregate } = query(useQuery(TOTAL_VALIDATOR));

  const total_issuance = 100;
  const total_lockBalance = 100;
  const waitingCount = 200;

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
            // total_issuance={
            //   issuance.issuance_aggregate &&
            //   issuance.issuance_aggregate.aggregate.count
            // }
            total_validators={staking_aggregate?.aggregate.count}
            // total_lockBalance={
            //   lockBalance.lockBalance_aggregate &&
            //   lockBalance.lockBalance_aggregate.aggregate.count
            // }
            // waitingCount={
            //   waitingCount.waitingCount_aggregate &&
            //   waitingCount.waitingCount_aggregate.aggregate.count
            // }
            total_issuance={total_issuance}
            total_lockBalance={total_lockBalance}
            waitingCount={waitingCount}
          />
        </div>
      </div>
      <div className="home-info">
        <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <Col xs={24} md={24} lg={12} xl={12}>
            <p className="home-subTitle">Latest Blocks</p>
            {blocks.block ? <BlocksTable short data={blocks?.block} /> : blocks}
          </Col>
          <Col xs={24} md={24} lg={12} xl={12}>
            <p className="home-subTitle">Account Updates</p>
            {accounts.account ? (
              <AccountsTable short accounts={accounts?.account} />
            ) : (
              accounts
            )}
          </Col>
        </Row>
      </div>
      <div className="home-info">
        <p className="home-subTitle">Latest Transactions</p>
        {transfers.transfer ? (
          <TransferTable short data={transfers?.transfer} />
        ) : (
          transfers
        )}
      </div>
    </div>
  );
}
