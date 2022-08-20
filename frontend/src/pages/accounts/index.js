import { useState } from 'react';
import AccountsTable from '../../components/AccountsTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { QUERY_ACCOUNT } from '../../graphql/query';
import { useQuery } from '@apollo/client';

export default function Accounts() {
  const { query } = useGraphQL();
  const accounts = query(
    useQuery(QUERY_ACCOUNT, {
      variables: { limit: 10, offset: 1 },
    }),
  );

  console.log(accounts);

  const [page, setPage] = useState(1);
  const { loading, data = [] } = useFetch(
    `${process.env.REACT_APP_API}/account/all/${page}`,
  );

  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          <p className="blocks-title">Accounts</p>
          <AccountsTable
            // loading={loading}
            loading={{
              indicator: (
                <div>
                  <img className="loading-img-block" src={LaodingLogo} />
                </div>
              ),
              spinning: !data,
            }}
            data={data}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
