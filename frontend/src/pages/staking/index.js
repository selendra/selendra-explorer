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
  QUERY_CHAIN_INFO,
  QUERY_VALIDATOR,
  TOTAL_VALIDATOR,
  TOTAL_ACCOUNT
} from '../../graphql/query';
import { filterCount } from '../../utils/chainInfo';
import { useSearchParams } from 'react-router-dom';
import { balanceFormat, percentNumber } from '../../utils'

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

  const { account_aggregate } = query(useQuery(TOTAL_ACCOUNT))
  const { validator_aggregate } = query(useQuery(TOTAL_VALIDATOR));
  const total_stake = Number(validator_aggregate?.aggregate.sum.total_stake);
  const self_stake = Number(validator_aggregate?.aggregate.sum.self_stake);
  const free_balance=  Number(account_aggregate?.aggregate.sum.free_balance)
  const inflation = calcInflation(parseInt(total_stake), parseInt(free_balance)); 


  console.log(inflation);
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
                    data={balanceFormat(total_stake)}
                  />
                  <DataField
                    icon="/assets/icons/box-time.svg"
                    title="Self-Staking"
                    data={balanceFormat(self_stake)}
                  />
                  <DataField
                    icon="/assets/icons/norminate.svg"
                    title="Norminator"
                    data={filterCount(chain_info, 'nominator_count')}
                  />
                  <DataField
                    icon="/assets/icons/validator-white.svg"
                    title="Validator"
                    data={filterCount(chain_info, 'active_validator_count')}
                  />
                  <DataField
                    icon="/assets/icons/timer.svg"
                    title="Waiting"
                    data={filterCount(chain_info, 'waiting_validator_count')}
                  />
                  <DataField
                    icon="/assets/icons/candle.svg"
                    title="Inflation Rate"
                    data={percentNumber(inflation?.inflation)}
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
              </center>
            </Col>
          </Row>
        </div>
      </div>
      <div className="container">
        <div className="spacing" />
        {validator.validator ? (
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
          validator
        )}
      </div>
    </div>
  );
}
