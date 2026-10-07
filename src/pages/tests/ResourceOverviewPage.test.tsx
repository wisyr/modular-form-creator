import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../api/resources'
import { useEditBuffer } from '../../features/resources/editBuffer'
import { renderRoute } from '../../test/renderWithProviders'
import {
  completeBasicInfo,
  completeProjectDetails,
  makeCompletedResource,
  makeResource,
} from '../../test/fixtures'
import { ResourceOverviewPage } from '../ResourceOverviewPage'

vi.mock('../../api/resources')

const renderOverview = () =>
  renderRoute(<ResourceOverviewPage />, '/resources/:resourceId', '/resources/2')

describe('ResourceOverviewPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useEditBuffer.setState({ buffers: {} })
  })

  it('locks Project Details and disables provisioning for a new draft', async () => {
    vi.mocked(api.getResource).mockResolvedValue(makeResource())
    renderOverview()

    expect(await screen.findByText('Complete Basic Info to unlock.')).toBeTruthy()
    const provision = screen.getByRole('button', { name: 'Provision resource' })
    expect((provision as HTMLButtonElement).disabled).toBe(true)
  })

  it('provisions a draft once both modules are complete', async () => {
    const draft = makeResource({
      basicInfo: completeBasicInfo,
      projectDetails: completeProjectDetails,
    })
    vi.mocked(api.getResource).mockResolvedValue(draft)
    vi.mocked(api.provisionResource).mockResolvedValue({
      ...draft,
      status: 'completed',
    })
    renderOverview()

    const provision = await screen.findByRole('button', {
      name: 'Provision resource',
    })
    expect((provision as HTMLButtonElement).disabled).toBe(false)

    await userEvent.click(provision)
    await waitFor(() => expect(api.provisionResource).toHaveBeenCalledWith('2'))
  })

  it('does not offer provisioning for a completed resource', async () => {
    vi.mocked(api.getResource).mockResolvedValue(makeCompletedResource())
    renderOverview()

    expect(
      await screen.findByText(
        'This resource is completed and cannot be provisioned again.',
      ),
    ).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Provision resource' })).toBeNull()
  })

  it('does not show the unsaved-changes banner when nothing is buffered', async () => {
    vi.mocked(api.getResource).mockResolvedValue(makeCompletedResource())
    renderOverview()

    await screen.findByText('Provisioning')
    expect(screen.queryByText(/You have unsaved changes/)).toBeNull()
  })

  it('submits buffered edits with a single full PUT', async () => {
    const resource = makeCompletedResource()
    const edited = { ...completeBasicInfo, owner: 'Jane Doe' }
    vi.mocked(api.getResource).mockResolvedValue(resource)
    vi.mocked(api.replaceResource).mockResolvedValue({
      ...resource,
      basicInfo: edited,
    })
    useEditBuffer.getState().setBasicInfo('2', edited)
    renderOverview()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Submit changes' }),
    )

    await waitFor(() =>
      expect(api.replaceResource).toHaveBeenCalledWith('2', {
        name: 'Alpha',
        basicInfo: edited,
        projectDetails: completeProjectDetails,
      }),
    )
    expect(api.replaceResource).toHaveBeenCalledTimes(1)
    // The buffer is cleared once the PUT succeeds.
    await waitFor(() => expect(useEditBuffer.getState().buffers['2']).toBeUndefined())
  })

  it('discards buffered edits without calling the API', async () => {
    vi.mocked(api.getResource).mockResolvedValue(makeCompletedResource())
    useEditBuffer.getState().setBasicInfo('2', {
      ...completeBasicInfo,
      owner: 'Jane Doe',
    })
    renderOverview()

    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }))

    await waitFor(() => expect(screen.queryByText(/You have unsaved changes/)).toBeNull())
    expect(api.replaceResource).not.toHaveBeenCalled()
  })

  it('shows a not-found message when the resource does not exist', async () => {
    const { ApiError } = await vi.importActual<typeof import('../../api/ApiError')>(
      '../api/ApiError',
    )
    vi.mocked(api.getResource).mockRejectedValue(
      new ApiError(404, 'Resource not found'),
    )
    renderOverview()

    expect(await screen.findByText('This resource could not be found.')).toBeTruthy()
  })
})
