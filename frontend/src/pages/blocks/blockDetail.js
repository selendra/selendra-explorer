import { Card, Spin, Tabs, notification, message } from 'antd';
import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { timeDuration } from '../../utils';
import ExtrinsicsTable from '../../components/ExtrinsicsTable';
import EventsTable from '../../components/EventsTable';
import LogsTable from '../../components/LogsTable';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import { CopyOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_BLOCK_BY_PK } from '../../graphql/query';

export default function BlockDetail() {
  const { id } = useParams();
  const { query } = useGraphQL();

  const block = query(
    useQuery(QUERY_BLOCK_BY_PK, {
      variables: { blockByPkId: id },
    }),
  );

  const { block_by_pk } = block;

  return (
    <div className="container">
      <div className="spacing" />
      <p className="block-title">Block #{id}</p>
      {block.block_by_pk ? (
        <Card className="block-detail-card">
          <table className="table">
            <tbody>
              <tr className="tr-style">
                <td>Timestamp</td>
                <td>
                  <Moment>{block_by_pk?.timestamp}</Moment>
                </td>
              </tr>
              <tr className="tr-style">
                <td>Status</td>
                <td>
                  {block_by_pk?.finalized ? (
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
                        src="/assets/loading.png"
                        alt="loading"
                        className="loading-img-block"
                      />
                    </div>
                  )}
                </td>
              </tr>
              <tr className="tr-style">
                <td>Hash</td>
                <td>{block_by_pk?.hash}</td>
                <CopyOutlined
                  style={{ fontSize: '20px', marginTop: '16px' }}
                  onClick={() =>
                    navigator.clipboard.writeText(block_by_pk?.hash).then(() =>
                      notification.success({
                        message: 'Copied',
                      }),
                    )
                  }
                />
              </tr>
              <tr className="tr-style">
                <td>Parent Hash</td>
                <td>{block_by_pk?.parent_hash}</td>
                <CopyOutlined
                  style={{ fontSize: '20px', marginTop: '16px' }}
                  onClick={() =>
                    navigator.clipboard
                      .writeText(block_by_pk?.parent_hash)
                      .then(() =>
                        notification.success({
                          message: 'Copied',
                        }),
                      )
                  }
                />
              </tr>
              <tr className="tr-style">
                <td>State Root</td>
                <td>{block_by_pk?.state_root}</td>
                <CopyOutlined
                  style={{ fontSize: '20px', marginTop: '16px' }}
                  onClick={() =>
                    navigator.clipboard
                      .writeText(block_by_pk?.state_root)
                      .then(() =>
                        notification.success({
                          message: 'Copied',
                        }),
                      )
                  }
                />
              </tr>
              <tr className="tr-style">
                <td>Block Author</td>
                <td>{block_by_pk?.author}</td>
                <CopyOutlined
                  style={{ fontSize: '20px', marginTop: '16px' }}
                  onClick={() =>
                    navigator.clipboard
                      .writeText(block_by_pk?.author)
                      .then(() =>
                        notification.success({
                          message: 'Copied',
                        }),
                      )
                  }
                />
              </tr>
              <tr className="tr-style">
                <td>Block Time</td>
                <td>{timeDuration(block_by_pk?.timestamp)} </td>
              </tr>
            </tbody>
          </table>
        </Card>
      ) : (
        block
      )}
      <div className="spacing" />
      {/* <Tabs size="large">
        <Tabs.TabPane tab="Extrinsics" key="extrinsics">
          <ExtrinsicsTable data={extrinsicData} loading={loading} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Events" key="events">
          <EventsTable data={eventData} loading={loading} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Logs" key="logs">
          <LogsTable data={logData} loading={loading} />
        </Tabs.TabPane>
      </Tabs> */}
    </div>
  );
}
