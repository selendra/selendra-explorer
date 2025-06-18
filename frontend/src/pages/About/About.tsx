import { TEXTS } from '../../content';
import { useNetworkInfo } from '../../hooks';
import { APP_CONFIG } from '../../config/app.config';
import type { CSSProperties } from 'react';

const About = () => {
  const { data: networkInfo, loading: networkLoading, error: networkError } = useNetworkInfo();

  const pageStyle: CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const sectionStyle: CSSProperties = {
    marginBottom: '3rem'
  };

  const cardStyle: CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const detailItemStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f0f0f0'
  };

  const labelStyle: CSSProperties = {
    fontWeight: '600',
    color: '#1f2937'
  };

  const valueStyle: CSSProperties = {
    color: '#6b7280',
    textAlign: 'right'
  };

  return (
    <div className="page about-page" style={pageStyle}>
      <div className="container">
        <h1 style={{ color: '#3b82f6', fontSize: '2.5rem', marginBottom: '1rem' }}>
          {TEXTS.about.title}
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '3rem', lineHeight: '1.7' }}>
          {TEXTS.about.description}
        </p>

        <section style={sectionStyle}>
          <h2 style={{ color: '#1f2937', fontSize: '1.75rem', marginBottom: '1.5rem', borderBottom: '2px solid #3b82f6', paddingBottom: '0.5rem' }}>
            Network Information
          </h2>
          
          <div style={cardStyle}>
            <h3 style={{ color: '#3b82f6', marginBottom: '1rem', fontSize: '1.25rem' }}>
              Selendra Network Info
            </h3>
            <div>
              <div style={detailItemStyle}>
                <span style={labelStyle}>Network Name:</span>
                <span style={valueStyle}>{APP_CONFIG.blockchain.evm.name}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={labelStyle}>Currency:</span>
                <span style={valueStyle}>{APP_CONFIG.blockchain.evm.currency}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={labelStyle}>Decimals:</span>
                <span style={valueStyle}>{APP_CONFIG.blockchain.evm.decimals}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={labelStyle}>Explorer URL:</span>
                <span style={valueStyle}>
                  <a href={APP_CONFIG.blockchain.evm.explorer} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {APP_CONFIG.blockchain.evm.explorer}
                  </a>
                </span>
              </div>
              {networkLoading && <p>Loading network info...</p>}
              {networkError && <p>Error loading network info: {networkError}</p>}
              {networkInfo && (
              <div className="network-info">
                <h2>Network Info</h2>
                <ul>
                  <li><strong>Name:</strong> {"Selendra"}</li>
                  <li><strong>Chain ID:</strong> {networkInfo.chain_id}</li>
                  {/* Add more fields as needed */}
                </ul>
              </div>
            )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;