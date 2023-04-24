import { Table } from "antd";
import { Link } from "react-router-dom";
import { formatNumber, shortenAddress, timeDuration } from "../utils";

export default function ExtrinsicsTable({
	short,
	data,
	onChange,
	total,
	current,
	onShowSizeChange,
	sizePage,
}) {
	return (
		<Table
			dataSource={data}
			rowKey={(record) => record.hash}
			tableLayout="fixed"
			pagination={
				short
					? false
					: {
							pageSize: parseInt(sizePage),
							total: total,
							showSizeChanger: true,
							onShowSizeChange,
							current: parseInt(current),
							onChange: (page, sizePage) => {
								onChange(page, parseInt(sizePage));
							},
					  }
			}
		>
			<Table.Column
				title="Hash"
				render={(_, record) => (
					<Link
						to={`/extrinsics/${record.block_number}#${record?.extrinsic_index}`}
					>
						<div className="blocks-height">
							<p>{shortenAddress(record.hash)}</p>
						</div>
					</Link>
				)}
			/>

			<Table.Column
				title="Extrinsic ID"
				render={(text, record) => (
					<p>
						#{formatNumber(record.block_number)}-{record.extrinsic_index}
					</p>
				)}
			/>
			<Table.Column
				title="Section/Method"
				render={(text, record) => (
					<span>
						{record.section}{" "}
						<img src="/assets/icons/arrow.svg" alt="" width={14} height={14} />{" "}
						{""}
						{record.method}
					</span>
				)}
			/>
			{!short && (
				<>
					<Table.Column
						title="Time"
						responsive={["md"]}
						dataIndex="timestamp"
						render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
					/>
					<Table.Column
						title="Signed"
						responsive={["md"]}
						dataIndex="is_signed"
						render={(is_signed) => (
							<p>
								{is_signed ? (
									<div className="status-background">
										<img
											src="/assets/icons/check.svg"
											alt="finalized"
											width={20}
											height={20}
										/>
										<span style={{ marginLeft: "4px" }}>Signed</span>
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
							</p>
						)}
					/>
				</>
			)}
		</Table>
	);
}
