import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import 'antd/dist/antd.variable.min.css';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apollo-config';
// import { APIContextProvider } from './context/APIContext';
import Footer from './components/Footer';

ConfigProvider.config({
  theme: {
    primaryColor: '#03A9F4',
  },
});

ReactDOM.render(
  // <APIContextProvider>
  <ApolloProvider client={client}>
    <ConfigProvider>
      <div className="app">
        <App />
      </div>
      <Footer />
    </ConfigProvider>
  </ApolloProvider>,
  // </APIContextProvider>
  document.getElementById('root')
);
