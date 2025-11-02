import { useParams, useNavigate } from 'react-router-dom'
import './ExpenseDetail.css'

const MODES = {
  SCAN: 'scan',
  MANUAL: 'manual',
}

function ExpenseDetail({ expenses }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const expense = expenses.find((exp) => exp.id === id)

  if (!expense) {
    return (
      <div className="app-shell">
        <div className="detail-page">
          <div className="detail-not-found">
            <h2>Expense Not Found</h2>
            <p>The expense you're looking for doesn't exist or has been removed.</p>
            <button className="back-button" onClick={() => navigate('/')}>
              ← Back to Expenses
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="detail-page">
        <header className="detail-page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Expenses
          </button>
          <div className="detail-page-title">
            <h1>Expense Details</h1>
            <span className={`mode-pill mode-${expense.mode}`}>
              {expense.mode === MODES.SCAN ? 'Receipt scan' : 'Manual'}
            </span>
          </div>
        </header>

        <div className="detail-content">
          <div className="detail-card">
            <div className="detail-section">
              <h2>Transaction Information</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Merchant</span>
                  <span className="detail-value">{expense.merchant}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value amount">SGD {expense.amount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{expense.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{expense.category || 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h2>Payment Details</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{expense.paymentMethod || 'Not specified'}</span>
                </div>
                {expense.receiptFileName && (
                  <div className="detail-item">
                    <span className="detail-label">Receipt File</span>
                    <span className="detail-value receipt-file">{expense.receiptFileName}</span>
                  </div>
                )}
              </div>
            </div>

            {expense.notes && (
              <div className="detail-section">
                <h2>Notes</h2>
                <div className="notes-content">
                  <p>{expense.notes}</p>
                </div>
              </div>
            )}

            <div className="detail-section">
              <h2>Metadata</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Entry Method</span>
                  <span className="detail-value">
                    {expense.mode === MODES.SCAN ? 'Receipt Scan' : 'Manual Entry'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">
                    {new Date(expense.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseDetail
