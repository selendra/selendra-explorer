import { Avatar, Row, Table } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { balanceFormat, shortenAddress, percentNumber } from '../utils';

export default function TableStaking({
  loading,
  data,
  short,
  onChange,
  sizePage,
  current,
  onShowSizeChange,
  account_aggregate,
}) {
  return (
    <Table
      dataSource={data?.validator}
      rowKey={(record) => record.stash_address}
      loading={loading}
      className="table-styling"
      tableLayout="fixed"
      pagination={
        short
          ? false
          : {
              pageSize: parseInt(sizePage),
              showSizeChanger: true,
              onShowSizeChange,
              current: parseInt(current),
              total: account_aggregate,
              onChange: (page, sizePage) => {
                onChange(page, parseInt(sizePage));
              },
            }
      }
    >
      <Table.Column
        title="Validator"
        dataIndex="stash_address"
        render={(stash_address, record) => {
          if (record.name === '') {
            return (
              <Link
                to={`/validator/${stash_address}?block_id=${record.block_id}`}
                className="blocks-height"
              >
                <Row>
                  <Avatar
                    style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                    size="small"
                    src={`https://avatars.dicebear.com/api/pixel-art/${stash_address}.svg`}
                  />
                  <p>{shortenAddress(stash_address)}</p>
                </Row>
              </Link>
            );
          } else {
            return (
              <Link
                to={`/validator/${stash_address}?block_id=${record.block_id}`}
                className="blocks-height"
              >
                <Row>
                  <Avatar
                    style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                    size="small"
                    src={`https://avatars.dicebear.com/api/pixel-art/${stash_address}.svg`}
                  />
                  <p>{record.name}</p>
                </Row>
              </Link>
            );
          }
        }}
      />
      <Table.Column
        title="Total stake"
        dataIndex="total_stake"
        render={(total_stake) => <p>{balanceFormat(total_stake)} SEL</p>}
      />
      <Table.Column
        title="Self Stake"
        dataIndex="self_stake"
        render={(self_stake) => <p>{balanceFormat(self_stake)} SEL</p>}
      />
      <Table.Column
        title="Nominator"
        dataIndex="nominators"
        width="10%"
        align="center"
      />
      <Table.Column
        title="Score"
        responsive={['md']}
        width="10%"
        dataIndex="total_rating"
        align="center"
      />
      <Table.Column
        title="Active Eras"
        responsive={['md']}
        dataIndex="active_eras"
        width="10%"
        align="center"
      />
      <Table.Column
        title="Commission"
        responsive={['md']}
        dataIndex="commission"
        align="center"
        render={(commission) => <p>{percentNumber(commission)} </p>}
      />
    </Table>
  );
}
