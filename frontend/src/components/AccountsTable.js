import { Avatar, Row, Table, Tooltip } from 'antd';
import { formatBalance } from '@polkadot/util';
import { Link } from 'react-router-dom';
import {
  formatNumber,
  shortenAddress,
  formatAccountBalanceSEL,
} from '../utils';

export default function AccountsTable({
  short,
  accounts,
  onChange,
  account_aggregate,
  current,
  onShowSizeChange,
  sizePage,
}) {
  console.log(sizePage);
  return (
    <Table
      pagination={{
        pageSize: parseInt(sizePage),
        showSizeChanger: false,
        onShowSizeChange,
        current: parseInt(current),
        total: account_aggregate?.aggregate.count,
        onChange: (page) => {
          onChange(page);
        },
      }}
      bordered={false}
      dataSource={accounts}
      rowKey={(record) => record.address}
      className={`${short && 'table-styling'}`}
      tableLayout="fixed"
    >
      <Table.Column
        title="Account"
        dataIndex="address"
        render={(_, record) => (
          <Link to={`/accounts/${record.address}`}>
            <div className="address-bg">
              <p>{shortenAddress(record.address)}</p>
            </div>
          </Link>
        )}
      />
      <Table.Column
        title="Free Balance"
        dataIndex="free_balance"
        render={(free_balance) => (
          <p>
            {free_balance !== 0
              ? formatAccountBalanceSEL(free_balance).slice(0, 12)
              : formatNumber(free_balance)}{' '}
            SEL
          </p>
        )}
      />
      {!short && (
        <Table.Column
          title="Locked Balance"
          responsive={['md']}
          dataIndex="locked_balance"
          render={(locked_balance) => <p>{formatNumber(locked_balance)} SEL</p>}
        />
      )}
      <Table.Column
        title="Available Balance"
        dataIndex="available_balance"
        render={(available_balance) => (
          <p>{formatNumber(available_balance)} SEL</p>
        )}
      />
    </Table>
  );
  // accounts.account && (
  //   <Table
  // pagination={
  //   short
  //     ? false
  //     : {
  //         pageSize: 10,
  //         // total: data?.total_page,
  //         onChange: (page) => {
  //           onChange(page);
  //         },
  //       }
  // }
  //     dataSource={accounts.account}
  //     rowKey={(record) => record.block_id}
  //     // loading={loading}
  //     className="table-styling"
  //     tableLayout="fixed"
  //   >
  //     <Table.Column
  //       title="Account"
  //       render={(text, record) =>
  //         record.identityDetail.identityDisplay ? (
  //           <Tooltip placement="top" title={record.accountId}>
  //             <Link
  //               to={`/accounts/${record.accountId}`}
  //               className={short ? 'trim-string' : 'trim-string-long'}
  //             >
  //               <div className="address-bg">
  //                 <p>{record.identityDetail.identityDisplay}</p>
  //               </div>
  //             </Link>
  //           </Tooltip>
  //         ) : (
  //           <Link to={`/accounts/${record.accountId}`}>
  //             <div className="address-bg">
  //               <p>{shortenAddress(record.accountId)}</p>
  //             </div>
  //           </Link>
  //         )
  //       }
  //     />
  //     {!short && <Table.Column title="EVM Address" dataIndex="" />}
  // <Table.Column
  //   title="Free Balance"
  //   dataIndex="freeBalance"
  //   render={(freeBalance) => <p>{formatNumber(freeBalance)} SEL</p>}
  // />
  // {!short && (
  //   <Table.Column
  //     title="Locked Balance"
  //     responsive={['md']}
  //     dataIndex="lockedBalance"
  //     render={(lockedBalance) => <p>{formatNumber(lockedBalance)} SEL</p>}
  //   />
  // )}
  // <Table.Column
  //   title="Available Balance"
  //   dataIndex="availableBalance"
  //   render={(availableBalance) => (
  //     <p>{formatNumber(availableBalance)} SEL</p>
  //   )}
  // />
  //   </Table>
  // )
}
