import { Card, notification, message } from 'antd';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import useFetch from '../../hooks/useFetch';
import { formatNumber, timeDuration } from '../../utils';
import { CopyOutlined } from '@ant-design/icons';
import ReactJson from 'react-json-view';
import { useGraphQL } from '../../context/useApp';
import { useQuery } from '@apollo/client';
import { QUERY_EXTRINSIC_BY_PK } from '../../graphql/query';

export default function ExtrinsicDetail() {
  const { id } = useParams();

  const { query } = useGraphQL();
  const extrinsic = query(
    useQuery(QUERY_EXTRINSIC_BY_PK, {
      variables: { extrinsicByPkId: id },
    })
  );

  const { extrinsic_by_pk } = extrinsic;

  // const {
  //   loading,
  //   data = [],
  //   error,
  // } = useFetch(`${process.env.REACT_APP_API}/extrinsic/${id}`);

  // if (loading)
  //   return (
  //     <div className="container">
  //       <Loading />
  //     </div>
  //   );
  // console.log('error', error);

  // if (error)
  //   return (
  //     <div className="container">
  //       <NotFound error={error} />
  //     </div>
  //   );

  return (
    <div className="container">
      {extrinsic_by_pk ? (
        <>
          <div className="spacing" />
          <p className="block-title">
            Extrinsic #{extrinsic_by_pk?.block_id}-{extrinsic_by_pk?.index}
          </p>
          <Card className="block-detail-card" style={{ borderRadius: '8px' }}>
            <table className="table">
              <tbody>
                <tr>
                  <td>Block Number</td>
                  <td>
                    <Link to={`/blocks/${extrinsic_by_pk?.block_id}`}>
                      #{formatNumber(extrinsic_by_pk?.block_id)}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>Time</td>
                  <td>{timeDuration(extrinsic_by_pk?.timestamp)}</td>
                </tr>
                <tr>
                  <td>Extrinsic Index</td>
                  <td>{extrinsic_by_pk?.index}</td>
                </tr>
                <tr>
                  <td>Hash</td>
                  <td>{extrinsic_by_pk?.hash}</td>
                  <CopyOutlined
                    style={{ fontSize: '20px', marginTop: '8px' }}
                    onClick={() =>
                      navigator.clipboard
                        .writeText(extrinsic_by_pk?.hash)
                        .then(() =>
                          notification.success({
                            message: 'Copied',
                          })
                        )
                    }
                  />
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    {extrinsic_by_pk?.success ? (
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

                <tr>
                  <td>Signed</td>
                  <td>
                    {extrinsic_by_pk?.signed_data ? (
                      <img
                        src="/assets/icons/check.svg"
                        alt=""
                        width={18}
                        height={18}
                      />
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
                <tr>
                  <td>Signer</td>
                  <td>{extrinsic_by_pk?.signer || ' '}</td>
                </tr>
                <tr>
                  <td>Section and Method</td>
                  <td>
                    {extrinsic_by_pk?.section}{' '}
                    <img
                      src="/assets/icons/arrow.svg"
                      alt=""
                      width={14}
                      height={14}
                    />{' '}
                    {extrinsic_by_pk?.method}
                  </td>
                </tr>
                <tr>
                  <td>Documentation</td>
                  <td>
                    {extrinsic_by_pk?.docs && (
                      <ReactJson
                        collapsed={true}
                        src={{
                          documentation: JSON.parse(
                            JSON.stringify(extrinsic_by_pk?.docs)
                          ),
                        }}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Arguments</td>
                  <td>
                    {extrinsic_by_pk?.args && (
                      <ReactJson
                        collapsed={true}
                        src={{ args: JSON.parse(extrinsic_by_pk?.args) }}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        extrinsic
      )}
    </div>
  );
}
