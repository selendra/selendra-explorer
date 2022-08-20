import { Col, Row } from 'antd';
import { useEffect, useState } from 'react';
import Search from '../components/Search';
import Overview from '../components/Overview';
import BlocksTable from '../components/BlocksTable';
import TransferTable from '../components/TransferTable';
import AccountsTable from '../components/AccountsTable';
// import { useAPIState } from '../context/APIContext';
import Loading from '../components/Loading';
// import bannerImg from '../assets/loading.png';
import { QUERY_ACCOUNT, QURERY_BLOCKS } from '../graphql/query';
import { useQuery } from '@apollo/client';

export default function Home() {
  // const { api } = useAPIState();
  // const [loading, setLoading] = useState(true);
  // const [blockNumber, setBlockNumber] = useState(0);
  // const [blockNumberFinalized, setBlockNumberFinalized] = useState(0);
  // const [validators, setValidators] = useState(0);
  const [overview, setOverview] = useState();
  // const [loading, setLoading] = useState(false);
  const { data: data1, loading } = useQuery(QUERY_ACCOUNT);
  const { data: block, loading: loadingblock } = useQuery(QURERY_BLOCKS);

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

  if (loading || loadingblock)
    return (
      <div className="container">
        <Loading />
      </div>
    );

  const {
    // blocks,
    blocksFinalized,
    extrinsicSigned,
    accounts,
    transfers,
    issuance,
    validators,
    lockBalance,
    waitingCount,
  } = [100];

  const total_blocks = block;

  return (
    <div>
      <div className="home-container">
        <div className="home-info">
          <h1>Selendra Blocks Explorer</h1>
          <div className="spacing" />
          <Search />
          <div className="spacing" />
          <Overview
            total_blocks={total_blocks}
            total_blocksFinalized={blocksFinalized}
            total_extrinsicSigned={extrinsicSigned}
            total_accounts={accounts}
            total_transfers={transfers}
            total_issuance={issuance}
            total_validators={validators}
            total_lockBalance={lockBalance}
            waitingCount={waitingCount}
          />
        </div>
      </div>
      {/* <Loading /> */}
      <div className="home-info">
        <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <Col xs={24} md={24} lg={12} xl={12}>
            <p className="home-subTitle">Latest Blocks</p>
            <BlocksTable short data={overview?.block} />
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
