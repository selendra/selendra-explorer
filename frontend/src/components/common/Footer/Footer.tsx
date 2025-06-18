import React from 'react';
import { APP_CONFIG } from '../../../config/app.config';
import { FooterProps } from '../../../types';

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="footer">
      <p>&copy; 2024 {APP_CONFIG.name}. All rights reserved.</p>
    </footer>
  );
};

export default Footer;