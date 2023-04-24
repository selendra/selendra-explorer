import { useState } from "react";
import { Card, Row } from "antd";
import TableStaking from "../../components/TableStaking";
import DataField from "../../components/Overview/DataField";
import { useGraphQL } from "../../context/useApp";
import { useQuery } from "@apollo/client";
import { QUERY_CHAIN_INFO, QUERY_VALIDATOR } from "../../graphql/query";
import { filterCount } from "../../utils/chainInfo";
import { useSearchParams } from "react-router-dom";

export default function Staking() {
	const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 10 });
	const [currentPage, setCurrentPage] = useState(searchParams.get("p"));
	const [sizePage, setSizePage] = useState(searchParams.get("size"));

	const { query } = useGraphQL();
	const { total } = query(useQuery(QUERY_CHAIN_INFO));

	const start = sizePage;
	const end = currentPage;

	const ranking = query(
		useQuery(QUERY_VALIDATOR, {
			variables: { limit: parseInt(start), offset: parseInt(end) - 1 },
		}),
	);

	const onShowSizeChange = (current, pageSize) => {
		setSizePage(pageSize);
		setCurrentPage(current);
		setSearchParams({ p: current, size: pageSize });
	};
	const onChange = (page, pageSize) => {
		setCurrentPage(page);
		setSearchParams({ p: page, size: pageSize });
	};

	return (
		<div>
			<div className="home-container">
				<div className="container">
					<p className="blocks-title">Validators</p>
					<Card className="staking">
						<Row align="middle" gutter={[32, 32]}>
							<DataField
								icon="/assets/icons/validator-white.svg"
								title="Validator"
								data={filterCount(total, "active_validator_count")}
							/>
							<DataField
								icon="/assets/icons/timer.svg"
								title="Waiting"
								data={filterCount(total, "waiting_validator_count")}
							/>
							<DataField
								icon="/assets/icons/box-tick.svg"
								title="Ative Era"
								data={filterCount(total, "active_era")}
							/>
							<DataField
								icon="/assets/icons/box-time.svg"
								title="Current Era"
								data={filterCount(total, "current_era")}
							/>
						</Row>
					</Card>
					{/* <Row gutter={[16, 16]}> 
						
						<Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
							<center className="staking">
								<Chart
									dataEra={filterCount(total, "active_era")}
									datacurrentEra={filterCount(total, "current_era")}
								/>
							</center>
						</Col>
					</Row> */}
				</div>
			</div>
			<div className="container">
				<div className="spacing" />
				{ranking?.ranking ? (
					<TableStaking
						data={ranking}
						onChange={onChange}
						account_aggregate={
							filterCount(total, "waiting_validator_count") +
							filterCount(total, "active_validator_count")
						}
						current={currentPage}
						onShowSizeChange={onShowSizeChange}
						sizePage={sizePage}
					/>
				) : (
					ranking
				)}
			</div>
		</div>
	);
}
