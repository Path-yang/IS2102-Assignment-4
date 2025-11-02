import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './ExpenseConfirmation.css'

const MODES = {
  SCAN: 'scan',
  MANUAL: 'manual',
}

function ExpenseConfirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const expense = location.state?.expense

  useEffect(() => {
    if (!expense) {
      navigate('/')
    }
  }, [expense, navigate])

  if (!expense) {
    return null
  }

  const handleCaptureAnother = () => {
    navigate('/')
  }

  const handleViewDetails = () => {
    navigate(`/expense/${expense.id}`)
  }

  return (
    <div className="app-shell">
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="confirmation-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#4c72d6" strokeWidth="2" fill="#e3edff" />
              <path
                d="M8 12.5l2.5 2.5L16 9"
                stroke="#4c72d6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="confirmation-title">Expense Saved Successfully!</h1>
          <p className="confirmation-message">
            Your expense has been captured and saved as a draft. You can now sync it to the ledger
            or capture another expense.
          </p>

          <div className="confirmation-summary">
            <h2>Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Merchant</span>
                <span className="summary-value">{expense.merchant}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Amount</span>
                <span className="summary-value highlight">SGD {expense.amount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date</span>
                <span className="summary-value">{expense.date}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Category</span>
                <span className="summary-value">{expense.category || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Entry Method</span>
                <span className="summary-value">
                  <span className={`mode-pill mode-${expense.mode}`}>
                    {expense.mode === MODES.SCAN ? 'Receipt scan' : 'Manual'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="action-button primary" onClick={handleCaptureAnother}>
              Capture Another Expense
            </button>
            <button className="action-button secondary" onClick={handleViewDetails}>
              View Full Details
            </button>
          </div>

          <div className="confirmation-footer">
            <p>
              This expense is saved locally as a draft. Remember to sync with your accounting
              system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseConfirmation
