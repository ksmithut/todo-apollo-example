import React from 'react'
import { gql, useMutation } from '@apollo/client'

const addTodoMutation = gql`
  mutation AddTodo($label: String!) {
    addTodo(label: $label) {
      id
      label
      completedAt
    }
  }
`

export default function AddTodoForm () {
  const [addTodo, { loading }] = useMutation(addTodoMutation)
  const handleSubmit = React.useCallback(
    e => {
      e.preventDefault()
      if (loading) return
      const form = e.target
      const data = new FormData(form)
      addTodo({
        variables: { label: data.get('label') },
        onCompleted () {
          for (const element of form.elements) {
            element.value = ''
          }
        }
      })
    },
    [addTodo, loading]
  )
  return (
    <form onSubmit={handleSubmit} className='my-2'>
      <input
        className='text-center py-1 border-2 border-transparent transition-colors rounded-sm hover:border-gray-200'
        disabled={loading}
        name='label'
        placeholder='Enter new todo label'
      />
    </form>
  )
}
