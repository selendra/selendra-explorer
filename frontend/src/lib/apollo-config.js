import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const testnet = process.env.REACT_APP_SELENDRA_TESTNET;
const mainnet = process.env.REACT_APP_SELENDRA_MAINNET;
const testnetKey = process.env.REACT_APP_SECRET_KEY_TESTNET;
const mainnetKey = process.env.REACT_APP_SECRET_KEY_MAINNET;
const network = window.localStorage.getItem('network');

const client = new ApolloClient({
  link: new HttpLink({
    uri: network === 'mainnet' ? mainnet : testnet,
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret': network === 'mainnet' ? mainnetKey : testnetKey,
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
