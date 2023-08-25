import cors from 'cors';
import express from 'express';
import { authMiddleware, handleLogin } from './auth.js';
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4"
import { ApolloServer } from '@apollo/server';
import { resolvers } from './resolvers.js';
import { readFile } from "node:fs/promises";
import { getUser } from './db/users.js';
const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

const typeDefs = await readFile("./schema.graphql", "utf8");

async function getContext({ req: { auth } }){
  if(!auth) return {}
  
  const user = await getUser(auth?.sub);
  if (user) {
    return { user };
  }

  return {};
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })
await apolloServer.start();

app.use('/graphql', apolloMiddleware(apolloServer, {context: getContext}))

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint https://localhost:${PORT}/graphql`);
});
