import { Table, Row } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { formatNumber, shortenAddress, timeDuration } from '../utils';
import { Link } from 'react-router-dom';

export default function EventsTable({
  loading,
  data,
  onChange,
  total,
  current,
  onShowSizeChange,
  sizePage,
}) {
  return (
    <Table
      dataSource={data}
      rowKey={(record) => record.block_id + ' ' + record.index}
      loading={loading}
      className="table-styling"
      pagination={{
        pageSize: parseInt(sizePage),
        total: total,
        current: parseInt(current),
        showSizeChanger: false,
        onShowSizeChange,
        onChange: onChange,
      }}
    >
      <Table.Column
        title="Event ID"
        render={(text, record) => (
          <p>
            #{formatNumber(record.block_id)}-{record.index}
          </p>
        )}
      />
      <Table.Column
        title="Block"
        render={(_, record) => (
          <Link to={`/blocks/${record.block_id}`}>
            <p className="blocks-height">#{formatNumber(record.block_id)}</p>
          </Link>
        )}
      />
      <Table.Column
        title="Time"
        responsive={['md']}
        render={(text, record) => <p>{timeDuration(record.timestamp)}</p>}
      />
      <Table.Column
        title="Section/Method"
        render={(text, record) => (
          <p>
            {record.section}{' '}
            <img src="/assets/icons/arrow.svg" alt="" width={14} height={14} />{' '}
            {record.method}
          </p>
        )}
      />
    </Table>
  );
}
