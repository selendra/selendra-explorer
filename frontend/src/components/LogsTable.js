import { Table } from "antd";
import React from "react";
import { formatNumber } from "../utils";
import { Link } from "react-router-dom";

export default function LogsTable({ loading, data, onChange }) {
	return (
		<Table
			dataSource={data}
			loading={loading}
			className="table-styling"
			pagination={{
				pageSize: 10,
				total: data?.length,
				onChange: (page) => {
					onChange(page);
				},
			}}
		>
			<Table.Column
				title="Log Index"
				render={(text, record) => (
					<p>
						#{formatNumber(record.block_number)}-{record.log_index}
					</p>
				)}
			/>
			<Table.Column
				title="Block"
				render={(text, record) => (
					<Link to={`/blocks/${record?.block_number}`}>
						<p>#{formatNumber(record.block_number)}</p>
					</Link>
				)}
			/>
			<Table.Column
				title="Type"
				render={(text, record) => <p>{record.type}</p>}
			/>
			<Table.Column
				title="Engine"
				render={(text, record) => <p>{record.engine}</p>}
			/>
		</Table>
	);
}
