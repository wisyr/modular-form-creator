import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { theme } from '../design-system/theme/theme'
import { RouteErrorPage } from './RouteErrorPage'

const broken = () => {
  throw new Error('boom')
}

const renderRouter = (path: string) => {
  const router = createMemoryRouter(
    [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { path: '/broken', element: createElement(broken) },
          { path: '/fine', element: <p>All good</p> },
        ],
      },
    ],
    { initialEntries: [path] },
  )
  return render(
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
}

describe('RouteErrorPage', () => {
  beforeEach(() => {
    // React logs caught render errors; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('catches a page that throws while rendering', async () => {
    renderRouter('/broken')

    expect(
      await screen.findByRole('heading', { name: 'Something went wrong' }),
    ).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Go to resources' })).toBeTruthy()
    expect(document.title).toBe('Something went wrong · Modular Form Creator')
  })

  it('shows a 404 for a route that does not exist', async () => {
    renderRouter('/nope')

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Reload page' })).toBeNull()
  })

  it('leaves healthy routes alone', async () => {
    renderRouter('/fine')

    expect(await screen.findByText('All good')).toBeTruthy()
  })
})
