import DataLoader from 'dataloader'
import { ulid } from '../../lib/id.js'
import { keyBy } from '../../lib/key-by.js'

/** @typedef {ReturnType<configureTodoService>} TodoService */

/**
 * @param {object} params
 * @param {import('@prisma/client').PrismaClient} params.prisma
 * @param {import('graphql-subscriptions').PubSub} params.pubSub
 */
export function configureTodoService ({ prisma, pubSub }) {
  return {
    /**
     * @param {object} params
     * @param {string} params.label
     */
    async addTodo ({ label }) {
      const todo = await prisma.todo.create({
        data: { id: ulid(), label }
      })
      await pubSub.publish('TODO_ADDED', { todoAdded: todo })
      return todo
    },
    /**
     * @param {object} params
     * @param {string} params.id
     * @param {Date} [params.clock]
     */
    async completeTodo ({ id, clock = new Date() }) {
      const todo = await prisma.todo.update({
        where: { id },
        data: { completedAt: clock }
      })
      if (!todo) return null
      await pubSub.publish('TODO_COMPLETED', { todoCompleted: todo })
      return todo
    },
    /**
     * @param {object} params
     * @param {string} params.id
     * @param {Date } [params.clock]
     */
    async uncompleteTodo ({ id, clock }) {
      const todo = await prisma.todo.update({
        where: { id },
        data: { completedAt: null }
      })
      if (!todo) return null
      await pubSub.publish('TODO_UNCOMPLETED', { todoUncompleted: todo })
      return todo
    },
    /**
     * @param {object} params
     * @param {string} params.id
     */
    async removeTodo ({ id }) {
      const todo = await prisma.todo.delete({
        where: { id }
      })
      if (!todo) return null
      await pubSub.publish('TODO_REMOVED', { todoRemoved: todo })
      return todo
    },
    /**
     * @param {object} params
     * @param {string} params.id
     */
    async todo ({ id }) {
      const todo = await prisma.todo.findUnique({
        where: { id }
      })
      return todo
    },
    async todos () {
      const todos = await prisma.todo.findMany()
      return todos
    },
    createDataLoaders () {
      /** @type {DataLoader<string, import('@prisma/client').Todo>} */
      const todosById = new DataLoader(async ids => {
        const todos = await prisma.todo.findMany({
          where: { id: { in: ids.slice() } }
        })
        const byId = keyBy(todos, 'id')
        return ids.map(id => byId[id] ?? null)
      })
      /** @type {DataLoader<0, import('@prisma/client').Todo[]>} */
      const todosList = new DataLoader(
        async () => {
          const todos = await prisma.todo.findMany()
          todos.forEach(todo => todosById.prime(todo.id, todo))
          return [todos]
        },
        {
          batch: false,
          cacheKeyFn: () => true
        }
      )
      return {
        todosById,
        todosList
      }
    },
    subscribeTodoAdded () {
      return pubSub.asyncIterator(['TODO_ADDED'])
    },
    subscribeTodoCompleted () {
      return pubSub.asyncIterator(['TODO_COMPLETED'])
    },
    subscribeTodoUncompleted () {
      return pubSub.asyncIterator(['TODO_UNCOMPLETED'])
    },
    subscribeTodoRemoved () {
      return pubSub.asyncIterator(['TODO_REMOVED'])
    }
  }
}
