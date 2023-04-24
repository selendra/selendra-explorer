import { Table } from "antd";
import React from "react";
import { formatNumber, timeDuration } from "../utils";
import { Link } from "react-router-dom";

export default function EventsTable({
	loading,
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
			rowKey={(record) => `${record?.block_number} ${record?.event_index}`}
			loading={loading}
			// className="table-styling"
			pagination={{
				pageSize: parseInt(sizePage),
				total: total,
				current: parseInt(current),
				showSizeChanger: true,
				onShowSizeChange,
				onChange: (page, sizePage) => {
					onChange(page, parseInt(sizePage));
				},
			}}
		>
			<Table.Column
				title="Event ID"
				render={(text, record) => (
					<p>
						#{formatNumber(record?.block_number)}-{record?.event_index}
					</p>
				)}
			/>
			<Table.Column
				title="Block"
				render={(_, record) => (
					<Link to={`/blocks/${record?.block_number}`}>
						<p className="blocks-height">
							#{formatNumber(record?.block_number)}
						</p>
					</Link>
				)}
			/>
			<Table.Column
				title="Time"
				responsive={["md"]}
				render={(text, record) => <p>{timeDuration(record.timestamp)}</p>}
			/>
			<Table.Column
				title="Section/Method"
				render={(text, record) => (
					<p>
						{record.section}{" "}
						<img src="/assets/icons/arrow.svg" alt="" width={14} height={14} />{" "}
						{record.method}
					</p>
				)}
			/>
		</Table>
	);
}
