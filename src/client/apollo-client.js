import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const graphqlURL = new URL('/graphql', window.location.href)
const wsGraphqlURL = new URL('/ws/graphql', window.location.href)
wsGraphqlURL.protocol = wsGraphqlURL.protocol === 'https:' ? 'wss:' : 'ws:'

const httpLink = new HttpLink({ uri: graphqlURL.toString() })
const wsLink = new GraphQLWsLink(createClient({ url: wsGraphqlURL.toString() }))
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

export default new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})
