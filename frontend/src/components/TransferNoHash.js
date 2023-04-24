import { Avatar, Row, Table } from "antd";
import { Link } from "react-router-dom";
import {
	formatNumber,
	shortenAddress,
	timeDuration,
	balanceFormat,
	standardBalance,
} from "../utils";

export default function NoHashTransactions({
	short,
	data,
	loading,
	onChange,
	total,
	current,
	onShowSizeChange,
	sizePage,
}) {
	return (
		<Table
			dataSource={data}
			loading={loading}
			rowKey={(record) => record.id}
			tableLayout="fixed"
			className="table-styling"
			pagination={{
				pageSize: parseInt(sizePage),
				total: total,
				showSizeChanger: true,
				onShowSizeChange,
				current: parseInt(current),
				onChange: (page, sizePage) => {
					onChange(page, parseInt(sizePage));
				},
			}}
		>
			{!short && (
				<Table.Column
					title="Block"
					responsive={["md"]}
					dataIndex="block_number"
					render={(block_number) => (
						<Link to={`/blocks/${block_number}`}>
							<div className="blocks-height">
								<p>#{formatNumber(block_number)}</p>
							</div>
						</Link>
					)}
				/>
			)}
			{!short && (
				<Table.Column
					title="Time"
					responsive={["md"]}
					dataIndex="timestamp"
					render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
				/>
			)}
			<Table.Column
				title="From"
				responsive={["md"]}
				dataIndex="source"
				render={(source) => (
					<Row>
						<Avatar
							style={{ marginRight: "4px", backgroundColor: "#87d068" }}
							size="small"
							src={`https://avatars.dicebear.com/api/pixel-art/${source}.svg`}
						/>
						<a href={`/accounts/${source}`}>{shortenAddress(source)}</a>
					</Row>
				)}
			/>
			<Table.Column
				title="To"
				dataIndex="destination"
				render={(destination) => (
					<Row>
						<Avatar
							style={{ marginRight: "4px", backgroundColor: "#87d068" }}
							size="small"
							src={`https://avatars.dicebear.com/api/pixel-art/${destination}.svg`}
						/>
						<a href={`/accounts/${destination}`}>
							{shortenAddress(destination)}
						</a>
					</Row>
				)}
			/>
			<Table.Column
				title="Amount"
				dataIndex="amount"
				render={(amount) => <p>{standardBalance(amount)} SEL</p>}
			/>
			<Table.Column
				title="Fee"
				dataIndex="fee_amount"
				render={(fee_amount) => <p>{standardBalance(fee_amount)} SEL</p>}
			/>
			<Table.Column
				title="Age"
				dataIndex="timestamp"
				render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
			/>
			<Table.Column
				title="Status"
				dataIndex="success"
				render={(success) =>
					success ? (
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
						<img
							src="/assets/icons/x-circle.svg"
							alt="finalized"
							width={18}
							height={18}
						/>
					)
				}
			/>
		</Table>
	);
}
