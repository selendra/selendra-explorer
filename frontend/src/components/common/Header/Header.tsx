import React from 'react';
import { SITE_CONSTANTS } from '../../../content';
import { HeaderProps } from '../../../types';

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="header">
      <nav className="nav">
        <h1 className="nav-brand">{SITE_CONSTANTS.SITE_NAME}</h1>
        <ul className="nav-menu">
          {SITE_CONSTANTS.NAV_ITEMS.map((item, index) => (
            <li key={index} className="nav-item">
              <a href={item.path} className="nav-link">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;