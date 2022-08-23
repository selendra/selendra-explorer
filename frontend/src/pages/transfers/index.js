import { useState } from 'react';
import TransferTable from '../../components/TransferTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_TRANSFERS, TOTAL_TRANSFER } from '../../graphql/query';
import { useSearchParams } from 'react-router-dom';

export default function Transfers() {
  const { query } = useGraphQL();
  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 11 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));
  const { transfer_aggregate } = query(useQuery(TOTAL_TRANSFER));
  let start = sizePage;
  let end = currentPage;

  const transfers = query(
    useQuery(QUERY_TRANSFERS, {
      variables: {
        limit: parseInt(start),
        offset: parseInt(end),
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    })
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

  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          {transfers.transfer ? (
            <TransferTable
              total={transfer_aggregate?.aggregate.count}
              current={currentPage}
              onShowSizeChange={onShowSizeChange}
              sizePage={sizePage}
              data={transfers.transfer}
              onChange={onChange}
            />
          ) : (
            transfers
          )}
        </div>
      </div>
      <div className="container-table-account" />
    </div>
  );
}
