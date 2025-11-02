import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ExpenseCapture from './ExpenseCapture'
import ExpenseDetail from './ExpenseDetail'
import ExpenseConfirmation from './ExpenseConfirmation'
import ExpenseHistory from './ExpenseHistory'
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
        path="/history"
        element={<ExpenseHistory expenses={savedExpenses} />}
      />
      <Route
        path="/expense/:id"
        element={<ExpenseDetail expenses={savedExpenses} />}
      />
      <Route
        path="/confirmation"
        element={<ExpenseConfirmation />}
      />
    </Routes>
  )
}

export default App
