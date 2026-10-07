import { beforeEach, describe, expect, it } from 'vitest'
import { completeBasicInfo, completeProjectDetails } from '../../../tests/fixtures'
import { useEditBuffer } from '../editBuffer'

describe('edit buffer', () => {
  beforeEach(() => {
    useEditBuffer.setState({ buffers: {} })
  })

  it('starts empty', () => {
    expect(useEditBuffer.getState().buffers).toEqual({})
  })

  it('stores Basic Info and Project Details edits for the same resource', () => {
    const { setBasicInfo, setProjectDetails } = useEditBuffer.getState()
    setBasicInfo('2', completeBasicInfo)
    setProjectDetails('2', completeProjectDetails)

    expect(useEditBuffer.getState().buffers['2']).toEqual({
      basicInfo: completeBasicInfo,
      projectDetails: completeProjectDetails,
    })
  })

  it('keeps buffers of different resources separate', () => {
    const { setBasicInfo } = useEditBuffer.getState()
    setBasicInfo('2', completeBasicInfo)
    setBasicInfo('3', { ...completeBasicInfo, owner: 'Jane Doe' })

    const { buffers } = useEditBuffer.getState()
    expect(buffers['2']?.basicInfo?.owner).toBe('John Smith')
    expect(buffers['3']?.basicInfo?.owner).toBe('Jane Doe')
  })

  it('overwrites a module edit without touching the other module', () => {
    const { setBasicInfo, setProjectDetails } = useEditBuffer.getState()
    setProjectDetails('2', completeProjectDetails)
    setBasicInfo('2', completeBasicInfo)
    setBasicInfo('2', { ...completeBasicInfo, owner: 'Jane Doe' })

    const buffer = useEditBuffer.getState().buffers['2']
    expect(buffer?.basicInfo?.owner).toBe('Jane Doe')
    expect(buffer?.projectDetails).toEqual(completeProjectDetails)
  })

  it('discards only the requested resource', () => {
    const { setBasicInfo, discard } = useEditBuffer.getState()
    setBasicInfo('2', completeBasicInfo)
    setBasicInfo('3', completeBasicInfo)
    discard('2')

    const { buffers } = useEditBuffer.getState()
    expect(buffers['2']).toBeUndefined()
    expect(buffers['3']).toBeDefined()
  })
})
