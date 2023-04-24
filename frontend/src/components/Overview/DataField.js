import { Col, Row, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

export default function DataField({ icon, title, data, isPercent, isRoute }) {
	const { theme } = useTheme();

	return (
		<Col xs={10} sm={6} md={6} lg={6} xl={6}>
			<Row gutter={[8, 8]} align="middle">
				<Col xs={24} sm={4} md={4} lg={4} xl={4}>
					<img
						src={icon}
						alt=""
						width={26}
						height={26}
						className={
							theme === "dark" ? "icon-all-data-dark" : "icon-all-data-light"
						}
					/>
				</Col>
				<Col xs={24} sm={20} md={12} lg={12} xl={12}>
					<p className="home-all-data-title">{title}</p>
					{isRoute ? (
						<Link to={isRoute} className="home-all-data-route">
							<Tooltip placement="top" title="Click to see all data!">
								<p className="home-all-data-data">
									{data} {isPercent && "%"}
								</p>
							</Tooltip>
						</Link>
					) : (
						<p className="home-all-data-data">
							{data} {isPercent && "%"}
						</p>
					)}
				</Col>
			</Row>
		</Col>
	);
}
