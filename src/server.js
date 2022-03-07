import http from 'node:http'
import events from 'node:events'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground
} from 'apollo-server-core'
import { mergeSchemas } from '@graphql-tools/schema'
import rootSchema from './utils/apollo-schema.js'
import ApolloServerWebsocketSubscriptions from './lib/apollo-server-websocket-subscriptions.js'
import todoSchema from './services/todo/todo.apollo.js'

const PUBLIC_PATH = new URL('../public/', import.meta.url).pathname

/**
 * @typedef {object} ApolloContext
 * @property {import('./services/todo/todo.service').TodoService} todoService
 * @property {ReturnType<import('./services/todo/todo.service').TodoService['createDataLoaders']>} todoLoaders
 */

/**
 * @param {object} params
 * @param {import('./services/todo/todo.service').TodoService} params.todoService
 */
export async function configureServer ({ todoService }) {
  const app = express()
  const server = http.createServer(app)
  const apollo = new ApolloServer({
    schema: mergeSchemas({
      schemas: [rootSchema, todoSchema]
    }),
    /**
     * @param {import('apollo-server-express').ExpressContext} params
     * @returns {ApolloContext}
     */
    context ({ req, res }) {
      return {
        todoService,
        todoLoaders: todoService.createDataLoaders()
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: server }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerWebsocketSubscriptions({
        server,
        path: '/ws/graphql',
        serverOptions: {
          /**
           * @returns {ApolloContext}
           */
          context () {
            return {
              todoService,
              todoLoaders: todoService.createDataLoaders()
            }
          }
        }
      })
    ]
  })

  await apollo.start()

  app.use('/graphql', apollo.getMiddleware({ path: '/' }))
  app.get('/*', express.static(PUBLIC_PATH))

  return {
    /**
     * @param {object} params
     * @param {number} params.port
     * @param {string} [params.hostname='0.0.0.0']
     */
    async start ({ port, hostname = '0.0.0.0' }) {
      await events.once(server.listen(port, hostname), 'listening')
      return async () => {
        await apollo.stop()
      }
    }
  }
}
