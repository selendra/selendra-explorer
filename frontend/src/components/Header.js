import React, { useState } from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import SideHeader from './SideHeader';

export default function HeaderComponent() {
  const [current, setCurrent] = useState('home');

  const menu = (
    <Menu>
      <Menu.Item key="blocks">
        <Link to="/blocks">
          <p>Blocks</p>
        </Link>
      </Menu.Item>
      <Menu.Item key="extrinsics">
        <Link to="/extrinsics">
          <p>Extrinsics</p>
        </Link>
      </Menu.Item>
      <Menu.Item key="events">
        <Link to="/events">
          <p>Events</p>
        </Link>
      </Menu.Item>
    </Menu>
  );

  const items = [
    {
      label: <Link to="/">Home</Link>,
      key: 'home',
    },
    {
      label: <Link to="/account">Account</Link>,
      key: 'account',
    },
    {
      label: <Link to="/transfers">Transfers</Link>,
      key: 'transfer',
    },
    {
      label: <Link to="/">Staking</Link>,
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
        {
          label: <Link to="/events">Events</Link>,
          key: 'events',
        },
      ],
    },
  ];

  return (
    <div>
      <div className="header">
        <div className="header-container">
          <div className="logo" style={{ marginRight: 18, paddingTop: '5px' }}>
            <Link to="/">
              <img src={logo} alt="" height={50} />
            </Link>
          </div>
          {/* <div style={{ display: 'flex', paddingTop: '5px' }}>
            <Link to="/">
              <p style={{ paddingRight: '90px' }}>Home</p>
            </Link>
            <Link to="/accounts">
              <p style={{ paddingRight: '90px' }}>Accounts</p>
            </Link>
            <Link to="/transfers">
              <p style={{ paddingRight: '90px' }}>Transfers</p>
            </Link>
            <Link to="/staking">
              <p style={{ paddingRight: '90px' }}>Staking</p>
            </Link>
            <Dropdown
              style={{ paddingRight: '20px' }}
              overlay={menu}
              placement="bottomLeft"
              arrow
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <p>Blockchain</p>
                  <img alt="" src="/assets/icons/chevron-down.svg" width={16} />
                </Space>
              </a>
            </Dropdown>
          </div> */}
          <Menu selectedKeys={[current]} mode="horizontal" items={items} />
        </div>
      </div>
      <SideHeader />
    </div>
  );
}
