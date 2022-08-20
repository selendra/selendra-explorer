import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import 'antd/dist/antd.variable.min.css';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apollo-config';
import { AppProvider } from './context/useApp';
// import { APIContextProvider } from './context/APIContext';
import Footer from './components/Footer';

ConfigProvider.config({
  theme: {
    primaryColor: '#03A9F4',
  },
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <AppProvider>
      <ConfigProvider>
        <div className="app">
          <App />
        </div>
        <Footer />
      </ConfigProvider>
    </AppProvider>
  </ApolloProvider>,
  document.getElementById('root'),
);
