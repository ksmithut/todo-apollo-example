import React from 'react'
import clsx from 'clsx'
import {
  useTodos,
  useCompleteTodo,
  useUncompleteTodo,
  useRemoveTodo
} from '../utils/use-todos.js'

export default function TodoList () {
  const [todos] = useTodos()
  return (
    <ul className='w-56'>
      {todos.map(todo => (
        <TodoListItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}

/**
 * @param {React.LiHTMLAttributes<{}> & { todo: import('../utils/use-todos').Todo }} props
 */
function TodoListItem ({ todo, ...props }) {
  const [completeTodo] = useCompleteTodo(todo)
  const [uncompleteTodo] = useUncompleteTodo(todo)
  const [removeTodo] = useRemoveTodo(todo)
  const handleSubmit = React.useCallback(
    e => {
      e.preventDefault()
      const formData = new FormData(e.target)
      const completed = formData.get('completed') === 'on'
      completed ? completeTodo() : uncompleteTodo()
    },
    [todo, completeTodo, uncompleteTodo]
  )
  const handleDeleteSubmit = React.useCallback(
    e => {
      e.preventDefault()
      removeTodo()
    },
    [removeTodo]
  )
  return (
    <li {...props} className='border-b flex justify-between items-center group'>
      <form onSubmit={handleSubmit} className='flex-grow'>
        <label
          className={clsx('flex py-1 w-full cursor-pointer', {
            'line-through text-gray-500': !!todo.completedAt
          })}
        >
          <input
            className='mr-2'
            type='checkbox'
            name='completed'
            checked={!!todo.completedAt}
            onChange={e => e.target.form?.requestSubmit()}
          />
          {todo.label}
        </label>
      </form>
      <form onSubmit={handleDeleteSubmit} className='flex-grow-0'>
        <button className='text-red-400 px-2 py-1 transition-opacity opacity-0 group-hover:opacity-100'>
          ✘
        </button>
      </form>
    </li>
  )
}
