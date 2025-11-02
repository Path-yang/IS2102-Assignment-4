import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ExpenseHistory.css'

const MODES = {
  SCAN: 'scan',
  MANUAL: 'manual',
}

const categories = [
  'Food & Beverage',
  'Transport',
  'Accommodation',
  'Groceries',
  'Office Supplies',
  'Entertainment',
  'Miscellaneous',
]

function ExpenseHistory({ expenses }) {
  const navigate = useNavigate()
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMode, setFilterMode] = useState('')

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filterCategory && expense.category !== filterCategory) return false
      if (filterMode && expense.mode !== filterMode) return false
      return true
    })
  }, [expenses, filterCategory, filterMode])

  const handleExpenseClick = (expense) => {
    navigate(`/expense/${expense.id}`)
  }

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount || 0)
    }, 0)
  }, [filteredExpenses])

  return (
    <div className="app-shell">
      <div className="history-page">
        <header className="history-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Capture
          </button>
          <div className="history-title">
            <h1>Expense History</h1>
            <div className="history-stats">
              <span className="stat">
                <strong>{filteredExpenses.length}</strong> {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
              </span>
              <span className="stat total">
                <strong>SGD {totalAmount.toFixed(2)}</strong> total
              </span>
            </div>
          </div>
        </header>

        <div className="history-content">
          <div className="filter-section">
            <h2>Filters</h2>
            <div className="filter-controls">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                <option value="">All modes</option>
                <option value={MODES.SCAN}>Receipt scan</option>
                <option value={MODES.MANUAL}>Manual</option>
              </select>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h2>No expenses yet</h2>
              <p>Start capturing expenses to see them appear here.</p>
              <button className="primary-button" onClick={() => navigate('/')}>
                Capture Expense
              </button>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2>No matching expenses</h2>
              <p>Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <div className="expenses-grid">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="expense-card"
                  onClick={() => handleExpenseClick(expense)}
                >
                  <div className="expense-card-header">
                    <h3>{expense.merchant}</h3>
                    <span className="expense-amount">SGD {expense.amount}</span>
                  </div>
                  <div className="expense-card-details">
                    <div className="expense-detail-row">
                      <span className="label">Date</span>
                      <span className="value">{expense.date}</span>
                    </div>
                    {expense.category && (
                      <div className="expense-detail-row">
                        <span className="label">Category</span>
                        <span className="value">{expense.category}</span>
                      </div>
                    )}
                    <div className="expense-detail-row">
                      <span className="label">Method</span>
                      <span className={`mode-pill mode-${expense.mode}`}>
                        {expense.mode === MODES.SCAN ? 'Receipt scan' : 'Manual'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpenseHistory
