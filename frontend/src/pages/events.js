import React, { useState } from "react";
import EventsTable from "../components/EventsTable";
import { useGraphQL } from "../context/useApp";
import { useQuery } from "@apollo/client";
import { QUERY_EVENTS, TOTAL_EVENTS } from "../graphql/query";
import { useSearchParams } from "react-router-dom";

export default function Events() {
	const { query } = useGraphQL();
	const [searchParams, setSearchParams] = useSearchParams({ p: 1, size: 10 });
	const [currentPage, setCurrentPage] = useState(searchParams.get("p"));
	const [sizePage, setSizePage] = useState(searchParams.get("size"));
	const { event_aggregate } = query(useQuery(TOTAL_EVENTS));

	const start = sizePage;
	const end = currentPage;
	const events = query(
		useQuery(QUERY_EVENTS, {
			variables: {
				limit: parseInt(start),
				offset: parseInt(end),
				orderBy: [
					{
						timestamp: "desc",
					},
				],
			},
		}),
	);

	const onShowSizeChange = (current, pageSize) => {
		setSizePage(pageSize);
		setCurrentPage(current);
		setSearchParams({ ...searchParams, p: current, size: pageSize });
	};
	const onChange = (page, pageSize) => {
		setCurrentPage(page);
		setSearchParams({ ...searchParams, p: page, size: pageSize });
	};

	return (
		<>
			<div className="blocks-bg" />
			<div className="home-info">
				<div className="container">
					{/* <p className="blocks-title">Events</p> */}
					<div className="table-account">
						{events.event ? (
							<EventsTable
								data={events?.event}
								onChange={onChange}
								current={currentPage}
								sizePage={sizePage}
								total={event_aggregate?.aggregate.count}
								onShowSizeChange={onShowSizeChange}
							/>
						) : (
							events
						)}
					</div>
				</div>
			</div>
		</>
	);
}
