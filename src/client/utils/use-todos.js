import React from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'

/**
 * @typedef {object} Todo
 * @property {string} id
 * @property {string} label
 * @property {string?} completedAt
 */

const TODO_FRAGMENT = gql`
  fragment Todo on Todo {
    id
    label
    completedAt
  }
`

const todoListQuery = gql`
  ${TODO_FRAGMENT}
  query Todolist {
    todos {
      ...Todo
    }
  }
`

const todoAddedSubscription = gql`
  ${TODO_FRAGMENT}
  subscription TodoAdded {
    todoAdded {
      ...Todo
    }
  }
`

const todoCompletedSubscription = gql`
  ${TODO_FRAGMENT}
  subscription TodoCompleted {
    todoCompleted {
      ...Todo
    }
  }
`

const todoUncompletedSubscription = gql`
  ${TODO_FRAGMENT}
  subscription TodoUncompleted {
    todoUncompleted {
      ...Todo
    }
  }
`

const todoRemovedSubscription = gql`
  ${TODO_FRAGMENT}
  subscription TodoRemoved {
    todoRemoved {
      ...Todo
    }
  }
`

/**
 *
 * @returns {[Todo[], { loading: boolean, error?: import('@apollo/client').ApolloError }]}
 */
export function useTodos () {
  /** @type {import('@apollo/client').QueryResult<{ todos: Todo[], todoAdded: Todo, todoCompleted: Todo, todoUncompleted: Todo, todoRemoved: Todo }>} */
  const { data, subscribeToMore, loading, error } = useQuery(todoListQuery)
  React.useEffect(() => {
    const subscriptions = [
      subscribeToMore({
        document: todoAddedSubscription,
        updateQuery (prev, { subscriptionData }) {
          if (!subscriptionData.data) return prev
          const newTodo = subscriptionData.data.todoAdded
          return {
            ...prev,
            todos: [...prev.todos, newTodo]
          }
        }
      }),
      subscribeToMore({
        document: todoCompletedSubscription,
        updateQuery (prev, { subscriptionData }) {
          if (!subscriptionData.data) return prev
          const updatedTodo = subscriptionData.data.todoCompleted
          return {
            ...prev,
            todos: prev.todos.map(todo => {
              return todo.id === updatedTodo.id ? updatedTodo : todo
            })
          }
        }
      }),
      subscribeToMore({
        document: todoUncompletedSubscription,
        updateQuery (prev, { subscriptionData }) {
          if (!subscriptionData.data) return prev
          const updatedTodo = subscriptionData.data.todoUncompleted
          return {
            ...prev,
            todos: prev.todos.map(todo => {
              return todo.id === updatedTodo.id ? updatedTodo : todo
            })
          }
        }
      }),
      subscribeToMore({
        document: todoRemovedSubscription,
        updateQuery (prev, { subscriptionData }) {
          if (!subscriptionData.data) return prev
          const removedTodo = subscriptionData.data.todoRemoved
          return {
            ...prev,
            todos: prev.todos.filter(todo => todo.id !== removedTodo.id)
          }
        }
      })
    ]
    return () => {
      subscriptions.forEach(subscription => subscription())
    }
  }, [])
  const todos = data?.todos ?? []
  return [todos, { loading, error }]
}

const completeTodoMutation = gql`
  ${TODO_FRAGMENT}
  mutation CompleteTodo($id: ID!) {
    completeTodo(id: $id) {
      ...Todo
    }
  }
`

const uncompleteTodoMutation = gql`
  ${TODO_FRAGMENT}
  mutation UncompleteTodo($id: ID!) {
    uncompleteTodo(id: $id) {
      ...Todo
    }
  }
`

const removeTodoMutation = gql`
  ${TODO_FRAGMENT}
  mutation RemoveTodo($id: ID!) {
    removeTodo(id: $id) {
      ...Todo
    }
  }
`

/**
 * @param {Todo} todo
 * @returns {[() => void, import('@apollo/client').MutationResult<any>]}
 */
export function useCompleteTodo (todo) {
  const [completeTodo, result] = useMutation(completeTodoMutation, {
    variables: { id: todo.id }
  })
  return [
    React.useCallback(() => {
      completeTodo({
        optimisticResponse: {
          completeTodo: {
            __typename: 'Todo',
            id: todo.id,
            label: todo.label,
            completedAt: new Date().toISOString()
          }
        }
      })
    }, [completeTodo, todo]),
    result
  ]
}

/**
 * @param {Todo} todo
 * @returns {[() => void, import('@apollo/client').MutationResult<any>]}
 */
export function useUncompleteTodo (todo) {
  const [uncompleteTodo, result] = useMutation(uncompleteTodoMutation, {
    variables: { id: todo.id }
  })
  return [
    React.useCallback(() => {
      uncompleteTodo({
        optimisticResponse: {
          completeTodo: {
            __typename: 'Todo',
            id: todo.id,
            label: todo.label,
            completedAt: new Date().toISOString()
          }
        }
      })
    }, [uncompleteTodo, todo]),
    result
  ]
}

/**
 * @param {Todo} todo
 * @returns {[() => void, import('@apollo/client').MutationResult<any>]}
 */
export function useRemoveTodo (todo) {
  const [removeTodo, result] = useMutation(removeTodoMutation, {
    variables: { id: todo.id }
  })
  return [removeTodo, result]
}
