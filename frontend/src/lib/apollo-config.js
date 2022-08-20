import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://testnet-graphql.selendra.org/v1/graphql',
    headers: {
      'content-type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
