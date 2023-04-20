import { Col, Row } from "antd";
import React from "react";
import Search from "../components/Search";
import Overview from "../components/Overview";
import BlocksTable from "../components/BlocksTable";
import TransferTable from "../components/TransferTable";
import AccountsTable from "../components/AccountsTable";
import {
	QUERY_BLOCKS,
	QUERY_ACCOUNTS,
	QUERY_TRANSFERS,
	QUERY_CHAIN_INFO,
	TOTAL_BLOCKS,
	TOTAL_ISSUANCE,
} from "../graphql/query";
import { useQuery } from "@apollo/client";
import { useGraphQL } from "../context/useApp";
import { filterCount } from "../utils/chainInfo";
import sel_icon from "../assets/SEL-coin-transparent.png";
import { balanceFormat } from "../utils";

export default function Home() {
	const { query } = useGraphQL();

	const { total } = query(useQuery(QUERY_CHAIN_INFO));

	const issuance_total = query(
		useQuery(TOTAL_ISSUANCE, {
			variables: {
				orderBy: { timestamp: "desc" },
				limit: 1,
				offset: 0,
			},
		}),
	);

	const blocks = query(
		useQuery(QUERY_BLOCKS, {
			variables: {
				limit: 5,
				offset: 0,
				orderBy: [
					{
						timestamp: "desc",
					},
				],
			},
		}),
	);

	const accounts = query(
		useQuery(QUERY_ACCOUNTS, {
			variables: {
				limit: 6,
				offset: 0,
				orderBy: [
					{
						timestamp: "desc",
					},
				],
			},
		}),
	);

	const transfers = query(
		useQuery(QUERY_TRANSFERS, {
			variables: {
				limit: 5,
				offset: 0,
				orderBy: [
					{
						timestamp: "desc",
					},
				],
			},
		}),
	);

	console.log(balanceFormat(6006285500000000000000000));

	return (
		<div>
			<div className="home-container">
				<img alt="" src={sel_icon} className="sel-icon-transparent" />
				<div className="home-info">
					<h1>Selendra Blocks Explorer</h1>

					<div className="spacing" />
					<Search />
					<div className="spacing" />
					{total ? (
						<Overview
							total_blocks={filterCount(total, "blocks")}
							total_blocksFinalized={parseInt(filterCount(total, "blocks")) - 4}
							total_extrinsicSigned={filterCount(total, "signed_extrinsics")}
							total_extrinsic={filterCount(total, "extrinsics")}
							total_transfers={filterCount(total, "transfers")}
							total_validators={filterCount(total, "active_validator_count")}
							total_lockBalance={filterCount(total, "nominator_count")}
							waitingCount={filterCount(total, "waiting_validator_count")}
							total_issuance={
								issuance_total?.block &&
								issuance_total?.block?.[0]?.total_issuance
							}
						/>
					) : (
						total
					)}
				</div>
			</div>
			<div className="home-info">
				<Row gutter={[16, { xs: 8, sm: 16, md: 24, lg: 32 }]}>
					<Col xs={24} md={24} lg={12} xl={12}>
						<p>Latest Blocks</p>
						<div className="home-table">
							{blocks.block ? <BlocksTable short data={blocks} /> : blocks}
						</div>
					</Col>
					<Col xs={24} md={24} lg={12} xl={12}>
						<p>Accounts</p>
						<div className="home-table">
							{accounts.account ? (
								<AccountsTable short accounts={accounts} />
							) : (
								accounts
							)}
						</div>
					</Col>
				</Row>
			</div>
			<div className="home-info">
				<p>Latest Transactions</p>
				<div className="home-table">
					{transfers.transfer ? (
						<TransferTable short data={transfers} />
					) : (
						transfers
					)}
				</div>
			</div>
		</div>
	);
}
