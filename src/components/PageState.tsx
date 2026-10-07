import { Link } from 'react-router-dom'
import { getErrorMessage, isApiError } from '../api/ApiError'
import { Button } from '../design-system'
import { Banner, Row } from './ui'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Banner role="status" aria-live="polite">
      {label}
    </Banner>
  )
}

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
}

/** 404 / invalid-id get a "back to list" link; other errors offer a retry. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const notFound =
    isApiError(error) && (error.status === 404 || error.status === 400)
  return (
    <Banner $tone="error" role="alert">
      <p style={{ marginTop: 0 }}>
        {notFound ? 'This resource could not be found.' : getErrorMessage(error)}
      </p>
      <Row>
        {notFound ? (
          <Link to="/resources">Back to resources</Link>
        ) : onRetry ? (
          <Button type="button" size="small" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </Row>
    </Banner>
  )
}
