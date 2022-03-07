#!/usr/bin/env node
import process from 'node:process'
import { start } from '../index.js'

const { PORT = '3000' } = process.env

start({ port: Number.parseInt(PORT, 10) }).then(close => {
  function shutdown () {
    close()
      .then(() => process.exit())
      .catch(err => {
        console.error(err)
        process.exit(1)
      })
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('SIGUSR2', shutdown)
})
