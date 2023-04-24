import React, { useState } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import logo from "../assets/SEL coin white icon.png";
import SideHeader from "./SideHeader";
import sel_logo from "./../assets/SEL coin white icon.png";

export default function HeaderComponent() {
	const [current] = useState("home");
	const network = localStorage.getItem("network");

	if (
		network === null ||
		network === "" ||
		network === undefined ||
		network === "mainnet"
	) {
		localStorage.setItem("network", "mainnet");
	}
	if (network === "testnet") {
		localStorage.setItem("network", "testnet");
	}

	const toTestnet = () => {
		localStorage.setItem("network", "testnet");
		window.location.reload();
	};

	const toMainnet = () => {
		localStorage.setItem("network", "mainnet");
		window.location.reload();
	};

	const items = [
		{
			label: <Link to="/">Home</Link>,
			key: "home",
		},
		{
			label: <Link to="/accounts">Accounts</Link>,
			key: "accounts",
		},
		{
			label: <Link to="/transfers">Transfers</Link>,
			key: "transfer",
		},
		{
			label: <Link to="/staking">Staking</Link>,
			key: "staking",
		},
		{
			label: "Blockchain",
			key: "blockchain",
			children: [
				{
					label: <Link to="/blocks">Blocks</Link>,
					key: "blocks",
				},
				{
					label: <Link to="/extrinsics">Extrinsics</Link>,
					key: "extrinsisc",
				},
				{
					label: <Link to="/events">Events</Link>,
					key: "events",
				},
			],
		},
		{
			// label: network === "mainnet" ? "Mainnet" : "Testnet",
			key: "networks",
			icon: <img alt="" src={sel_logo} className="sel-logo" />,
			children: [
				{
					label: <div onClick={() => toMainnet()}>Mainnet</div>,
					key: "mainnet",
				},
				{
					label: <div onClick={() => toTestnet()}>Testnet</div>,
					key: "testnet",
				},
			],
		},
	];

	return (
		<>
			<div className="header">
				<div className="header-container">
					<div className="logo" style={{ marginRight: 18, paddingTop: "5px" }}>
						<Link to="/">
							<img src={logo} alt="" height={40} />
							{network === "testnet" ? (
								<sup className="testnet">Testnet</sup>
							) : (
								""
							)}
						</Link>
					</div>
					<Menu selectedKeys={[current]} mode="horizontal" items={items} />
				</div>
			</div>
			<SideHeader />
		</>
	);
}
