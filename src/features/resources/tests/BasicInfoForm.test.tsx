import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../../api/resources'
import {
  completeBasicInfo,
  makeCompletedResource,
  makeResource,
} from '../../../test/fixtures'
import { renderRoute } from '../../../test/renderWithProviders'
import { BasicInfoForm } from '../BasicInfoForm'
import { useEditBuffer } from '../editBuffer'

vi.mock('../../../api/resources')

const renderForm = (resource: ReturnType<typeof makeResource>) =>
  renderRoute(
    <BasicInfoForm resource={resource} />,
    '/resources/:resourceId/basic-info',
    '/resources/2/basic-info',
  )

const fillAll = async () => {
  await userEvent.type(screen.getByLabelText('Owner'), 'John Smith')
  await userEvent.type(screen.getByLabelText('Email'), 'john@example.com')
  await userEvent.type(screen.getByLabelText('Description'), 'A test resource')
  await userEvent.selectOptions(screen.getByLabelText('Priority'), 'high')
}

describe('BasicInfoForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useEditBuffer.setState({ buffers: {} })
  })

  it('keeps the resource name locked and read-only', () => {
    renderForm(makeResource())

    const name = screen.getByLabelText('Resource name') as HTMLInputElement
    expect(name.value).toBe('Alpha')
    expect(name.disabled || name.readOnly).toBe(true)
  })

  it('shows validation errors and sends nothing when the form is empty', async () => {
    renderForm(makeResource())

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Owner is required')).toBeTruthy()
    expect(api.patchBasicInfo).not.toHaveBeenCalled()
  })

  it('PATCHes the module for a draft resource, with the original name', async () => {
    const draft = makeResource()
    vi.mocked(api.patchBasicInfo).mockResolvedValue(draft)
    renderForm(draft)

    await fillAll()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(api.patchBasicInfo).toHaveBeenCalledWith('2', {
        resourceName: 'Alpha',
        owner: 'John Smith',
        email: 'john@example.com',
        description: 'A test resource',
        priority: 'high',
      }),
    )
  })

  it('only writes to the local buffer for a completed resource', async () => {
    renderForm(makeCompletedResource())

    const owner = screen.getByLabelText('Owner')
    await userEvent.clear(owner)
    await userEvent.type(owner, 'Jane Doe')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(useEditBuffer.getState().buffers['2']?.basicInfo).toEqual({
        ...completeBasicInfo,
        owner: 'Jane Doe',
      }),
    )
    expect(api.patchBasicInfo).not.toHaveBeenCalled()
    expect(api.replaceResource).not.toHaveBeenCalled()
  })

  it('starts from the buffered edit when one exists', () => {
    useEditBuffer
      .getState()
      .setBasicInfo('2', { ...completeBasicInfo, owner: 'Jane Doe' })
    renderForm(makeCompletedResource())

    expect((screen.getByLabelText('Owner') as HTMLInputElement).value).toBe(
      'Jane Doe',
    )
  })
})
