import { Avatar, Card, Row, Table, Tabs } from 'antd';
import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_VALIDATOR_BY_PK } from '../../graphql/query';
import {
  balanceFormat,
  formatNumber,
  percentNumber,
  shortenAddress,
  timeDuration,
} from '../../utils';

import { formatBalance } from '@polkadot/util';

export default function ValidatorDetail() {
  const { id } = useParams();
  const { query } = useGraphQL();
  const [searchParams] = useSearchParams();

  const validator = query(
    useQuery(QUERY_VALIDATOR_BY_PK, {
      variables: { blockId: searchParams.get('block_id'), stashAddress: id },
    })
  );
  const { validator_by_pk } = validator;

  return (
    <div className="container">
      <div className="spacing" />
      {validator.validator_by_pk ? (
        <Card className="block-detail-card">
          <table className="table">
            <tbody>
              <tr>
                <td>Block</td>
                <td>
                  <Link to={`/blocks/${validator_by_pk?.block_id}`}>
                    <p>#{formatNumber(validator_by_pk?.block_id)}</p>
                  </Link>
                </td>
              </tr>
              <tr>
                <td>Time</td>
                <td>{timeDuration(validator_by_pk?.timestamp)}</td>
              </tr>
              <tr>
                <td>Identity</td>
                <td>
                  <Avatar
                    style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                    size="small"
                    src={`https://avatars.dicebear.com/api/pixel-art/${validator_by_pk?.stash_address}.svg`}
                  />
                  {JSON.parse(validator_by_pk?.identity).display
                    ? JSON.parse(validator_by_pk?.identity).display
                    : validator_by_pk?.stash_address}
                </td>
              </tr>
              <tr>
                <td>Stash</td>
                <td>
                  <Link to={`/accounts/${validator_by_pk?.stash_address}`}>
                    <Avatar
                      style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                      size="small"
                      src={`https://avatars.dicebear.com/api/pixel-art/${validator_by_pk?.stash_address}.svg`}
                    />
                    {validator_by_pk?.stash_address}
                  </Link>
                </td>
              </tr>
              <tr>
                <td>Controller</td>
                <td>
                  <Link to={`/accounts/${validator_by_pk?.controller_address}`}>
                    <Avatar
                      style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                      size="small"
                      src={`https://avatars.dicebear.com/api/pixel-art/${validator_by_pk?.controller_address}.svg`}
                    />
                    {validator_by_pk?.controller_address}
                  </Link>
                </td>
              </tr>
              <tr>
                <td>Commission</td>
                <td>{percentNumber(validator_by_pk?.commission_rating)}</td>
              </tr>
              <tr>
                <td>Total Stake</td>
                <td>{balanceFormat(validator_by_pk?.total_stake)} SEL</td>
              </tr>
            </tbody>
          </table>
        </Card>
      ) : (
        validator
      )}
      <div className="spacing" />
      {validator.validator_by_pk ? (
        <Tabs size="large">
          <Tabs.TabPane tab="Nomination" key="nomination">
            <Table
              loading={validator.validator_by_pk ? false : true}
              pagination={false}
              dataSource={JSON.parse(validator.validator_by_pk.nominations)}
              className="table-styling"
            >
              <Table.Column
                title="Address"
                dataIndex="who"
                render={(staking) => (
                  <Link to={`/accounts/${staking}`}>
                    <Row>
                      <Avatar
                        style={{
                          marginRight: '4px',
                          backgroundColor: '#87d068',
                        }}
                        size="small"
                        src={`https://avatars.dicebear.com/api/pixel-art/${staking}.svg`}
                      />
                      <p>{shortenAddress(staking)}</p>
                    </Row>
                  </Link>
                )}
              />
              <Table.Column
                title="Amount"
                dataIndex="value"
                render={(amount) => <p>{balanceFormat(amount)} SEL</p>}
              />
            </Table>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Staking" key="staking">
            <Table
              loading={validator.validator_by_pk ? false : true}
              pagination={{
                pageSize: parseInt(5),
                total: JSON.parse(validator.validator_by_pk.stake_history)
                  .length,
              }}
              dataSource={JSON.parse(
                validator.validator_by_pk.stake_history
              ).reverse()}
              className="table-styling"
            >
              <Table.Column
                title="Era"
                dataIndex="era"
                render={(era) => <p>{formatNumber(era)}</p>}
              />
              <Table.Column
                title="Self"
                dataIndex="self"
                render={(self) => <p>{balanceFormat(self)} SEL</p>}
              />
              <Table.Column
                title="Other"
                dataIndex="other"
                render={(other) => (
                  <p>
                    {formatBalance(
                      other,
                      { withSi: false, forceUnit: '-' },
                      12
                    )}
                  </p>
                )}
              />
              <Table.Column
                title="Total"
                dataIndex="total"
                render={(total) => (
                  <p>
                    {formatBalance(
                      total,
                      { withSi: false, forceUnit: '-' },
                      12
                    )}
                  </p>
                )}
              />
            </Table>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Era" key="era">
            <Table
              loading={validator.validator_by_pk ? false : true}
              pagination={false}
              dataSource={JSON.parse(
                validator.validator_by_pk.era_points_history
              )}
              className="table-styling"
            >
              <Table.Column
                title="Era"
                dataIndex="era"
                render={(era) => <p>{balanceFormat(era)}</p>}
              />
              <Table.Column
                title="Point"
                dataIndex="points"
                render={(points) => <p>{formatNumber(points)}</p>}
              />
            </Table>
          </Tabs.TabPane>
        </Tabs>
      ) : (
        validator
      )}
    </div>
  );
}
