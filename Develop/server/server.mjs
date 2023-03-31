import express from 'express';
import { ApolloServer } from '@apollo/server';
import path from 'path';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import {authMiddleware} from './utils/auth.mjs';

import { typeDefs, resolvers } from './schemas/index.mjs';
import  connection  from './config/connection.mjs';


const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Creates a new instance of the ApolloServer class.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// // Route handler for the root URL path.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

await server.start();

app.use(
  cors(),
  bodyParser.json(),
  expressMiddleware(server),
);

await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  })
})


