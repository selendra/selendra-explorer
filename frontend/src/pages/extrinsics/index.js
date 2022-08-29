import { useState } from 'react';
import ExtrinsicsTable from '../../components/ExtrinsicsTable';

import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_EXTRINSIC, TOTAL_EXTRINSIC } from '../../graphql/query';
import { useSearchParams } from 'react-router-dom';

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
        limit: parseInt(start),
        offset: parseInt(end),
        orderBy: [
          {
            id: 'desc',
          },
        ],
      },   
    })
  );

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
      <div className="blocks-bg" />
      <div className="home-info">
        <div className="container">
          <div className="table-account">
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
      </div>
    </>
  );
}
