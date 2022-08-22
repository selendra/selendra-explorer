import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import BlocksTable from '../../components/BlocksTable';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_BLOCKS } from '../../graphql/query';
export default function Blocks() {
  const { query } = useGraphQL();
  const [page, setPage] = useState(1);
  // const { loading, data = [] } = useFetch(
  //   `${process.env.REACT_APP_API}/block/all/${page}`,
  // );
  // // console.log(data)

  const blocks = query(
    useQuery(QUERY_BLOCKS, {
      variables: {
        limit: 10,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    }),
  );

  const { block } = blocks;
  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          <div className="spacing" />
          <div>
            {blocks.block ? (
              <BlocksTable
                // loading={{
                //   indicator: (
                //     <div>
                //       <img className="loading-img-block" src={LaodingLogo} />
                //     </div>
                //   ),
                //   spinning: !data,
                // }}
                data={block}
                onChange={setPage}
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
