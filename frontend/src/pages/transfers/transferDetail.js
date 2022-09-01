import { Avatar, Card, notification } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatNumber, balanceFormat } from '../../utils';
import { CopyOutlined } from '@ant-design/icons';
import Moment from 'react-moment';
import { useGraphQL } from '../../context/useApp';
import { QUERY_EXTRINSIC } from '../../graphql/query';
import { useQuery } from '@apollo/client';
import { NoData } from '../../components/Loading';

export default function TransferDetail() {
  const { hash } = useParams();
  const { query } = useGraphQL();

  const extrinsics = query(
    useQuery(QUERY_EXTRINSIC, {
      variables: { where: { hash: { _eq: hash.toString() } } },
    })
  );

  const {
    extrinsic_id,
    from_address,
    fee_amount,
    success,
    timestamp,
    to_address,
    amount,
    error_message,
  } = extrinsics?.extrinsic ? extrinsics?.extrinsic[0].transfers[0] : [];

  return (
    <div className="container">
      <div className="spacing" />
      {extrinsics.extrinsic ? (
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
                  <Link to={`/blocks/${extrinsics?.extrinsic[0].block_id}`}>
                    <p>#{formatNumber(extrinsics?.extrinsic[0].block_id)}</p>
                  </Link>
                </td>
              </tr>
              <tr className="tr-style">
                <td>Time</td>
                <td>
                  <Moment>{timestamp}</Moment>
                </td>
              </tr>
              <tr className="tr-style">
                <td>Extrinsic ID</td>
                <td>
                  {extrinsics?.extrinsic[0].block_id} - {extrinsic_id}
                </td>
              </tr>
              <tr>
                <td>Hash</td>
                <td>{hash}</td>
              </tr>
              <tr className="tr-style">
                <td>From</td>
                <td>
                  <Avatar
                    style={{ marginRight: '4px', backgroundColor: '#87d068' }}
                    size="small"
                    src={`https://avatars.dicebear.com/api/pixel-art/${to_address}.svg`}
                  />
                  <Link to={`/accounts/${to_address}`}>{to_address}</Link>
                </td>
                <CopyOutlined
                  style={{ fontSize: '20px', marginTop: '16px' }}
                  onClick={() =>
                    navigator.clipboard.writeText(to_address).then(() =>
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
                    src={`https://avatars.dicebear.com/api/pixel-art/${from_address}.svg`}
                  />
                  <Link to={`/accounts/${from_address}`}>{from_address}</Link>
                </td>
                <CopyOutlined
                  style={{ fontSize: '20px', marginTop: '16px' }}
                  onClick={() =>
                    navigator.clipboard.writeText(from_address).then(() =>
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
                  {extrinsics?.extrinsic ? balanceFormat(amount) : extrinsics}{' '}
                  SEL
                </td>
              </tr>
              <tr className="tr-style">
                <td>Fee</td>
                <td>
                  {extrinsics?.extrinsic
                    ? balanceFormat(fee_amount)
                    : extrinsics?.transfers}
                  SEL
                </td>
              </tr>
              <tr className="tr-style">
                <td>Result</td>
                <td>
                  {success ? (
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
              {error_message && (
                <tr className="tr-style">
                  <td>Error Message</td>
                  <td>{error_message}</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      ) : (
        <NoData />
      )}
    </div>
  );
}
