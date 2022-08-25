import React, { useState } from 'react';
import { Card, Tabs, notification } from 'antd';
import { useParams } from 'react-router-dom';
import { timeDuration } from '../../utils';
import ExtrinsicsTable from '../../components/ExtrinsicsTable';
import EventsTable from '../../components/EventsTable';
import LogsTable from '../../components/LogsTable';
import { CopyOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_BLOCK_BY_PK } from '../../graphql/query';
import { useSearchParams } from 'react-router-dom';

export default function BlockDetail() {
  const { id } = useParams();
  const { query } = useGraphQL();

  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 5 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));

  const block = query(
    useQuery(QUERY_BLOCK_BY_PK, {
      variables: { blockByPkId: id },
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

  const { block_by_pk } = block;

  return (
    <div className="container">
      <div className="spacing" />
      {block.block_by_pk ? (
        <Card className="block-detail-card">
          <p className="block-title">Block #{id}</p>
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
                    <div className="status-background">
                      <img
                        src="/assets/icons/check.svg"
                        alt="finalized"
                        width={18}
                        height={18}
                      />
                      <span style={{ marginLeft: '4px' }}>Finalized</span>
                    </div>
                  ) : (
                    <div className="failed-background-2">
                      <img
                        src="/assets/icons/x-circle.svg"
                        alt="finalized"
                        width={20}
                        height={20}
                      />
                      <span style={{ marginLeft: '4px' }}>Unfinalized</span>
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
      {block.block_by_pk ? (
        <Tabs size="large">
          <Tabs.TabPane tab="Extrinsics" key="extrinsics">
            <ExtrinsicsTable
              data={block_by_pk}
              loading={block.block_by_pk ? false : true}
              total={block?.block_by_pk.extrinsics.length}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Events" key="events">
            <EventsTable
              data={block_by_pk}
              loading={block.block_by_pk ? false : true}
              total={block?.block_by_pk.events.length}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Logs" key="logs">
            <LogsTable
              data={block_by_pk}
              loading={block.block_by_pk ? false : true}
              total={block?.block_by_pk.logs.length}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          </Tabs.TabPane>
        </Tabs>
      ) : (
        block
      )}
    </div>
  );
}
