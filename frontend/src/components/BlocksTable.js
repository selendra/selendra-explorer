import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber, shortenAddress, timeDuration } from '../utils';

export default function BlocksTable({ short, loading, data, onChange }) {
  return (
    <Table
      dataSource={data}
      loading={loading}
      rowKey={(record) => record.blockNumber}
      className="table-styling"
      sortDirections="descend"
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
        title="Block"
        dataIndex="id"
        render={(id) => (
          <Link to={`/blocks/${id}`}>
            <div className="blocks-height">
              <p># {formatNumber(id)}</p>
            </div>
          </Link>
        )}
      />
      <Table.Column
        title="Hash"
        dataIndex="hash"
        render={(hash) => <p>{shortenAddress(hash)}</p>}
      />
      <Table.Column
        title="Status"
        dataIndex="finalized"
        render={(finalized) => (
          <div>
            {finalized ? (
              <div>
                <img
                  src="/assets/icons/check.svg"
                  alt="finalized"
                  width={18}
                  height={18}
                />
                <span style={{ marginLeft: '4px' }}>Finalized</span>
              </div>
            ) : (
              <div>
                <img
                  className="loading-img-block"
                  alt="loading"
                  src="/assets/loading.png"
                />
              </div>
            )}
          </div>
        )}
      />
      {!short && (
        <Table.Column
          title="Time"
          responsive={['md']}
          dataIndex="timestamp"
          render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
        />
      )}
      {/* <Table.Column
        title="Extrinsics"
        responsive={["md"]}
        dataIndex="totalExtrinsics"
      />
      <Table.Column
        title="Events"
        responsive={["md"]}
        dataIndex="totalEvents"
      />
      {!short && (
        <Table.Column
          title="Validator"
          responsive={["md"]}
          dataIndex="blockAuthor"
          render={(blockAuthor) => <p>{shortenAddress(blockAuthor)}</p>}
        />
      )} */}
    </Table>
  );
}
