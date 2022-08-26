import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_HTTPS,
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret': process.env.REACT_APP_SECRET_KEY,
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
