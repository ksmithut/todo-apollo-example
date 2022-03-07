import { gql } from 'apollo-server-core'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { encodeNodeId, decodeNodeId } from '../../lib/graphql-id.js'
import sharedTypeDefs from '../../utils/apollo-types.js'

const typeDefs = gql`
  type Todo implements Node {
    id: ID!
    label: String!
    completedAt: String
  }

  type Query {
    todo(id: ID!): Todo
    todos: [Todo!]!
  }

  type Mutation {
    addTodo(label: String!): Todo!
    completeTodo(id: ID!): Todo
    uncompleteTodo(id: ID!): Todo
    removeTodo(id: ID!): Todo
  }

  type Subscription {
    todoAdded: Todo!
    todoCompleted: Todo!
    todoUncompleted: Todo!
    todoRemoved: Todo!
  }
`

const TODO_TYPENAME = 'Todo'

/**
 * @type {import('../../utils/apollo-schema').NodeTypeMap}
 */
export const NODE_TYPES = new Map([
  [TODO_TYPENAME, (id, ctx) => ctx.todoLoaders.todosById.load(id)]
])

/**
 * @type {import('@graphql-tools/utils').IResolvers<any, import('../../server').ApolloContext>}
 */
const resolvers = {
  Query: {
    todo (_, { id }, ctx) {
      const [todoId] = decodeNodeId(id)
      return ctx.todoLoaders.todosById.load(todoId)
    },
    todos (_, __, ctx) {
      return ctx.todoLoaders.todosList.load(0)
    }
  },
  Mutation: {
    addTodo (_, { label }, ctx) {
      return ctx.todoService.addTodo({ label })
    },
    completeTodo (_, { id }, ctx) {
      const [todoId] = decodeNodeId(id)
      return ctx.todoService.completeTodo({ id: todoId })
    },
    uncompleteTodo (_, { id }, ctx) {
      const [todoId] = decodeNodeId(id)
      return ctx.todoService.uncompleteTodo({ id: todoId })
    },
    removeTodo (_, { id }, ctx) {
      const [todoId] = decodeNodeId(id)
      return ctx.todoService.removeTodo({ id: todoId })
    }
  },
  Subscription: {
    todoAdded: {
      subscribe (_, __, ctx) {
        return ctx.todoService.subscribeTodoAdded()
      }
    },
    todoCompleted: {
      subscribe (_, __, ctx) {
        return ctx.todoService.subscribeTodoCompleted()
      }
    },
    todoUncompleted: {
      subscribe (_, __, ctx) {
        return ctx.todoService.subscribeTodoUncompleted()
      }
    },
    todoRemoved: {
      subscribe (_, __, ctx) {
        return ctx.todoService.subscribeTodoRemoved()
      }
    }
  },
  Todo: {
    id (todo) {
      return encodeNodeId(todo.id, TODO_TYPENAME)
    },
    completedAt (todo) {
      return todo.completedAt?.toISOString()
    }
  }
}

export default makeExecutableSchema({
  typeDefs: [typeDefs, sharedTypeDefs],
  resolvers
})
