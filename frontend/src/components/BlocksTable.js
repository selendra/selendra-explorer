import { Table } from "antd";
import { Link } from "react-router-dom";
import { formatNumber, shortenAddress, timeDuration } from "../utils";

export default function BlocksTable({
	short,
	loading,
	data,
	onChange,
	total,
	current,
	onShowSizeChange,
	sizePage,
}) {
	return (
		<>
			<Table
				dataSource={data.block?.filter(
					(data) => data?.block_number.toString() !== "-1",
				)}
				loading={loading}
				rowKey={(record) => record.id}
				sortDirections="descend"
				tableLayout="fixed"
				pagination={
					short
						? false
						: {
								pageSize: parseInt(sizePage),
								current: parseInt(current),
								showSizeChanger: true,
								onShowSizeChange,
								total: total,
								onChange: (page, pageSize) => {
									onChange(page, pageSize);
								},
						  }
				}
			>
				<Table.Column
					title="Block"
					dataIndex="block_number"
					render={(block_number) => (
						<Link to={`/blocks/${block_number}`}>
							<div className="blocks-height ">
								<p># {formatNumber(block_number)}</p>
							</div>
						</Link>
					)}
				/>
				<Table.Column
					title="Hash"
					dataIndex="block_hash"
					render={(block_hash) => <p>{shortenAddress(block_hash)}</p>}
				/>
				<Table.Column
					title="Status"
					dataIndex="finalized"
					render={(finalized) => (
						<div>
							{finalized ? (
								<div className="status-background">
									<img
										src="/assets/icons/check.svg"
										alt="finalized"
										width={20}
										height={20}
									/>
									<span style={{ marginLeft: "4px" }}>Finalized</span>
								</div>
							) : (
								<div className="failed-background">
									<img
										src="/assets/icons/x-circle.svg"
										alt="finalized"
										width={20}
										height={20}
									/>
									<span style={{ marginLeft: "4px" }}>Unfinalized</span>
								</div>
							)}
						</div>
					)}
				/>
				{!short && (
					<Table.Column
						title="Time"
						responsive={["md"]}
						dataIndex="timestamp"
						render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
					/>
				)}
			</Table>
		</>
	);
}
