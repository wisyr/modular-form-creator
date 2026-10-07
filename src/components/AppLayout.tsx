import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useEditBuffer } from '../features/resources/editBuffer'
import { MAIN_CONTENT_ID, SkipLink } from './ui'

/**
 * Root layout. Warns before a refresh/close while any completed resource has
 * unsaved buffered edits (the buffer is intentionally lost in that case), and
 * handles keyboard / screen-reader basics: a skip link and focus management
 * after client-side navigation.
 */
export const AppLayout = () => {
  const hasUnsavedEdits = useEditBuffer(
    (state) => Object.keys(state.buffers).length > 0,
  )
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (!hasUnsavedEdits) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedEdits])

  // A new route renders without a page load, so move focus to the new content;
  // otherwise it stays on the (possibly removed) link that was clicked.
  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    document.getElementById(MAIN_CONTENT_ID)?.focus()
  }, [pathname])

  return (
    <>
      <SkipLink href={`#${MAIN_CONTENT_ID}`}>Skip to main content</SkipLink>
      <Outlet />
    </>
  )
}
