import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import BlocksTable from '../../components/BlocksTable';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_BLOCKS, TOTAL_BLOCKS } from '../../graphql/query';
import { useSearchParams } from 'react-router-dom';
export default function Blocks() {
  const { query } = useGraphQL();
  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 10 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));
  const { block_aggregate } = query(useQuery(TOTAL_BLOCKS));
  let start = sizePage;
  let end = currentPage;
  const blocks = query(
    useQuery(QUERY_BLOCKS, {
      variables: {
        limit: parseInt(start),
        offset: parseInt(end),
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    }),
  );

  const onShowSizeChange = (current, pageSize) => {
    setSizePage(pageSize);
    setCurrentPage(current);
    setSearchParams({ ...searchParams, p: current, size: sizePage });
  };
  const onChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ ...searchParams, p: page, size: sizePage });
  };

  const { block } = blocks;
  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          <p className="blocks-title">Blocks</p>
          <div className="spacing" />
          <div>
            {blocks.block ? (
              <BlocksTable
                data={block}
                total={block_aggregate?.aggregate.count}
                onChange={onChange}
                current={currentPage}
                onShowSizeChange={onShowSizeChange}
                sizePage={sizePage}
              />
            ) : (
              blocks
            )}
          </div>
        </div>
      </div>
      <div className="container-table-account" />
    </div>
  );
}
