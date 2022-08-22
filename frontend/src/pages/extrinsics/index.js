import { Card, Col, Row, Select } from 'antd';
import { useState } from 'react';
import ExtrinsicsTable from '../../components/ExtrinsicsTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';

import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_EXTRINSIC } from '../../graphql/query';

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
  const extrinsic = query(
    useQuery(QUERY_EXTRINSIC, {
      variables: {
        limit: 10,
        offset: 0,
        orderBy: [
          {
            id: 'desc',
          },
        ],
      },
    }),
  );
  const [isSigned, setIsSigned] = useState(false);
  const [selectedModule, setSelectedModule] = useState('all');
  const [page, setPage] = useState(1);
  // const { loading, data = [] } = useFetch(
  //   isSigned
  //     ? `${process.env.REACT_APP_API}/extrinsic/signed/${page}`
  //     : `${process.env.REACT_APP_API}/extrinsic/${selectedModule}/${page}`,
  // );

  function handleChangeModule(value) {
    setSelectedModule(value);
    setPage(1);
    console.log(`selected: ${value}`);
  }

  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          <p className="blocks-title">Extrinsics</p>
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
          </div>
          <div className="spacing" />
          {extrinsic.extrinsic ? (
            <ExtrinsicsTable
              // loading={loading}
              // loading={{
              //   indicator: (
              //     <div>
              //       <img className="loading-img-block" alt="" src={LaodingLogo} />
              //     </div>
              //   ),
              //   spinning: loading,
              // }}
              data={extrinsic.extrinsic}
              onChange={setPage}
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
