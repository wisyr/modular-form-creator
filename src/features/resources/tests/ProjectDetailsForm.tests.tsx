import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../../api/resources'
import {
  completeProjectDetails,
  makeCompletedResource,
} from '../../../tests/fixtures'
import { renderRoute } from '../../../tests/renderWithProviders'
import { useEditBuffer } from '../editBuffer'
import { ProjectDetailsForm } from '../ProjectDetailsForm'

vi.mock('../../../api/resources')

describe('ProjectDetailsForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useEditBuffer.setState({ buffers: {} })
  })

  it('only writes to the local buffer for a completed resource', async () => {
    renderRoute(
      <ProjectDetailsForm resource={makeCompletedResource()} />,
      '/resources/:resourceId/project-details',
      '/resources/2/project-details',
    )

    const budget = screen.getByLabelText('Budget')
    await userEvent.clear(budget)
    await userEvent.type(budget, '20000')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(useEditBuffer.getState().buffers['2']?.projectDetails).toEqual({
        ...completeProjectDetails,
        budget: '20000',
      }),
    )
    expect(api.patchProjectDetails).not.toHaveBeenCalled()
    expect(api.replaceResource).not.toHaveBeenCalled()
  })

  it('rejects a non-numeric budget', async () => {
    renderRoute(
      <ProjectDetailsForm resource={makeCompletedResource()} />,
      '/resources/:resourceId/project-details',
      '/resources/2/project-details',
    )

    const budget = screen.getByLabelText('Budget')
    await userEvent.clear(budget)
    await userEvent.type(budget, '12abc')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Budget must contain only digits')).toBeTruthy()
    expect(useEditBuffer.getState().buffers['2']).toBeUndefined()
  })
})
