import React from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { LayoutProps } from '../../../types';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;