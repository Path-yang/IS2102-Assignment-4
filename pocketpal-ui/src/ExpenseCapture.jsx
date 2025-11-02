import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

const errorScenarios = [
  {
    id: 'camera',
    title: 'Camera access denied',
    summary: 'System prompts user to grant permission or choose an image from the gallery.',
    cta: 'Request camera access',
  },
  {
    id: 'ocr',
    title: 'Unreadable receipt',
    summary: 'OCR fails to extract data; system asks user to enter details manually.',
    cta: 'Switch to manual entry',
  },
  {
    id: 'network',
    title: 'Network failure',
    summary: 'Image queued locally; system retries upload when connection is restored.',
    cta: 'Retry upload',
  },
  {
    id: 'validation',
    title: 'Validation error',
    summary: 'Missing or invalid amount/date; system highlights the error for correction.',
    cta: 'Fix highlighted fields',
  },
  {
    id: 'save',
    title: 'Save failure',
    summary: 'Database error; system shows “Failed to save expense” and retains draft.',
    cta: 'Try again later',
  },
]

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const pickMockReceipt = () => {
  const randomIndex = Math.floor(Math.random() * mockReceipts.length)
  return mockReceipts[randomIndex]
}

function ExpenseCapture({ savedExpenses, setSavedExpenses }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState(MODES.SCAN)
  const [formData, setFormData] = useState({ ...blankForm })
  const [receiptFileName, setReceiptFileName] = useState('')
  const [status, setStatus] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedSummary, setExtractedSummary] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const [reviewData, setReviewData] = useState(null)
  const [showCaptureOptions, setShowCaptureOptions] = useState(false)
  const [showCameraOverlay, setShowCameraOverlay] = useState(false)
  const [activeError, setActiveError] = useState(null)
  const fileInputRef = useRef(null)
  const extractionTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (extractionTimer.current) {
        window.clearTimeout(extractionTimer.current)
      }
    }
  }, [])

  const reviewTotals = useMemo(() => {
    const amount = reviewData ? Number.parseFloat(reviewData.amount) || 0 : 0

    return {
      amount: amount.toFixed(2),
      total: amount.toFixed(2),
    }
  }, [reviewData])

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setFormData({ ...blankForm })
    setReceiptFileName('')
    setStatus(null)
    setExtractedSummary(null)
    setShowReview(false)
    setReviewData(null)
    setShowCaptureOptions(false)
    setShowCameraOverlay(false)
    setActiveError(null)
  }

  const startExtraction = (sampleData, fileLabel, infoMessage = 'Processing receipt. OCR extraction in progress...') => {
    if (!sampleData) return

    if (extractionTimer.current) {
      window.clearTimeout(extractionTimer.current)
    }

    setShowReview(false)
    setReviewData(null)
    setExtractedSummary(null)
    setReceiptFileName(fileLabel)
    setIsProcessing(true)
    setActiveError(null)
    setStatus({
      type: 'info',
      message: infoMessage,
    })

    extractionTimer.current = window.setTimeout(() => {
      setFormData(sampleData)
      setExtractedSummary({
        merchant: sampleData.merchant,
        amount: sampleData.amount,
        category: sampleData.category,
      })
      setIsProcessing(false)
      setStatus({
        type: 'success',
        message: 'Receipt processed. Review auto-filled fields below.',
      })
    }, 1800)
  }

  const handleReceiptUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const sample = pickMockReceipt()
    setShowCaptureOptions(false)
    setShowCameraOverlay(false)
    startExtraction(sample, file.name)
    event.target.value = ''
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setShowReview(false)
  }

  const handleChooseUpload = () => {
    setShowCaptureOptions(false)
    fileInputRef.current?.click()
  }

  const handleChooseScan = () => {
    setShowCaptureOptions(false)
    setShowCameraOverlay(true)
  }

  const handleMockCapture = () => {
    const sample = pickMockReceipt()
    const fileLabel = `CameraCapture-${Date.now()}.jpg`
    setShowCameraOverlay(false)
    startExtraction(sample, fileLabel, 'Scanning receipt with camera...')
  }

  const handleTriggerError = (scenario) => {
    setShowCaptureOptions(false)
    setShowCameraOverlay(false)
    setActiveError({
      ...scenario,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const handleDismissError = () => {
    setActiveError(null)
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
    setReviewData(expenseRecord)
    setShowReview(true)
    setStatus({
      type: 'success',
      message: 'Review generated. Confirm submission to save the expense.',
    })
  }

  const handleConfirmExpense = () => {
    if (!reviewData) return

    setSavedExpenses((prev) => [reviewData, ...prev])
    navigate('/confirmation', { state: { expense: reviewData } })

    setFormData({ ...blankForm })
    setReceiptFileName('')
    setExtractedSummary(null)
    setReviewData(null)
    setShowReview(false)
    setStatus(null)
    setActiveError(null)
  }

  return (
    <>
      {showCaptureOptions && (
        <div className="overlay" onClick={() => setShowCaptureOptions(false)}>
          <div className="capture-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Select input method</h3>
            <p className="modal-copy">Choose how you want to add the receipt.</p>
            <button className="modal-button" type="button" onClick={handleChooseUpload}>
              Upload from gallery
            </button>
            <button className="modal-button outline" type="button" onClick={handleChooseScan}>
              Scan with camera
            </button>
            <button className="modal-cancel" type="button" onClick={() => setShowCaptureOptions(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCameraOverlay && (
        <div className="overlay" onClick={() => setShowCameraOverlay(false)}>
          <div className="camera-modal" onClick={(event) => event.stopPropagation()}>
            <div className="camera-header">
              <h3>Mock camera preview</h3>
              <button
                type="button"
                className="camera-close"
                onClick={() => setShowCameraOverlay(false)}
                aria-label="Close camera"
              >
                ×
              </button>
            </div>
            <div className="camera-frame">
              <div className="camera-guides">
                <span className="camera-hint">Align receipt within the guide</span>
              </div>
            </div>
            <div className="camera-controls">
              <button className="camera-button ghost" type="button" onClick={() => setShowCameraOverlay(false)}>
                Cancel
              </button>
              <button className="camera-button primary" type="button" onClick={handleMockCapture}>
                Capture receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {activeError && (
        <div className="overlay" onClick={handleDismissError}>
          <div className="error-modal" onClick={(event) => event.stopPropagation()}>
            <div className="error-modal-header">
              <span className="error-indicator" aria-hidden="true">!</span>
              <div className="error-heading">
                <h3>{activeError.title}</h3>
                <span className="error-timestamp">{activeError.timestamp}</span>
              </div>
              <button
                type="button"
                className="error-close"
                onClick={handleDismissError}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
            <p className="error-modal-summary">{activeError.summary}</p>
            <div className="error-modal-actions">
              <button type="button" className="error-action" onClick={handleDismissError}>
                {activeError.cta}
              </button>
              <button type="button" className="error-secondary" onClick={handleDismissError}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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

            {mode === MODES.SCAN && (
              <div className="scan-dropzone">
                <button
                  type="button"
                  className="capture-trigger"
                  onClick={() => setShowCaptureOptions(true)}
                >
                  Upload or scan receipt image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden-input"
                />
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

        {showReview && reviewData && (
          <aside className="secondary-column">
            <div className="card review-card">
              <div className="card-header">
                <h2>Review</h2>
                <span className="card-subtitle">Ready to confirm</span>
              </div>
              <dl className="review-details">
                <div>
                  <dt>Merchant</dt>
                  <dd>{reviewData.merchant || '--'}</dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>SGD {reviewTotals.amount}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>SGD {reviewTotals.total}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{reviewData.date || '--'}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{reviewData.category || 'Awaiting selection'}</dd>
                </div>
                <div>
                  <dt>Payment method</dt>
                  <dd>{reviewData.paymentMethod || 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>{reviewData.notes || 'Add context for approvers'}</dd>
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
              <button className="save-button" type="button" onClick={handleConfirmExpense}>
                Confirm submission
              </button>
            </div>
          </aside>
        )}
      </section>

      <section className="error-library">
        <div className="card error-card">
          <div className="card-header">
            <h2>Simulated error states</h2>
            <span className="card-subtitle">Tap to preview system responses</span>
          </div>
          <div className="error-grid">
            {errorScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className="error-chip"
                onClick={() => handleTriggerError(scenario)}
              >
                <strong>{scenario.title}</strong>
                <span>{scenario.summary}</span>
              </button>
            ))}
          </div>
          <p className="error-hint">
            Each option opens a fake alert so you can document exception handling in the mockup.
          </p>
        </div>
      </section>
    </div>
  </>
  )
}

export default ExpenseCapture
