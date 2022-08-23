import { useState } from 'react';
import AccountsTable from '../../components/AccountsTable';
import useFetch from '../../hooks/useFetch';
import LaodingLogo from '../../assets/loading.png';
import { useGraphQL } from '../../context/useApp';
import { QUERY_ACCOUNTS, TOTAL_ACCOUNT } from '../../graphql/query';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';

export default function Accounts() {
  const { query } = useGraphQL();
  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 15 });
  const [currentPage, setCurrentPage] = useState(searchParams.get('p'));
  const [sizePage, setSizePage] = useState(searchParams.get('size'));
  const { account_aggregate } = query(useQuery(TOTAL_ACCOUNT));
  let start = sizePage;
  let end = account_aggregate < currentPage ? account_aggregate : currentPage;
  const accounts = query(
    useQuery(QUERY_ACCOUNTS, {
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
          {accounts.account ? (
            <div className="table-account">
              <AccountsTable
                accounts={accounts.account}
                onChange={onChange}
                account_aggregate={account_aggregate}
                current={currentPage}
                onShowSizeChange={onShowSizeChange}
                sizePage={sizePage}
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
