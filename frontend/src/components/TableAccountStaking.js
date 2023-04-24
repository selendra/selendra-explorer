import { Table } from "antd";
import React from "react";
import {
	balanceFormat,
	formatNumber,
	standardBalance,
	timeDuration,
} from "../utils";

export default function TableAccountStaking({
	loading,
	data,
	short,
	onChange,
}) {
	return (
		<Table
			dataSource={data}
			className="table-styling"
			sortDirections="descond"
			pagination={
				short
					? false
					: {
							pageSize: 10,
							total: data?.total_page,
							onChange: (page) => {
								onChange(page);
							},
					  }
			}
		>
			<Table.Column
				title="Block"
				dataIndex="block_number"
				render={(block_number) => (
					<div className="blocks-height">
						<p># {formatNumber(block_number)}</p>
					</div>
				)}
			/>
			<Table.Column
				title="Time"
				dataIndex="timestamp"
				render={(timestamp) => <p>{timeDuration(timestamp)}</p>}
			/>
			<Table.Column
				title="Amount"
				dataIndex="amount"
				render={(amount) => <p>{standardBalance(amount)} SEL</p>}
			/>
		</Table>
	);
}
