import { Avatar, Card, notification } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatNumber, balanceFormat } from '../../utils';
import { CopyOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import { useGraphQL } from '../../context/useApp';
import { QUERY_TRANSFER_BY_PK } from '../../graphql/query';
import { useQuery } from '@apollo/client';

export default function TransferDetail() {
  const { id } = useParams();
  const { query } = useGraphQL();
  // const { loading, data = [] } = useFetch(
  //   `${process.env.REACT_APP_API}/transfer/${id}`
  // );

  // if (loading)
  //   return (
  //     <div className="container">
  //       <Loading />
  //     </div>
  //   );
  const transfers = query(
    useQuery(QUERY_TRANSFER_BY_PK, {
      variables: { transferByPkId: id },
    })
  );

  const { transfer_by_pk } = transfers;
  console.log(transfer_by_pk);

  return (
    <div className="container">
      <div className="spacing" />
      <Card className="block-detail-card" style={{ borderRadius: '8px' }}>
        <table className="table">
          <tbody>
            <tr>
              <td>
                <p className="block-title">Account</p>
              </td>
              <td>
                <p className="block-title">Details</p>
              </td>
            </tr>
          </tbody>
        </table>
        <table className="table">
          <tbody>
            <tr className="tr-style">
              <td>Block</td>
              <td>
                <Link to={`/blocks/${transfer_by_pk?.block_id}`}>
                  <p>#{formatNumber(transfer_by_pk?.block_id)}</p>
                </Link>
              </td>
            </tr>
            <tr className="tr-style">
              <td>Time</td>
              <td>
                <Moment>{transfer_by_pk?.timestamp}</Moment>
              </td>
            </tr>
            <tr className="tr-style">
              <td>Extrinsic ID</td>
              <td>
                {transfer_by_pk?.block_id}-{transfer_by_pk?.extrinsic_id}
              </td>
            </tr>
            <tr>
              <td>Hash</td>
              <td>{transfer_by_pk?.token_address}</td>
            </tr>
            <tr className="tr-style">
              <td>From</td>
              <td>
                <Avatar
                  style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                  size="small"
                  src={`https://avatars.dicebear.com/api/pixel-art/${transfer_by_pk?.to_address}.svg`}
                />
                <Link to={`/accounts/${transfer_by_pk?.to_address}`}>
                  {transfer_by_pk?.to_address}
                </Link>
              </td>
              <CopyOutlined
                style={{ fontSize: '20px', marginTop: '16px' }}
                onClick={() =>
                  navigator.clipboard
                    .writeText(transfer_by_pk?.to_address)
                    .then(() =>
                      notification.success({
                        message: 'Copied',
                      })
                    )
                }
              />
            </tr>
            <tr className="tr-style">
              <td>To</td>
              <td>
                <Avatar
                  style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                  size="small"
                  src={`https://avatars.dicebear.com/api/pixel-art/${transfer_by_pk?.from_address}.svg`}
                />
                <Link to={`/accounts/${transfer_by_pk?.from_address}`}>
                  {transfer_by_pk?.from_address}
                </Link>
              </td>
              <CopyOutlined
                style={{ fontSize: '20px', marginTop: '16px' }}
                onClick={() =>
                  navigator.clipboard
                    .writeText(transfer_by_pk?.from_address)
                    .then(() =>
                      notification.success({
                        message: 'Copied',
                      })
                    )
                }
              />
            </tr>
            <tr className="tr-style">
              <td>Amount</td>
              <td>
                {transfers.transfer_by_pk
                  ? balanceFormat(transfers.transfer_by_pk.amount)
                  : transfers}{' '}
                SEL
              </td>
            </tr>
            <tr className="tr-style">
              <td>Fee</td>
              <td>
                {' '}
                {transfers.transfer_by_pk
                  ? parseInt(
                      formatNumber(transfers.transfer_by_pk.fee_amount)
                    ).toPrecision(12)
                  : transfers}{' '}
                SEL
              </td>
            </tr>
            <tr className="tr-style">
              <td>Result</td>
              <td>
                {transfer_by_pk?.success ? (
                  <div className="status-background">
                    <img
                      src="/assets/icons/check.svg"
                      alt="finalized"
                      width={18}
                      height={18}
                    />
                    <span style={{ marginLeft: '4px' }}>Success</span>
                  </div>
                ) : (
                  <div className="failed-background">
                    <img
                      src="/assets/icons/x-circle.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                    <span style={{ marginLeft: '4px' }}>Failed</span>
                  </div>
                )}
              </td>
            </tr>
            {transfer_by_pk?.error_message && (
              <tr className="tr-style">
                <td>Error Message</td>
                <td>{transfer_by_pk?.error_messages}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}