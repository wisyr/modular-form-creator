/** Error thrown for every failed backend call; mirrors the `{ message, details }` contract. */
export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError

/** User-facing message for any thrown value. */
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) return error.message
  if (error instanceof TypeError) {
    return 'Cannot reach the server. Check your connection and try again.'
  }
  return 'Something went wrong. Please try again.'
}
