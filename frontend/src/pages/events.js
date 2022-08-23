import { Card, Col, Row, Select } from 'antd';
import React, { useState } from 'react';
import EventsTable from '../components/EventsTable';
import useFetch from '../hooks/useFetch';
import LaodingLogo from '../assets/loading.png';
import { useGraphQL } from '../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_EVENTS, TOTAL_EVENTS } from '../graphql/query';
import { useSearchParams } from 'react-router-dom';

const module = ['all', 'system'];

export default function Events() {
  const [selectedModule, setSelectedModule] = useState('all');

  const { query } = useGraphQL();
  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 10 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));
  const { event_aggregate } = query(useQuery(TOTAL_EVENTS));

  let start = sizePage;
  let end = currentPage;
  const events = query(
    useQuery(QUERY_EVENTS, {
      variables: { limit: parseInt(start), offset: parseInt(end) },
    }),
  );

  function handleChangeModule(value) {
    setSelectedModule(value);
    console.log(`selected: ${value}`);
  }

  const onShowSizeChange = (current, pageSize) => {
    setSizePage(pageSize);
    setCurrentPage(current);
    setSearchParams({ ...searchParams, p: current, size: pageSize });
  };
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    setSearchParams({ ...searchParams, p: page, size: pageSize });
  };

  return (
    <>
      <div className="blocks-bg">
        <div className="container">
          <p className="blocks-title">Events</p>
          <div className="filter-bg">
            <Row align="middle" gutter={[32, 32]}>
              <Col>
                <span style={{ paddingRight: '4px', color: 'white' }}>
                  Module:
                </span>
                <Select
                  style={{ width: '180px' }}
                  defaultValue="all"
                  placeholder="Module"
                  onChange={handleChangeModule}
                >
                  {module.map((i, key) => (
                    <Select.Option key={key} value={i}>
                      {i.toUpperCase()}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>
          <div className="spacing" />
          {events.event ? (
            <EventsTable
              data={events.event}
              onChange={onChange}
              current={currentPage}
              sizePage={sizePage}
              total={event_aggregate?.aggregate.count}
              onShowSizeChange={onShowSizeChange}
            />
          ) : (
            events
          )}
        </div>
      </div>
      <div className="container-table-account" />
    </>
  );
}
