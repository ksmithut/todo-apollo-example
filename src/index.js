import prismaClient from '@prisma/client'
import { configureServer } from './server.js'
import { once } from './lib/once.js'
import { configurePubSub } from './utils/pubsub.js'
import { configureTodoService } from './services/todo/todo.service.js'

/**
 * @param {object} params
 * @param {number} params.port
 */
export async function start ({ port }) {
  const prisma = new prismaClient.PrismaClient()
  const pubSub = configurePubSub()
  const todoService = configureTodoService({ prisma, pubSub })
  const server = await configureServer({ todoService })
  const closeServer = await server.start({ port })
  return once(async () => {
    await closeServer()
  })
}
