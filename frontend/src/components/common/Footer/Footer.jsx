import { APP_CONFIG } from '../../../config/app.config';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; 2024 {APP_CONFIG.name}. All rights reserved.</p>
    </footer>
  );
};

export default Footer;