import { useState } from 'react';
import AccountsTable from '../../components/AccountsTable';
import { useGraphQL } from '../../context/useApp';
import { QUERY_ACCOUNTS, TOTAL_ACCOUNT } from '../../graphql/query';
import { useQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import React from 'react';
export default function Accounts() {
  const { query } = useGraphQL();

  const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 10 });
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
    setSearchParams({ p: current, size: pageSize });
  };
  const onChange = (page, pageSize) => {
    setCurrentPage(page);
    setSearchParams({ p: page, size: pageSize });
  };

  return (
    <>
      <div className="blocks-bg" />
      <div className="home-info">
        <div className="container">
          <div className="table-account">
            {accounts.account ? (
              <AccountsTable
                accounts={accounts}
                onChange={onChange}
                account_aggregate={account_aggregate}
                current={currentPage}
                onShowSizeChange={onShowSizeChange}
                sizePage={sizePage}
                loading={accounts.account ? false : true}
              />
            ) : (
              accounts
            )}
          </div>
        </div>
      </div>
    </>
  );
}
