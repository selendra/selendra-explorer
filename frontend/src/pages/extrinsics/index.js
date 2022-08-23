import { Card, Col, Row, Select } from 'antd';
import { useState } from 'react';
import ExtrinsicsTable from '../../components/ExtrinsicsTable';
import LaodingLogo from '../../assets/loading.png';

import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_EXTRINSIC, TOTAL_EXTRINSIC } from '../../graphql/query';
import { useSearchParams } from 'react-router-dom';

const module = [
  'all',
  'timestamp',
  'paraInherent',
  'utility',
  'balances',
  'staking',
];

export default function Extrinsics() {
  const { query } = useGraphQL();

  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 12 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));
  const { extrinsic_aggregate } = query(useQuery(TOTAL_EXTRINSIC));
  let start = sizePage;
  let end = currentPage;

  const extrinsic = query(
    useQuery(QUERY_EXTRINSIC, {
      variables: {
        limit: 12,
        offset: 0,
        orderBy: [
          {
            id: 'desc',
          },
        ],
      },
    })
  );
  const [isSigned, setIsSigned] = useState(false);
  const [selectedModule, setSelectedModule] = useState('all');
  function handleChangeModule(value) {
    setSelectedModule(value);
    console.log(`selected: ${value}`);
  }

  const onShowSizeChange = (current, pageSize) => {
    setSizePage(pageSize);
    setCurrentPage(current);
    setSearchParams({ ...searchParams, p: current, size: sizePage });
  };
  const onChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ ...searchParams, p: page, size: sizePage });
  };

  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          {/* <p className="blocks-title">Extrinsics</p>
          <div className="filter-bg">
            <Row align="middle" gutter={[32, 32]}>
              <Col>
                <span style={{ paddingRight: '4px', color: 'white' }}>
                  Sign
                </span>
                <Select
                  style={{ width: '180px' }}
                  defaultValue="All"
                  onChange={setIsSigned}
                >
                  <Select.Option value={false}>ALL</Select.Option>
                  <Select.Option value={true}>SIGNED ONLY</Select.Option>
                </Select>
              </Col>
              <Col>
                <span style={{ paddingRight: '4px', color: 'white' }}>
                  Module
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
          </div> */}
          <div className="spacing" />
          {extrinsic.extrinsic ? (
            <ExtrinsicsTable
              data={extrinsic.extrinsic}
              total={extrinsic_aggregate?.aggregate.count}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              onChange={onChange}
            />
          ) : (
            extrinsic
          )}
        </div>
      </div>
      <div className="container-table-account" />
    </div>
  );
}
