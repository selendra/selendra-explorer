import { Avatar, Card, message, notification } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import useFetch from '../../hooks/useFetch';
import { formatNumber } from '../../utils';
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
  const { transfer_by_pk } = query(
    useQuery(QUERY_TRANSFER_BY_PK, {
      variables: { transferByPkId: id },
    }),
  );

  return (
    <div className="container">
      <div className="spacing" />
      <p className="block-title">
        Hash #{transfer_by_pk?.token_address}{' '}
        <CopyOutlined
          style={{ fontSize: '20px', marginTop: '8px' }}
          onClick={() =>
            navigator.clipboard.writeText(id).then(() =>
              notification.success(
                {
                  message: 'Copied',
                },
                3,
              ),
            )
          }
        />
      </p>
      <Card className="block-detail-card" style={{ borderRadius: '8px' }}>
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
              <td>Sender</td>
              <td>
                <Avatar
                  style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                  size="small"
                  src={`https://avatars.dicebear.com/api/pixel-art/${transfer_by_pk?.source}.svg`}
                />
                <Link to={`/accounts/${transfer_by_pk?.source}`}>
                  {transfer_by_pk?.source}
                </Link>
              </td>
              <CopyOutlined
                style={{ fontSize: '20px', marginTop: '16px' }}
                onClick={() =>
                  navigator.clipboard
                    .writeText(transfer_by_pk?.source)
                    .then(() =>
                      notification.success({
                        message: 'Copied',
                      }),
                    )
                }
              />
            </tr>
            <tr className="tr-style">
              <td>Destination</td>
              <td>
                <Avatar
                  style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                  size="small"
                  src={`https://avatars.dicebear.com/api/pixel-art/${transfer_by_pk?.destination}.svg`}
                />
                <Link to={`/accounts/${transfer_by_pk?.source}`}>
                  {transfer_by_pk?.destination}
                </Link>
              </td>
              <CopyOutlined
                style={{ fontSize: '20px', marginTop: '16px' }}
                onClick={() =>
                  navigator.clipboard
                    .writeText(transfer_by_pk?.destination)
                    .then(() =>
                      notification.success({
                        message: 'Copied',
                      }),
                    )
                }
              />
            </tr>
            <tr className="tr-style">
              <td>Amount</td>
              <td>{formatNumber(transfer_by_pk?.amount)} SEL</td>
            </tr>
            <tr className="tr-style">
              <td>Fee</td>
              <td>{transfer_by_pk?.fee_amount} SEL</td>
            </tr>
            <tr className="tr-style">
              <td>Result</td>
              <td>
                {transfer_by_pk?.success ? (
                  <div>
                    <img
                      src="/assets/icons/check.svg"
                      alt=""
                      width={18}
                      height={18}
                    />
                    <span>Success</span>
                  </div>
                ) : (
                  <img
                    src="/assets/icons/x-circle.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
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
