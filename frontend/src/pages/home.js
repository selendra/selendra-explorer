import { Col, Row } from 'antd';
import { useEffect, useState } from 'react';
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
  LATEST_BLOCK,
} from '../graphql/query';
import { useQuery } from '@apollo/client';
import { useGraphQL } from '../context/useApp';

export default function Home() {
  const { query } = useGraphQL();
  const [overview, setOverview] = useState();

  // const { api } = useAPIState();
  // const [loading, setLoading] = useState(true);
  // const [blockNumber, setBlockNumber] = useState(0);
  // const [blockNumberFinalized, setBlockNumberFinalized] = useState(0);
  // const [validators, setValidators] = useState(0);
  // const [loading, setLoading] = useState(false);

  const block = query(useQuery(TOTAL_BLOCKS));
  const extrins = query(useQuery(TOTAL_EXTRINSIC));
  const accounts = query(useQuery(TOTAL_ACCOUNT));
  const transfers = query(useQuery(TOTAL_TRANSFER));
  const validators = query(useQuery(TOTAL_VALIDATOR));
  const latest_block = query(useQuery(TOTAL_VALIDATOR), {
    variables: { limit: 5, offset: 1 },
  });

  // const bestNumber = api.derive.chain.bestNumber;
  // const bestNumberFinalized = api.derive.chain.bestNumberFinalized;
  // const validatorsData = api.query.session.validators;
  // useEffect(() => {
  //   let unsubscribeAll = null;

  //   bestNumber((number) => {
  //     setBlockNumber(number.toNumber().toLocaleString('en-US'));
  //   });
  //   bestNumberFinalized((number) => {
  //     setBlockNumberFinalized(number.toNumber().toLocaleString('en-US'));
  //   });
  //   validatorsData((data) => {
  //     setValidators(data.toHuman());
  //   })
  //     .then((unsub) => {
  //       unsubscribeAll = unsub;
  //     })
  //     .catch(console.error);

  //   return () => unsubscribeAll && unsubscribeAll();
  // }, [bestNumber, bestNumberFinalized, validatorsData]);

  // useEffect(() => {
  //   Promise.all([
  //     fetch(`${process.env.REACT_APP_API}/block/all/1`),
  //     fetch(`${process.env.REACT_APP_API}/transfer/all/1`),
  //     fetch(`${process.env.REACT_APP_API}/totals`),
  //     fetch(`${process.env.REACT_APP_API}/staking/status`),
  //     fetch(`${process.env.REACT_APP_API}/totals/lock_balances`),
  //     fetch(`${process.env.REACT_APP_API}/staking/status`),
  //     fetch(`${process.env.REACT_APP_API}/account/all/1`),
  //   ])
  //     .then(async ([a, b, c, d, e, f, g]) => {
  //       const block = await a.json();
  //       const transfer = await b.json();
  //       const total = await c.json();
  //       const staking = await d.json();
  //       const totalLock = await e.json();
  //       const waitingCount = await f.json();
  //       const account = await g.json();

  //       setLoading(false);
  //       setOverview({
  //         waitingCount,
  //         block,
  //         transfer,
  //         total,
  //         staking,
  //         totalLock,
  //         account,
  //       });
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //     });
  // }, [blockNumber]);

  // if (loading || loadingblock)
  //   return (
  //     <div className="container">
  //       <Loading />
  //     </div>
  //   );

  const total_issuance = 100;
  const total_lockBalance = 100;
  const waitingCount = 200;

  console.log('latest', latest_block.block);

  return (
    <div>
      <div className="home-container">
        <div className="home-info">
          <h1>Selendra Blocks Explorer</h1>
          <div className="spacing" />
          <Search />
          <div className="spacing" />
          <Overview
            total_blocks={
              block.block_aggregate && block.block_aggregate.aggregate.count
            }
            total_blocksFinalized={
              (block.block_aggregate && block.block_aggregate.aggregate.count) -
              4
            }
            total_extrinsicSigned={
              extrins.extrinsic_aggregate &&
              extrins.extrinsic_aggregate.aggregate.count
            }
            total_accounts={
              accounts.account_aggregate &&
              accounts.account_aggregate.aggregate.count
            }
            total_transfers={
              transfers.transfer_aggregate &&
              transfers.transfer_aggregate.aggregate.count
            }
            // total_issuance={
            //   issuance.issuance_aggregate &&
            //   issuance.issuance_aggregate.aggregate.count
            // }
            total_validators={
              validators.staking_aggregate &&
              validators.staking_aggregate.aggregate.count
            }
            // total_lockBalance={
            //   lockBalance.lockBalance_aggregate &&
            //   lockBalance.lockBalance_aggregate.aggregate.count
            // }
            // waitingCount={
            //   waitingCount.waitingCount_aggregate &&
            //   waitingCount.waitingCount_aggregate.aggregate.count
            // }
            total_issuance={total_issuance}
            // total_validators={total_validators}
            total_lockBalance={total_lockBalance}
            waitingCount={waitingCount}
          />
        </div>
      </div>
      {/* <Loading /> */}
      <div className="home-info">
        <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <Col xs={24} md={24} lg={12} xl={12}>
            <p className="home-subTitle">Latest Blocks</p>
            <BlocksTable short data={latest_block} />
          </Col>
          <Col xs={24} md={24} lg={12} xl={12}>
            <p className="home-subTitle">Account Updates</p>
            <AccountsTable short data={overview?.account} />
          </Col>
        </Row>
      </div>
      <div className="home-info">
        <p className="home-subTitle">Latest Transactions</p>
        <TransferTable short data={overview?.transfer} />
      </div>
    </div>
  );
}
