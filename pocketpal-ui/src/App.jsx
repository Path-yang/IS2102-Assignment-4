import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ExpenseCapture from './ExpenseCapture'
import ExpenseDetail from './ExpenseDetail'
import './App.css'

function App() {
  const [savedExpenses, setSavedExpenses] = useState([])

  return (
    <Routes>
      <Route
        path="/"
        element={<ExpenseCapture savedExpenses={savedExpenses} setSavedExpenses={setSavedExpenses} />}
      />
      <Route
        path="/expense/:id"
        element={<ExpenseDetail expenses={savedExpenses} />}
      />
    </Routes>
  )
}

export default App
