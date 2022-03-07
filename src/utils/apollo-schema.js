import { makeExecutableSchema } from '@graphql-tools/schema'
import { decodeNodeId } from '../lib/graphql-id.js'
import typeDefs from './apollo-types.js'
import { NODE_TYPES as TODO_NODE_TYPES } from '../services/todo/todo.apollo.js'

/**
 * @typedef {Map<string, (id: string, ctx: import('../server').ApolloContext) => any>} NodeTypeMap
 */

/**
 * @type {NodeTypeMap}
 */
const NODE_TYPES = new Map([...TODO_NODE_TYPES])
const DEFAULT_NODE_TYPE_HANDLER = () => null

/**
 * @type {import('@graphql-tools/utils').IResolvers<any, import('../server').ApolloContext>}
 */
const resolvers = {
  Query: {
    async node (_, { id: nodeId }, ctx) {
      const [id, __typename] = decodeNodeId(nodeId)
      const handler = NODE_TYPES.get(__typename) ?? DEFAULT_NODE_TYPE_HANDLER
      const node = await handler(id, ctx)
      return node ? { __typename, ...node } : null
    }
  },
  Node: {
    /**
     * @param {{ id: string, __typename?: string }} node
     */
    __resolveType (node) {
      if (node.__typename) return node.__typename
      const [, __typename] = decodeNodeId(node.id)
      return __typename
    }
  }
}

export default makeExecutableSchema({
  typeDefs,
  resolvers
})
