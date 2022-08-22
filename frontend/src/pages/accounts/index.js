import { useState } from 'react';
import AccountsTable from '../../components/AccountsTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { QUERY_ACCOUNTS, TOTAL_ACCOUNT } from '../../graphql/query';
import { useQuery } from '@apollo/client';
import { Pagination } from 'antd';

export default function Accounts() {
  const { query } = useGraphQL();
  const [current, setCurrent] = useState(1);
  let start = 10 * current;
  let end = start - 10;
  const accounts = query(
    useQuery(QUERY_ACCOUNTS, {
      variables: {
        limit: 10,
        offset: 0,
      },
    }),
  );
  const { account_aggregate } = query(useQuery(TOTAL_ACCOUNT));

  const onChange = (page) => {
    setCurrent(page);
  };

  const [page, setPage] = useState(1);
  return (
    <div>
      <div className="blocks-bg">
        <div className="container">
          <p className="blocks-title">Accounts</p>
          {accounts.account ? (
            <div className="table-account">
              <AccountsTable accounts={accounts.account} />
              <Pagination
                showSizeChanger={false}
                // onShowSizeChange={onShowSizeChange}
                // defaultCurrent={1}
                // total={500}
                // disabled
                current={current}
                onChange={onChange}
                total={account_aggregate?.aggregate.count}
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
