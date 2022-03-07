import { PubSub } from 'graphql-subscriptions'

export function configurePubSub () {
  return new PubSub()
}
