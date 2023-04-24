import { Avatar, Card, notification } from "antd";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { formatNumber, balanceFormat, standardBalance } from "../../utils";
import { CopyOutlined } from "@ant-design/icons";
import Moment from "react-moment";
import { useGraphQL } from "../../context/useApp";
import { QUERY_TRANSFER_BY_PK } from "../../graphql/query";
import { useQuery } from "@apollo/client";

export default function TransferDetail() {
	const { id } = useParams();
	const index = window.location.hash.substring(1, 10);
	const { query } = useGraphQL();
	const transfers = query(
		useQuery(QUERY_TRANSFER_BY_PK, {
			variables: {
				blockNumber: id,
				extrinsicIndex: parseInt(index),
			},
		}),
	);

	const { transfer_by_pk } = transfers;

	return (
		<div className="container">
			<div className="spacing" />
			{transfers?.transfer_by_pk ? (
				<Card className="block-detail-card" style={{ borderRadius: "8px" }}>
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
									<Link to={`/blocks/${transfer_by_pk?.block_number}`}>
										<p>#{formatNumber(transfer_by_pk?.block_number)}</p>
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
									{transfer_by_pk?.block_number}-
									{transfer_by_pk?.extrinsic_index}
								</td>
							</tr>
							<tr>
								<td>Hash</td>
								<td>{transfer_by_pk?.hash}</td>
							</tr>
							<tr className="tr-style">
								<td>From</td>
								<td>
									<Avatar
										style={{ marginRight: "4px", backgroundColor: "#87d068" }}
										size="small"
										src={`https://avatars.dicebear.com/api/pixel-art/${transfer_by_pk?.destination}.svg`}
									/>
									<Link to={`/accounts/${transfer_by_pk?.destination}`}>
										{transfer_by_pk?.destination}
									</Link>
								</td>
								<CopyOutlined
									style={{ fontSize: "20px", marginTop: "16px" }}
									onClick={() =>
										navigator.clipboard
											.writeText(transfer_by_pk?.destination)
											.then(() =>
												notification.success({
													message: "Copied",
												}),
											)
									}
								/>
							</tr>
							<tr className="tr-style">
								<td>To</td>
								<td>
									<Avatar
										style={{ marginRight: "4px", backgroundColor: "#87d068" }}
										size="small"
										src={`https://avatars.dicebear.com/api/pixel-art/${transfer_by_pk?.source}.svg`}
									/>
									<Link to={`/accounts/${transfer_by_pk?.source}`}>
										{transfer_by_pk?.source}
									</Link>
								</td>
								<CopyOutlined
									style={{ fontSize: "20px", marginTop: "16px" }}
									onClick={() =>
										navigator.clipboard
											.writeText(transfer_by_pk?.source)
											.then(() =>
												notification.success({
													message: "Copied",
												}),
											)
									}
								/>
							</tr>
							<tr className="tr-style">
								<td>Amount</td>
								<td>
									{transfers.transfer_by_pk
										? standardBalance(transfers.transfer_by_pk.amount)
										: transfers}{" "}
									SEL
								</td>
							</tr>
							<tr className="tr-style">
								<td>Fee</td>
								<td>
									{/* {transfers.transfer_by_pk
										? parseInt(
												formatNumber(transfers.transfer_by_pk.fee_amount),
										  ).toPrecision(18)
										: transfers}{" "} */}
									{standardBalance(transfer_by_pk?.fee_amount)} SEL
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
											<span style={{ marginLeft: "4px" }}>Failed</span>
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
			) : (
				transfers
			)}
		</div>
	);
}
