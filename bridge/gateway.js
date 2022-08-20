const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { introspectSchema } = require('@graphql-tools/wrap');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { fetch } = require('cross-fetch');
const { print } = require('graphql');
const cors = require('cors');

function makeRemoteExecutor(url) {
  return async ({ document, variables }) => {
    const query = print(document);
    const fetchResult = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })
      .then((response) => {
        return response;
      })
      .catch((e) => {
        throw new Error(`${e}`);
      });
    return fetchResult.json();
  };
}

async function makeGatewaySchema() {
  const selendraExplorer = await makeRemoteExecutor(
    'https://testnet-graphql.selendra.org/v1/graphql',
  );

  return stitchSchemas({
    subschemas: [
      {
        schema: await introspectSchema(selendraExplorer),
        executor: selendraExplorer,
      },
    ],
  });
}

const app = express();
const corsConfig = {
  origin: ['http://localhost:3004'],
  credentials: true,
};

app.use(cors(corsConfig));

app.use(
  '/graphql',
  graphqlHTTP(async () => {
    const schema = await makeGatewaySchema();
    return {
      schema,
      graphiql: true,
    };
  }),
);

app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});
