import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'

/**
 * @param {object} params
 * @param {import('node:http').Server} params.server
 * @param {string} params.path
 * @param {Omit<import('graphql-ws').ServerOptions, 'schema'>} [params.serverOptions]
 * @returns {import('apollo-server-core').PluginDefinition}
 */
export default function ApolloServerWebsocketSubscriptions ({
  server,
  path,
  serverOptions = {}
}) {
  return {
    async serverWillStart ({ schema }) {
      const wsServer = new WebSocketServer({ server, path })
      const serverCleanup = useServer({ ...serverOptions, schema }, wsServer)
      return {
        async drainServer () {
          await serverCleanup.dispose()
        }
      }
    }
  }
}
