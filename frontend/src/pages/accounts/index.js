import { useState } from 'react';
import AccountsTable from '../../components/AccountsTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { QUERY_ACCOUNTS } from '../../graphql/query';
import { useQuery } from '@apollo/client';
import { Pagination } from 'antd';

export default function Accounts() {
  const { query } = useGraphQL();
  const accounts = query(
    useQuery(QUERY_ACCOUNTS, {
      variables: { limit: 10, offset: 1, orderBy: { timestamp: null } },
    })
  );

  const [current, setCurrent] = useState(3);

  const onChange = (page) => {
    console.log(page);
    setCurrent(page);
  };

  const [page, setPage] = useState(1);
  // const { loading, data = [] } = useFetch(
  //   `${process.env.REACT_APP_API}/account/all/${page}`,
  // );

  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          <p className="blocks-title">Accounts</p>
          {accounts.account ? (
            <div className="table-account">
              <AccountsTable accounts={accounts.account} onChange={setPage} />
              <Pagination
                showSizeChanger={false}
                // onShowSizeChange={onShowSizeChange}
                // defaultCurrent={1}
                // total={500}
                // disabled
                current={current}
                onChange={onChange}
                total={500}
              />
            </div>
          ) : (
            accounts
          )}
        </div>
      </div>
      <div className="container-table-account" />
    </div>
  );
}
