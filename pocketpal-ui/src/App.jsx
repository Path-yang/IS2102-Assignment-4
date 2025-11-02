import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const MODES = {
  SCAN: 'scan',
  MANUAL: 'manual',
}

const blankForm = {
  merchant: '',
  amount: '',
  date: '',
  category: '',
  paymentMethod: '',
  notes: '',
}

const mockReceipts = [
  {
    merchant: 'Everyday Grocer',
    amount: '42.70',
    date: new Date().toISOString().slice(0, 10),
    category: 'Groceries',
    paymentMethod: 'Visa **** 2189',
    notes: 'Auto-captured from receipt photo. Verify tip before saving.',
  },
  {
    merchant: 'Metro Taxi',
    amount: '18.40',
    date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    category: 'Transport',
    paymentMethod: 'Corporate Card **** 0045',
    notes: 'OCR identified license plate #SJD2041.',
  },
  {
    merchant: 'Cafe Solstice',
    amount: '12.80',
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    category: 'Food & Beverage',
    paymentMethod: 'Mastercard **** 5573',
    notes: 'Suggested category based on OCR keywords.',
  },
]

const categories = [
  'Food & Beverage',
  'Transport',
  'Accommodation',
  'Groceries',
  'Office Supplies',
  'Entertainment',
  'Miscellaneous',
]

