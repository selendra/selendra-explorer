import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import { Layout } from 'antd';
import 'antd/dist/antd.variable.min.css';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@apollo/client';
import client from './lib/apollo-config';
import { AppProvider } from './context/useApp';
import { ThemeProvider } from 'next-themes';
import 'remixicon/fonts/remixicon.css';
import CustomFooter from './components/Footer';
import * as serviceWorker from './serviceWorker';

ConfigProvider.config({
  theme: {
    primaryColor: '#03A9F4',
  },
});

const { Footer, Content } = Layout;

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider enableSystem={false}>
      <AppProvider>
        <ConfigProvider>
          <Layout>
            <Content>
              <App />
            </Content>
            <Footer>
              <CustomFooter />
            </Footer>
          </Layout>
        </ConfigProvider>
      </AppProvider>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById('root'),
);
serviceWorker.unregister();
