import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../api/resources'
import { useEditBuffer } from '../../features/resources/editBuffer'
import { completeBasicInfo, makeCompletedResource } from '../../tests/fixtures'
import { renderRoute } from '../../tests/renderWithProviders'
import { ResourceDetailsPage } from '../ResourceDetailsPage'

vi.mock('../../api/resources')

const renderDetails = () =>
  renderRoute(
    <ResourceDetailsPage />,
    '/resources/:resourceId/details',
    '/resources/2/details',
  )

describe('ResourceDetailsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useEditBuffer.setState({ buffers: {} })
  })

  it('shows the saved data and status', async () => {
    vi.mocked(api.getResource).mockResolvedValue(makeCompletedResource())
    renderDetails()

    expect(await screen.findByText('John Smith')).toBeTruthy()
    expect(screen.getByText('Completed')).toBeTruthy()
    expect(screen.queryByText('Unsaved changes')).toBeNull()
  })

  it('shows buffered edits and marks them as unsaved', async () => {
    vi.mocked(api.getResource).mockResolvedValue(makeCompletedResource())
    useEditBuffer
      .getState()
      .setBasicInfo('2', { ...completeBasicInfo, owner: 'Jane Doe' })
    renderDetails()

    expect(await screen.findByText('Jane Doe')).toBeTruthy()
    expect(screen.queryByText('John Smith')).toBeNull()
    expect(screen.getAllByText('Unsaved changes')).toHaveLength(1)
  })
})
