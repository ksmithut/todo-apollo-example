import React from 'react'
import TodoList from './components/TodoList.jsx'
import AddTodoForm from './components/AddTodoForm.jsx'

export default function App () {
  return (
    <main className='flex items-center flex-col mt-2'>
      <AddTodoForm />
      <TodoList />
    </main>
  )
}