const paymentMethods = [
  'Corporate Card',
  'Personal Card',
  'Cash',
  'Bank Transfer',
  'Reimbursable Wallet',
]

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function App() {
  const [mode, setMode] = useState(MODES.SCAN)
  const [formData, setFormData] = useState({ ...blankForm })
  const [receiptFileName, setReceiptFileName] = useState('')
  const [status, setStatus] = useState(null)
  const [savedExpenses, setSavedExpenses] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedSummary, setExtractedSummary] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const extractionTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (extractionTimer.current) {
        window.clearTimeout(extractionTimer.current)
      }
    }
  }, [])

  const totals = useMemo(() => {
    const amount = Number.parseFloat(formData.amount) || 0

    return {
      amount: amount.toFixed(2),
      total: amount.toFixed(2),
    }
  }, [formData.amount])

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setStatus(null)
    setFormData({ ...blankForm })
    setReceiptFileName('')
    setExtractedSummary(null)
  }

  const handleReceiptUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setReceiptFileName(file.name)
    setIsProcessing(true)
    setStatus({
      type: 'info',
      message: 'Scanning receipt image. OCR will extract the key fields automatically.',
    })

    extractionTimer.current = window.setTimeout(() => {
      const sample = mockReceipts[Math.floor(Math.random() * mockReceipts.length)]
      setFormData((prev) => ({
        ...prev,
        ...sample,
      }))
      setExtractedSummary(sample)
      setIsProcessing(false)
      setStatus({
        type: 'success',
        message: 'Details extracted. Review suggestions, edit if needed, then save to PocketPal.',
      })
    }, 900)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveExpense = (event) => {
    event.preventDefault()
    const requiredFields = ['merchant', 'amount', 'date']
    const missing = requiredFields.filter((field) => !formData[field]?.trim())

    if (missing.length) {
      setStatus({
        type: 'error',
        message: 'Please provide merchant, amount, and date before saving the expense.',
      })
      return
    }

    const normalizedAmount = Number.parseFloat(formData.amount)
    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      setStatus({
        type: 'error',
        message: 'Amount must be a positive number.',
      })
      return
    }

    const expenseRecord = {
      id: makeId(),
      mode,
      createdAt: new Date().toISOString(),
      receiptFileName,
      ...formData,
      amount: normalizedAmount.toFixed(2),
    }

    setSavedExpenses((prev) => [expenseRecord, ...prev])
    setStatus({
      type: 'success',
      message: 'Expense saved. You can now sync to the ledger or capture another expense.',
    })

    setFormData({ ...blankForm })
    setReceiptFileName('')
    setExtractedSummary(null)
  }

  const filteredExpenses = useMemo(() => {
    return savedExpenses.filter((expense) => {
      if (filterCategory && expense.category !== filterCategory) return false
      if (filterMode && expense.mode !== filterMode) return false
      return true
    })
  }, [savedExpenses, filterCategory, filterMode])

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense)
  }

  const closeModal = () => {
    setSelectedExpense(null)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">PocketPal</span>
          <h1>Capture Expense</h1>
        </div>
        <p className="header-copy">
          Prototype interface for the capture expense feature. Toggle between receipt scanning and
          manual entry to document spending on the go.
        </p>
      </header>

      <section className="mode-switcher">
        <div className="mode-buttons">
          <button
            type="button"
            className={mode === MODES.SCAN ? 'active' : ''}
            onClick={() => handleModeChange(MODES.SCAN)}
          >
            Scan receipt
          </button>
          <button
            type="button"
            className={mode === MODES.MANUAL ? 'active' : ''}
            onClick={() => handleModeChange(MODES.MANUAL)}
          >
            Manual entry
          </button>
        </div>
        <p className="mode-hint">
          {mode === MODES.SCAN
            ? 'User uploads a receipt image. System auto-fills the form and highlights editable fields.'
            : 'User inputs expense details directly. Use this path for cash expenses or unreadable receipts.'}
        </p>
      </section>

      <section className="content-layout">
        <div className="primary-column">
          <div className="card form-card">
            <div className="card-header">
              <h2>{mode === MODES.SCAN ? 'Receipt details' : 'Manual expense entry'}</h2>
              {receiptFileName && (
                <span className="badge file-badge" title="Receipt file">
                  {receiptFileName}
                </span>
              )}
            </div>

            {mode === MODES.SCAN ? (
              <div className="scan-dropzone">
                <label className="file-input">
                  <input type="file" accept="image/*" onChange={handleReceiptUpload} />
                  <span>Upload or snap receipt image</span>
                </label>
                <p>
                  System checks camera permissions, queues the image, and keeps a local copy until
                  upload succeeds.
                </p>
              </div>
            ) : (
              <div className="manual-guidance">
                <p>
                  Capture expenses without a receipt or when OCR fails. Required fields are merchant,
                  amount, and date.
                </p>
              </div>
            )}

            {status && (
              <div className={`status-banner status-${status.type}`}>
                <span>{status.message}</span>
              </div>
            )}

            {isProcessing && (
              <div className="processing-banner">Processing receipt... extracting fields.</div>
            )}

            {mode === MODES.SCAN && !extractedSummary && !isProcessing && (
              <div className="empty-state">
                <p>
                  No receipt processed yet. Upload an image to preview the auto-populated fields.
                </p>
              </div>
            )}

            <form className="form-grid" onSubmit={handleSaveExpense}>
              <label className="field">
                <span>Merchant *</span>
                <input
                  type="text"
                  name="merchant"
                  placeholder="e.g., Everyday Grocer"
                  value={formData.merchant}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span>Amount (SGD) *</span>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span>Date *</span>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span>Category</span>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Payment method</span>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="">Select method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field-notes">
                <span>Notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Add context for finance..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </label>

              <div className="actions">
                <button type="submit">Save expense</button>
                <span>Saving creates a draft and updates monthly totals immediately.</span>
              </div>
            </form>
          </div>
        </div>

        <aside className="secondary-column">
          <div className="card review-card">
            <div className="card-header">
              <h2>Review panel</h2>
              <span className="card-subtitle">Instant feedback before confirmation</span>
            </div>
            <dl className="review-details">
              <div>
                <dt>Merchant</dt>
                <dd>{formData.merchant || '--'}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>SGD {totals.amount}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>SGD {totals.total}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{formData.date || '--'}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{formData.category || 'Awaiting selection'}</dd>
              </div>
              <div>
                <dt>Payment method</dt>
                <dd>{formData.paymentMethod || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{formData.notes || 'Add context for approvers'}</dd>
              </div>
            </dl>
            {mode === MODES.SCAN && extractedSummary && (
              <div className="auto-insight">
                <h3>Auto-detected from receipt</h3>
                <ul>
                  <li>Merchant keywords matched: {extractedSummary.merchant}</li>
                  <li>Suggested category: {extractedSummary.category}</li>
                  <li>Confidence score: 92%</li>
                </ul>
              </div>
            )}
          </div>

          <div className="card saved-card">
            <div className="card-header">
              <h2>Captured expenses</h2>
              <span className="card-subtitle">Latest saved drafts</span>
            </div>

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

            {savedExpenses.length === 0 ? (
              <div className="empty-state">
                <p>No expenses saved yet. Entries appear here for quick review.</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <p>No expenses match the selected filters.</p>
              </div>
            ) : (
              <ul className="saved-list">
                {filteredExpenses.map((expense) => (
                  <li key={expense.id} onClick={() => handleExpenseClick(expense)} className="clickable-expense">
                    <div className="saved-top">
                      <strong>{expense.merchant}</strong>
                      <span>SGD {expense.amount}</span>
                    </div>
                    <div className="saved-meta">
                      <span className={`mode-pill mode-${expense.mode}`}>
                        {expense.mode === MODES.SCAN ? 'Receipt scan' : 'Manual'}
                      </span>
                      <span>{expense.date}</span>
                      {expense.category && <span>{expense.category}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>

      {selectedExpense && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Expense Details</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Merchant</span>
                <span className="detail-value">{selectedExpense.merchant}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <span className="detail-value">SGD {selectedExpense.amount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{selectedExpense.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value">{selectedExpense.category || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Method</span>
                <span className="detail-value">{selectedExpense.paymentMethod || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Entry Mode</span>
                <span className="detail-value">
                  <span className={`mode-pill mode-${selectedExpense.mode}`}>
                    {selectedExpense.mode === MODES.SCAN ? 'Receipt scan' : 'Manual'}
                  </span>
                </span>
              </div>
              {selectedExpense.receiptFileName && (
                <div className="detail-row">
                  <span className="detail-label">Receipt File</span>
                  <span className="detail-value">{selectedExpense.receiptFileName}</span>
                </div>
              )}
              {selectedExpense.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{selectedExpense.notes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value">{new Date(selectedExpense.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
