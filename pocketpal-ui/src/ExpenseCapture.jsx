import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function ExpenseCapture({ savedExpenses, setSavedExpenses }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState(MODES.SCAN)
  const [formData, setFormData] = useState({ ...blankForm })
  const [receiptFileName, setReceiptFileName] = useState('')
  const [status, setStatus] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedSummary, setExtractedSummary] = useState(null)
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
    setFormData({ ...blankForm })
    setReceiptFileName('')
    setStatus(null)
    setExtractedSummary(null)
  }

  const handleReceiptUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setReceiptFileName(file.name)
    setIsProcessing(true)
    setStatus({
      type: 'info',
      message: 'Processing receipt. OCR extraction in progress…',
    })

    const randomIndex = Math.floor(Math.random() * mockReceipts.length)
    const mockData = mockReceipts[randomIndex]

    if (extractionTimer.current) {
      window.clearTimeout(extractionTimer.current)
    }

    extractionTimer.current = window.setTimeout(() => {
      setFormData(mockData)
      setExtractedSummary({
        merchant: mockData.merchant,
        amount: mockData.amount,
        category: mockData.category,
      })
      setIsProcessing(false)
      setStatus({
        type: 'success',
        message: 'Receipt processed. Review auto-filled fields below.',
      })
    }, 1800)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveExpense = () => {
    if (!formData.merchant.trim() || !formData.date) {
      setStatus({
        type: 'error',
        message: 'Merchant and date are required.',
      })
      return
    }

    const normalizedAmount = formData.amount ? Number.parseFloat(formData.amount) : 0

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

    // Navigate to confirmation screen with expense data
    navigate('/confirmation', { state: { expense: expenseRecord } })

    setFormData({ ...blankForm })
    setReceiptFileName('')
    setExtractedSummary(null)
    setStatus(null)
  }

  const hasFormData = useMemo(() => {
    return (
      formData.merchant ||
      formData.amount ||
      formData.date ||
      formData.category ||
      formData.paymentMethod ||
      formData.notes
    )
  }, [formData])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <div className="brand">
            <span className="brand-mark">PocketPal</span>
            <h1>Capture Expense</h1>
          </div>
          <button className="history-button" onClick={() => navigate('/history')}>
            <span>Expense History</span>
            {savedExpenses.length > 0 && (
              <span className="expense-count">{savedExpenses.length}</span>
            )}
          </button>
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

            <form className="expense-form" onSubmit={(e) => e.preventDefault()}>
              <label className="field">
                <span>Merchant *</span>
                <input
                  type="text"
                  name="merchant"
                  placeholder="Name of the vendor"
                  value={formData.merchant}
                  onChange={handleInputChange}
                />
              </label>

              <label className="field">
                <span>Amount *</span>
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
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Notes</span>
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="Additional context for approvers"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </label>

              <button
                type="button"
                className="save-button"
                onClick={handleSaveExpense}
                disabled={isProcessing}
              >
                Save expense
              </button>
            </form>
          </div>
        </div>

        <aside className="secondary-column">
          {hasFormData && (
            <div className="card review-card">
              <div className="card-header">
                <h2>Review</h2>
                <span className="card-subtitle">Current entry</span>
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
                    <li>Merchant: {extractedSummary.merchant}</li>
                    <li>Amount: SGD {extractedSummary.amount}</li>
                    <li>Suggested category: {extractedSummary.category}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}

export default ExpenseCapture
