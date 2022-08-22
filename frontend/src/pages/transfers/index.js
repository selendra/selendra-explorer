import { useState } from 'react';
import TransferTable from '../../components/TransferTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_TRANSFERS } from '../../graphql/query';
export default function Transfers() {
  const { query } = useGraphQL();
  const [page, setPage] = useState(1);
  // const { loading, data = [] } = useFetch(
  //   `${process.env.REACT_APP_API}/transfer/all/${page}`
  // );

  const transfers = query(
    useQuery(QUERY_TRANSFERS, {
      variables: { limit: 10, offset: 0 },
    })
  );

  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          {transfers.transfer ? (
            <TransferTable
              // loading={transfers.transfer ? true : false}
              // loading={{
              //   indicator: (
              //     <div>
              //       <img className="loading-img-block" alt="" src={LaodingLogo} />
              //     </div>
              //   ),
              //   spinning: !data,
              // }}
              data={transfers.transfer}
              onChange={setPage}
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
