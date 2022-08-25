import React, { useState } from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import SideHeader from './SideHeader';

export default function HeaderComponent() {
  const [current, setCurrent] = useState('home');

  const items = [
    {
      label: <Link to="/">Home</Link>,
      key: 'home',
    },
    {
      label: <Link to="/accounts">Accounts</Link>,
      key: 'accounts',
    },
    {
      label: <Link to="/transfers">Transfers</Link>,
      key: 'transfer',
    },
    {
      label: <Link to="/staking">Staking</Link>,
      key: 'staking',
    },
    {
      label: 'Blockchain',
      key: 'blockchain',
      children: [
        {
          label: <Link to="/blocks">Blocks</Link>,
          key: 'blocks',
        },
        {
          label: <Link to="/extrinsics">Extrinsics</Link>,
          key: 'extrinsisc',
        },
        // {
        //   label: <Link to="/events">Events</Link>,
        //   key: 'events',
        // },
      ],
    },
    {
      label: 'Networks',
      key: 'networks',
      children: [
        {
          label: <a href="/">Mainnet</a>,
          key: 'mainnet',
        },
        {
          label: <Link to="/">Testnet</Link>,
          key: 'testnet',
        },
      ],
    },
  ];

  return (
    <>
      <div className="header">
        <div className="header-container">
          <div className="logo" style={{ marginRight: 18, paddingTop: '5px' }}>
            <Link to="/">
              <img src={logo} alt="" height={50} />
              <sup className="testnet">Testnet</sup>
            </Link>
          </div>
          <Menu selectedKeys={[current]} mode="horizontal" items={items} />
        </div>
      </div>
      <SideHeader />
    </>
  );
}
