import { useEffect } from 'react'

const APP_NAME = 'Modular Form Creator'

/** Keeps the browser tab / screen-reader page title in sync with the current view. */
export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
