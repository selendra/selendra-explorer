import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { formatNumber, shortenAddress, timeDuration } from '../utils';

export default function ExtrinsicsTable({
  short,
  loading,
  data,
  onChange,
  total,
  current,
  onShowSizeChange,
  sizePage,
}) {
  console.log(data);
  return (
    <Table
      dataSource={data}
      rowKey={(record) => record.hash}
      loading={loading}
      className="table-styling"
      tableLayout="fixed"
      // sortDirections='descend'
      pagination={
        short
          ? false
          : {
              pageSize: parseInt(sizePage),
              total: total,
              current: parseInt(current),
              showSizeChanger: false,
              onShowSizeChange,
              onChange: onChange,
            }
      }
    >
      <Table.Column
        title="Hash"
        render={(_, record) => (
          <Link to={`/extrinsics/${record.block_id}`}>
            <div className="blocks-height">
              <p>{shortenAddress(record.hash)}</p>
            </div>
          </Link>
        )}
      />
      {/* { !short &&
        <Table.Column
          title='Block'
          responsive={['md']}
          dataIndex='blockNumber'
          render={blockNumber => (
            <Link to={`/blocks/${blockNumber}`}>
              <div className='blocks-height'>
                <p>#{formatNumber(blockNumber)}</p>
              </div>
            </Link>
          )}
        />
      } */}
      <Table.Column
        title="Extrinsic ID"
        render={(text, record) => (
          <p>
            #{formatNumber(record.block_id)}-{record.extrinsicIndex}
          </p>
        )}
      />
      <Table.Column
        title="Section/Method"
        render={(text, render) => (
          <span>
            {render.section}{' '}
            <img src="/assets/icons/arrow.svg" alt="" width={14} height={14} />{' '}
            {render.method}
          </span>
        )}
      />
      {!short && (
        <>
          <Table.Column
            title="Time"
            responsive={['md']}
            dataIndex="timestamp"
            render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
          />
          <Table.Column
            title="Signed"
            responsive={['md']}
            dataIndex="isSigned"
            render={(isSigned) => (
              <p>
                {isSigned ? (
                  <div className="status-background">
                    <img
                      src="/assets/icons/check.svg"
                      alt="finalized"
                      width={20}
                      height={20}
                    />
                    <span style={{ marginLeft: '4px' }}>Signed</span>
                  </div>
                ) : (
                  <div className="failed-background">
                    <img
                      src="/assets/icons/x-circle.svg"
                      alt="finalized"
                      width={20}
                      height={20}
                    />
                    <span style={{ marginLeft: '4px' }}>Unsigned</span>
                  </div>
                )}
              </p>
            )}
          />
        </>
      )}
    </Table>
  );
}
