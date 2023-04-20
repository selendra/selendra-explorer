import { Table } from "antd";
import { Link } from "react-router-dom";
import { shortenAddress, balanceFormat, standardBalance } from "../utils";

export default function ssAccountsTable({
	short,
	accounts,
	onChange,
	account_aggregate,
	current,
	onShowSizeChange,
	sizePage,
	loading,
}) {
	return (
		<Table
			pagination={
				short
					? false
					: {
							pageSize: parseInt(sizePage),
							showSizeChanger: true,
							onShowSizeChange,
							current: parseInt(current),
							total: account_aggregate?.aggregate.count,
							onChange: (page, sizePage) => {
								onChange(page, parseInt(sizePage));
							},
					  }
			}
			loading={loading}
			bordered={false}
			dataSource={accounts?.account?.filter(
				(account) =>
					account?.account_id !== "deleted" && account?.account_id !== "0x",
			)}
			rowKey={(record) => record.account_id}
			tableLayout="fixed"
		>
			<Table.Column
				title="Account"
				dataIndex="account_id"
				width="25%"
				render={(_, record) => (
					<Link to={`/accounts/${record.account_id}`}>
						<div className="blocks-height2">
							<p>{shortenAddress(record.account_id)}</p>
						</div>
					</Link>
				)}
			/>
			<Table.Column
				title="Free Balance"
				dataIndex="free_balance"
				render={(free_balance) => <p>{standardBalance(free_balance)} SEL</p>}
			/>
			{!short && (
				<Table.Column
					title="Locked Balance"
					responsive={["md"]}
					dataIndex="locked_balance"
					render={(locked_balance) => (
						<p>{standardBalance(locked_balance)} SEL</p>
					)}
				/>
			)}
			<Table.Column
				title="Available Balance"
				dataIndex="available_balance"
				render={(available_balance) => (
					<p>{standardBalance(available_balance)} SEL</p>
				)}
			/>
		</Table>
	);
}
