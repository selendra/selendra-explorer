import { Avatar, Row, Table } from 'antd';
import { Link } from 'react-router-dom';
import {
  formatNumber,
  shortenAddress,
  timeDuration,
  balanceFormat,
} from '../utils';

export default function NoHashTransactions({
  short,
  data,
  loading,
  onChange,
  total,
  current,
  onShowSizeChange,
  sizePage,
}) {
  return (
    <Table
      dataSource={data}
      loading={loading}
      rowKey={(record) => record.id}
      tableLayout="fixed"
      className="table-styling"
      pagination={{
        pageSize: parseInt(sizePage),
        total: total,
        showSizeChanger: true,
        onShowSizeChange,
        current: parseInt(current),
        onChange: (page, sizePage) => {
          onChange(page, parseInt(sizePage));
        },
      }}
    >
      {!short && (
        <Table.Column
          title="Block"
          responsive={['md']}
          dataIndex="block_id"
          render={(block_id) => (
            <Link to={`/blocks/${block_id}`}>
              <div className="blocks-height">
                <p>#{formatNumber(block_id)}</p>
              </div>
            </Link>
          )}
        />
      )}
      {!short && (
        <Table.Column
          title="Time"
          responsive={['md']}
          dataIndex="timestamp"
          render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
        />
      )}
      <Table.Column
        title="From"
        responsive={['md']}
        dataIndex="from_address"
        render={(from_address) => (
          <Row>
            <Avatar
              style={{ marginRight: '4px', backgroundColor: '#87d068' }}
              size="small"
              src={`https://avatars.dicebear.com/api/pixel-art/${from_address}.svg`}
            />
            <a href={`/accounts/${from_address}`}>
              {shortenAddress(from_address)}
            </a>
          </Row>
        )}
      />
      <Table.Column
        title="To"
        dataIndex="to_address"
        render={(to_address) => (
          <Row>
            <Avatar
              style={{ marginRight: '4px', backgroundColor: '#87d068' }}
              size="small"
              src={`https://avatars.dicebear.com/api/pixel-art/${to_address}.svg`}
            />
            <a href={`/accounts/${to_address}`}>{shortenAddress(to_address)}</a>
          </Row>
        )}
      />
      <Table.Column
        title="Amount"
        dataIndex="amount"
        render={(amount) => <p>{balanceFormat(amount)} SEL</p>}
      />
      <Table.Column
        title="Status"
        dataIndex="success"
        render={(success) =>
          success ? (
            <div className="status-background">
              <img
                src="/assets/icons/check.svg"
                alt="finalized"
                width={18}
                height={18}
              />
              <span style={{ marginLeft: '4px' }}>Success</span>
            </div>
          ) : (
            <img
              src="/assets/icons/x-circle.svg"
              alt="finalized"
              width={18}
              height={18}
            />
          )
        }
      />
    </Table>
  );
}
