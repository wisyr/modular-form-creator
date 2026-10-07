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
    expect(screen.getAllByRole('link', { name: 'Open' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'Details' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2)
  })

  it('shows an empty state when there are no resources', async () => {
    vi.mocked(api.listResources).mockResolvedValue(listOf())
    renderList()

    expect(
      await screen.findByText('No resources yet. Create your first one.'),
    ).toBeTruthy()
  })

  it('rejects an invalid name before calling the API', async () => {
    vi.mocked(api.listResources).mockResolvedValue(listOf())
    renderList()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Create resource' }))
    await user.type(await screen.findByLabelText('Resource name'), 'bad_name!')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(screen.getByText(/only letters, numbers, spaces and hyphens/i)).toBeTruthy(),
    )
    expect(api.createResource).not.toHaveBeenCalled()
  })
})
