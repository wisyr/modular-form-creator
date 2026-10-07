import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useEditBuffer } from '../features/resources/editBuffer'

/**
 * Root layout. Warns before a refresh/close while any completed resource has
 * unsaved buffered edits (the buffer is intentionally lost in that case).
 */
export const AppLayout = () => {
  const hasUnsavedEdits = useEditBuffer(
    (state) => Object.keys(state.buffers).length > 0,
  )

  useEffect(() => {
    if (!hasUnsavedEdits) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedEdits])

  return <Outlet />
}
