import { Avatar, Row, Table } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber, shortenAddress, timeDuration } from '../utils';

export default function TransferTable({ short, loading, data, onChange }) {
  return (
    <Table
      dataSource={data}
      rowKey={(record) => record.id}
      loading={loading}
      className="table-styling"
      tableLayout="fixed"
      pagination={
        short
          ? false
          : {
              pageSize: 10,
              total: data?.total_page,
              onChange: (page) => {
                onChange(page);
              },
            }
      }
    >
      <Table.Column
        title="Hash"
        // dataIndex="from_address"
        render={(_, record) => (
          <Link to={`/transfers/${record.id}`}>
            <div className="blocks-height">
              <p>{shortenAddress(record.token_address)}</p>
            </div>
          </Link>
        )}
      />
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
            <p>{shortenAddress(from_address)}</p>
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
            <p>{shortenAddress(to_address)}</p>
          </Row>
        )}
      />
      <Table.Column
        title="Amount"
        dataIndex="amount"
        render={(amount) => <p>{formatNumber(amount)} SEL</p>}
      />
      <Table.Column
        title="Success"
        dataIndex="success"
        render={(success) =>
          success ? (
            <img
              src="/assets/icons/check.svg"
              alt="finalized"
              width={18}
              height={18}
            />
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
