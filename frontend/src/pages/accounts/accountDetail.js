import { Avatar, Card, Tabs } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ExtrinsicsTable from '../../components/ExtrinsicsTable';
import TableAccountStaking from '../../components/TableAccountStaking';
import TransferTable from '../../components/TransferTable';
import { formatNumber, balanceFormat } from '../../utils';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import {
  QUERY_ACCOUNT_BY_ADDRESS,
  QUERY_COUNT_COLUMNS_ACCOUNT,
  QUERY_EXTRINSIC,
  QUERY_STAKING,
  QUERY_TRANSFERS,
} from '../../graphql/query';

export default function AccountDetail() {
  const { id } = useParams();
  const { query } = useGraphQL();
  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 5 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));

  const account = query(
    useQuery(QUERY_ACCOUNT_BY_ADDRESS, {
      variables: {
        address: id,
      },
    }),
  );

  const { account_aggregate } = query(
    useQuery(QUERY_COUNT_COLUMNS_ACCOUNT, {
      variables: {
        columns: 'vested_balance',
      },
    }),
  );

  const extrinsic = query(
    useQuery(QUERY_EXTRINSIC, {
      variables: {
        limit: 10,
        offset: 1,
        where: {
          signer: {
            _eq: id,
          },
        },
      },
    }),
  );

  const staking = query(
    useQuery(QUERY_STAKING, {
      variables: {
        limit: 10,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
        where: {
          signer: {
            _eq: id,
          },
        },
      },
    }),
  );

  const transfers = query(
    useQuery(QUERY_TRANSFERS, {
      variables: {
        limit: 10,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
        where: {
          from_address: {
            _eq: id,
          },
        },
      },
    }),
  );

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
    <div className="container">
      <div className="spacing" />
      {account.account_by_pk ? (
        <Card className="block-detail-card" style={{ borderRadius: '8px' }}>
          <table className="table">
            <tbody>
              <tr>
                <td>
                  <p className="block-title">Account</p>
                </td>
                <td>
                  <p className="block-title">Details</p>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="table">
            <tbody>
              <tr>
                <td>Address</td>
                <td>
                  <Avatar
                    style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                    size="small"
                    src={`https://avatars.dicebear.com/api/pixel-art/${account.account_by_pk.address}.svg`}
                  />
                  {account.account_by_pk.address}
                </td>
              </tr>
              <tr>
                <td>Total Balance</td>
                <td>
                  {balanceFormat(account.account_by_pk.available_balance)} SEL
                </td>
              </tr>
              <tr>
                <td>Available Balance</td>
                <td>
                  {balanceFormat(account.account_by_pk.available_balance)} SEL
                </td>
              </tr>
              <tr>
                <td>Locked Balance</td>
                <td>
                  {balanceFormat(account.account_by_pk.locked_balance)} SEL
                </td>
              </tr>
              <tr>
                <td>Reserved Balance</td>
                <td>
                  {balanceFormat(account.account_by_pk.reserved_balance)} SEL
                </td>
              </tr>
              <tr>
                <td>Vest Details</td>
                <tr>
                  <td>Vest Balance</td>
                  <td>
                    {balanceFormat(account.account_by_pk.vested_balance)} SEL
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '80px' }}>Vested Claimable</td>
                  <td>
                    {balanceFormat(account.account_by_pk.voting_balance)} SEL
                  </td>
                </tr>
                <tr>
                  <td>Vesting Total</td>
                  <td>
                    {formatNumber(
                      account_aggregate ? account_aggregate.aggregate.count : 0,
                    )}{' '}
                    {''}
                    SEL
                  </td>
                </tr>
              </tr>
            </tbody>
          </table>
        </Card>
      ) : (
        account
      )}
      <div className="spacing" />
      <Tabs size="large">
        <Tabs.TabPane tab="Extrinsics" key="extrinsics">
          {extrinsic.extrinsic ? (
            <ExtrinsicsTable
              data={extrinsic.extrinsic}
              total={extrinsic.extrinsic.length}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          ) : (
            extrinsic
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Transfers" key="transfers">
          {transfers.transfer ? (
            <TransferTable
              data={transfers.transfer}
              total={transfers.transfer.length}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          ) : (
            transfers
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Staking" key="staking">
          {staking.staking ? (
            <TableAccountStaking
              data={staking.staking}
              total={staking.staking.length}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          ) : (
            staking
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
