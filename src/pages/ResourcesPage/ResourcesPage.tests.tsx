import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../api/resources'
import { makeCompletedResource, makeResource } from '../../tests/fixtures'
import { renderRoute } from '../../tests/renderWithProviders'
import { ResourcesPage } from './ResourcesPage'

vi.mock('../../api/resources')

const listOf = (...items: ReturnType<typeof makeResource>[]) => ({
  items,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: items.length,
    totalPages: 1,
  },
})

const renderList = () => renderRoute(<ResourcesPage />, '/resources', '/resources')

describe('ResourcesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists resources with distinct Open, Details and Delete actions', async () => {
    vi.mocked(api.listResources).mockResolvedValue(
      listOf(
        makeResource({ _id: 'a', resourceId: 2, name: 'Alpha' }),
        makeCompletedResource({ _id: 'b', resourceId: 1, name: 'Beta' }),
      ),
    )
    renderList()

    expect(await screen.findByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
    // Each action's accessible name includes the resource, so screen-reader
    // users can tell the otherwise identical buttons apart.
    expect(screen.getByRole('link', { name: 'Open Alpha' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View details of Beta' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete Alpha' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /^Open / })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: /^Delete / })).toHaveLength(2)
  })

  it('shows an empty state when there are no resources', async () => {
    vi.mocked(api.listResources).mockResolvedValue(listOf())
    renderList()

    expect(
      await screen.findByText('No resources yet. Create your first one.'),
    ).toBeTruthy()
  })

  it('sets the document title', async () => {
    vi.mocked(api.listResources).mockResolvedValue(listOf())
    renderList()

    await screen.findByText('No resources yet. Create your first one.')
    expect(document.title).toBe('Resources · Modular Form Creator')
  })

  it('returns focus to the Delete button after cancelling the dialog', async () => {
    vi.mocked(api.listResources).mockResolvedValue(
      listOf(makeResource({ _id: 'a', resourceId: 2, name: 'Alpha' })),
    )
    renderList()
    const user = userEvent.setup()

    const trigger = await screen.findByRole('button', { name: 'Delete Alpha' })
    await user.click(trigger)
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('rejects an invalid name before calling the API', async () => {
    vi.mocked(api.listResources).mockResolvedValue(listOf())
    renderList()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Create resource' }))
    await user.type(await screen.findByLabelText('Resource name'), 'bad_name!')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(screen.getByText(/only letters, numbers, spaces, and hyphens/i)).toBeTruthy(),
    )
    expect(api.createResource).not.toHaveBeenCalled()
  })
})
