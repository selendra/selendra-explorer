import { Avatar, Row, Table } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, shortenAddress } from '../utils';

export default function TableStaking({ loading, data, short, onChange }) {
  return (
    <Table
      dataSource={data}
      rowKey={(record) => record.signer}
      // loading={loading}
      className="table-styling"
      tableLayout="fixed"
      // pagination={short ? false : {
      //   pageSize: 10,
      //   total: data?.total_page,
      //   onChange:(page) => {
      //     onChange(page)
      //   }
      // }}
    >
      <Table.Column
        title="Validator"
        dataIndex="signer"
        render={(signer) => (
          <Link to={`/validator/${signer}`} className="blocks-height">
            <Row>
              <Avatar
                style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                size="small"
                src={`https://avatars.dicebear.com/api/pixel-art/${signer}.svg`}
              />
              <p>{shortenAddress(signer)}</p>
            </Row>
          </Link>
        )}
      />
      <Table.Column
        title="Total stake"
        dataIndex="amount"
        render={(amount) => <p>{formatNumber(amount)} SEL</p>}
      />
      <Table.Column title="Nominator" dataIndex="nominators" />
      {/* <Table.Column 
        title="Active Eras"
        responsive={['md']}
        dataIndex="activeEras" 
      /> */}
    </Table>
  );
}
