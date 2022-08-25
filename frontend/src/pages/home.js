import { Col, Row } from 'antd';
import Search from '../components/Search';
import Overview from '../components/Overview';
import BlocksTable from '../components/BlocksTable';
import TransferTable from '../components/TransferTable';
import AccountsTable from '../components/AccountsTable';
import process from 'process';
import {
  TOTAL_BLOCKS,
  TOTAL_EXTRINSIC,
  TOTAL_ACCOUNT,
  TOTAL_TRANSFER,
  TOTAL_VALIDATOR,
  QUERY_BLOCKS,
  QUERY_ACCOUNTS,
  QUERY_TRANSFERS,
  QUERY_CHANGE_INFO,
} from '../graphql/query';
import { useQuery } from '@apollo/client';
import { useGraphQL } from '../context/useApp';

export default function Home() {
  const { query } = useGraphQL();
  const { chain_info } = query(useQuery(QUERY_CHANGE_INFO));
  const blocks = query(
    useQuery(QUERY_BLOCKS, {
      variables: {
        limit: 5,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    }),
  );

  const accounts = query(
    useQuery(QUERY_ACCOUNTS, {
      variables: {
        limit: 6,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    }),
  );

  const transfers = query(
    useQuery(QUERY_TRANSFERS, {
      variables: {
        limit: 5,
        offset: 1,
        orderBy: [
          {
            timestamp: 'desc',
          },
        ],
      },
    }),
  );

  const filterCount = (data, name) => {
    const count = [];
    data?.filter((filter) => {
      if (filter.name === name) {
        count.push(filter?.count);
        return true;
      }
      return false;
    });
    return count[0];
  };

  return (
    <div>
      <div className="home-container">
        <div className="home-info">
          <h1>Selendra Blocks Explorer</h1>
          <div className="spacing" />
          <Search />
          <div className="spacing" />
          {chain_info ? (
            <Overview
              total_blocks={filterCount(chain_info, 'blocks')}
              total_blocksFinalized={
                parseInt(filterCount(chain_info, 'blocks')) - 4
              }
              total_extrinsicSigned={filterCount(chain_info, 'extrinsics')}
              total_accounts={filterCount(chain_info, 'accounts')}
              total_transfers={filterCount(chain_info, 'transfers')}
              total_validators={filterCount(
                chain_info,
                'active_validator_count',
              )}
              total_issuance={chain_info[4]?.count}
              total_lockBalance={filterCount(chain_info, 'nominator_count')}
              waitingCount={filterCount(chain_info, 'waiting_validator_count')}
            />
          ) : (
            chain_info
          )}
        </div>
      </div>
      <div className="home-info">
        <Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
          <Col xs={24} md={24} lg={12} xl={12}>
            <div className="home-table">
              {blocks.block ? (
                <BlocksTable short data={blocks?.block} />
              ) : (
                blocks
              )}
            </div>
          </Col>
          <Col xs={24} md={24} lg={12} xl={12}>
            {accounts.account ? (
              <AccountsTable short accounts={accounts?.account} />
            ) : (
              accounts
            )}
          </Col>
        </Row>
      </div>
      <div className="home-info">
        <div className="home-table">
          {transfers.transfer ? (
            <TransferTable short data={transfers?.transfer} />
          ) : (
            transfers
          )}
        </div>
      </div>
    </div>
  );
}
