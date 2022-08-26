import { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import TableStaking from '../../components/TableStaking';
import DataField from '../../components/Overview/DataFieldStack';
import { calcInflation } from '../../utils/calcInflation';
import { useAPIState } from '../../context/APIContext';
import { BigNumber } from 'bignumber.js';
import Loading from '../../components/Loading';
import Chart from '../../components/chart';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import {
  QUERY_STAKING,
  QUERY_CHAIN_INFO,
  QUERY_VALIDATOR,
} from '../../graphql/query';
import { filterCount } from '../../utils/chainInfo';
import { useSearchParams } from 'react-router-dom';

export default function Staking() {
  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 10 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));

  const { query } = useGraphQL();
  const { chain_info } = query(useQuery(QUERY_CHAIN_INFO));

  let start = sizePage;
  let end = currentPage;

  const validator = query(
    useQuery(QUERY_VALIDATOR, {
      variables: { limit: parseInt(start), offset: parseInt(end) - 1 },
    }),
  );

  const staking = query(
    useQuery(QUERY_STAKING, {
      variables: { limit: 10, offset: 0 },
    }),
  );
  // const { api } = useAPIState();
  // const [loading, setLoading] = useState(false);
  // const [data, setData] = useState();
  // const [inflation, setInflation] = useState();

  // useEffect(() => {
  //   setLoading(true);
  //   Promise.all([
  //     fetch(`${process.env.REACT_APP_API}/staking/status`),
  //     fetch(`${process.env.REACT_APP_API}/totals/norminate`),
  //     fetch(`${process.env.REACT_APP_API}/staking/validators`),
  //     fetch(`${process.env.REACT_APP_API}/totals/staking`),
  //   ])
  //     .then(async ([a, b, c, d]) => {
  //       const status = await a.json();
  //       const norminate_balance = await b.json();
  //       const validators = await c.json();
  //       const total_staking = await d.json();

  //       setLoading(false);
  //       setData({
  //         status,
  //         norminate_balance,
  //         validators,
  //         total_staking,
  //         self_staking:
  //           Number(total_staking.totalStake) -
  //           Number(norminate_balance.otherStake),
  //       });
  //     })
  //     .catch((err) => {
  //       setLoading(false);
  //       // console.log(err);
  //     });
  // }, []);

  // useEffect(() => {
  //   async function calcInflationFunc() {
  //     const totalStake = filterCount(chain_info, 'total_stake');
  //     const issu = await api.query.balances.totalIssuance();
  //     const totalIssuance = new BigNumber(issu)
  //       .dividedBy(Math.pow(10, 12))
  //       .toNumber();
  //     const inflation = calcInflation(totalStake, totalIssuance);
  //     // console.log(inflation);
  //     setInflation(inflation);
  //   }
  //   calcInflationFunc();
  // }, [
  //   api.query.balances,
  //   api.query.balances.totalIssuance,
  //   data?.total_staking.totalStake,
  // ]);

  // if (loading)
  //   return (
  //     <div className="container">
  //       <Loading />
  //     </div>
  //   );

  console.log('chain', chain_info);

  console.log('validator', validator);

  const onShowSizeChange = (current, pageSize) => {
    setSizePage(pageSize);
    setCurrentPage(current);
    setSearchParams({ p: current, size: pageSize });
  };
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    setSearchParams({ p: page, size: pageSize });
  };

  return (
    <div>
      <div className="home-container">
        <div className="container">
          <p className="blocks-title">Validator</p>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={19}>
              <Card className="staking">
                <Row justify="start" align="middle" gutter={[32, 32]}>
                  <DataField
                    icon="/assets/icons/box-time.svg"
                    title="Staking"
                    // data={new Intl.NumberFormat().format(
                    //   data?.total_staking.totalStake
                    // )}
                    data={new Intl.NumberFormat().format(100)}
                  />
                  <DataField
                    icon="/assets/icons/box-time.svg"
                    title="Self-Staking"
                    // data={new Intl.NumberFormat().format(data?.self_staking)}
                    data={new Intl.NumberFormat().format(90)}
                  />
                  <DataField
                    icon="/assets/icons/norminate.svg"
                    title="Norminator"
                    // data={new Intl.NumberFormat().format(
                    //   data?.norminate_balance.otherStake
                    // )}
                    data={filterCount(chain_info, 'nominator_count')}
                  />
                  <DataField
                    icon="/assets/icons/validator-white.svg"
                    title="Validator"
                    // data={new Intl.NumberFormat().format(
                    //   data?.validators.total_valalidaors
                    // )}
                    data={filterCount(chain_info, 'active_validator_count')}
                  />
                  <DataField
                    icon="/assets/icons/timer.svg"
                    title="Waiting"
                    // data={new Intl.NumberFormat().format(
                    //   data?.status.waitingValidatorCount
                    // )}
                    data={filterCount(chain_info, 'waiting_validator_count')}
                  />
                  <DataField
                    icon="/assets/icons/candle.svg"
                    title="Inflation Rate"
                    // data={new Intl.NumberFormat().format(inflation?.inflation)}
                    data={new Intl.NumberFormat().format(100)}
                    isPercent
                  />
                </Row>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={24} lg={5}>
              <center className="staking">
                <Chart
                  dataEra={filterCount(chain_info, 'active_era')}
                  datacurrentEra={filterCount(chain_info, 'current_era')}
                />
                {/* <Row justify="space-between">
                  <p className="home-all-data-title">Era</p>
                  <p className="home-all-data-data">
                    {filterCount(chain_info, 'active_era')}/
                    {filterCount(chain_info, 'current_era')}
                  </p>
                </Row>
                <Progress
                  percent={
                    (data?.status.activeEra / data?.status.currentEra) * 100
                  }
                  showInfo={false}
                  strokeColor="#03A9F4"
                /> */}
              </center>
            </Col>
          </Row>
        </div>
      </div>
      <div className="container">
        <div className="spacing" />
        {staking.staking ? (
          <TableStaking
            data={validator}
            loading={validator.validator ? false : true}
            onChange={onChange}
            account_aggregate={
              filterCount(chain_info, 'waiting_validator_count') +
              filterCount(chain_info, 'active_validator_count')
            }
            current={currentPage}
            onShowSizeChange={onShowSizeChange}
            sizePage={sizePage}
          />
        ) : (
          staking
        )}
      </div>
    </div>
  );
}
