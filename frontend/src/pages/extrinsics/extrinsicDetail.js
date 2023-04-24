import { Card, notification } from "antd";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { formatNumber, timeDuration } from "../../utils";
import { CopyOutlined } from "@ant-design/icons";
import ReactJson from "react-json-view";
import { useGraphQL } from "../../context/useApp";
import { useQuery } from "@apollo/client";
import { QUERY_EXTRINSIC_BY_PK } from "../../graphql/query";

export default function ExtrinsicDetail() {
	const { id } = useParams();
	const index = window.location.hash.substring(1, 10);

	const { query } = useGraphQL();
	const extrinsic = query(
		useQuery(QUERY_EXTRINSIC_BY_PK, {
			variables: { blockNumber: id, extrinsicIndex: index },
		}),
	);

	const { extrinsic_by_pk } = extrinsic;

	return (
		<div className="container">
			{extrinsic_by_pk ? (
				<>
					<div className="spacing" />

					<Card className="block-detail-card" style={{ borderRadius: "8px" }}>
						<table className="table">
							<tbody>
								<tr>
									<td>Block Number</td>
									<td>
										<Link to={`/blocks/${extrinsic_by_pk?.block_number}`}>
											#{formatNumber(extrinsic_by_pk?.block_number)}
										</Link>
									</td>
								</tr>
								<tr>
									<td>Time</td>
									<td>{timeDuration(extrinsic_by_pk?.timestamp)}</td>
								</tr>
								<tr>
									<td>Extrinsic Index</td>
									<td>{extrinsic_by_pk?.extrinsic_index}</td>
								</tr>
								<tr>
									<td>Hash</td>
									<td>{extrinsic_by_pk?.hash}</td>
									<CopyOutlined
										style={{ fontSize: "20px", marginTop: "8px" }}
										onClick={() =>
											navigator.clipboard
												.writeText(extrinsic_by_pk?.hash)
												.then(() =>
													notification.success({
														message: "Copied",
													}),
												)
										}
									/>
								</tr>
								<tr>
									<td>Status</td>
									<td>
										{extrinsic_by_pk?.success ? (
											<div className="status-background">
												<img
													src="/assets/icons/check.svg"
													alt="finalized"
													width={18}
													height={18}
												/>
												<span style={{ marginLeft: "4px" }}>Success</span>
											</div>
										) : (
											<div className="failed-background">
												<img
													src="/assets/icons/x-circle.svg"
													alt=""
													width={18}
													height={18}
												/>
												<span style={{ marginLeft: "4px" }}>Unsuccess</span>
											</div>
										)}
									</td>
								</tr>

								<tr>
									<td>Signed</td>
									<td>
										{extrinsic_by_pk?.is_signed ? (
											<div className="status-background">
												<img
													src="/assets/icons/check.svg"
													alt="finalized"
													width={18}
													height={18}
												/>
												<span style={{ marginLeft: "4px" }}>Success</span>
											</div>
										) : (
											<div className="unsigned-background">
												<img
													src="/assets/icons/box-time.svg"
													alt="unsigned"
													className="unsigned-icon"
													width={20}
													height={20}
												/>
												<span style={{ marginLeft: "4px" }}>Unsigned</span>
											</div>
										)}
									</td>
								</tr>
								<tr>
									<td>Signer</td>
									<td>{extrinsic_by_pk?.signer || " "}</td>
								</tr>
								<tr>
									<td>Section and Method</td>
									<td>
										{extrinsic_by_pk?.section}{" "}
										<img
											src="/assets/icons/arrow.svg"
											alt=""
											width={14}
											height={14}
										/>{" "}
										{extrinsic_by_pk?.method}
									</td>
								</tr>
								<tr>
									<td>Documentation</td>
									<td>
										{extrinsic_by_pk?.doc && (
											<ReactJson
												collapsed={true}
												src={{
													documentation: JSON.parse(
														JSON.stringify(extrinsic_by_pk?.doc),
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
