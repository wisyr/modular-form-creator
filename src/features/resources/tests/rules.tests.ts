import { describe, expect, it } from 'vitest'
import {
  completeBasicInfo,
  completeProjectDetails,
  emptyBasicInfo,
  emptyProjectDetails,
  makeCompletedResource,
  makeResource,
} from '../../../tests/fixtures'
import {
  canEditProjectDetails,
  canProvision,
  completedModuleCount,
  isBasicInfoComplete,
  isProjectDetailsComplete,
} from '../rules'

describe('module completeness', () => {
  it('treats a fully filled Basic Info as complete', () => {
    expect(isBasicInfoComplete(completeBasicInfo)).toBe(true)
  })

  it('treats Basic Info with any empty field as incomplete', () => {
    expect(isBasicInfoComplete({ ...completeBasicInfo, priority: '' })).toBe(false)
    expect(isBasicInfoComplete({ ...completeBasicInfo, email: '' })).toBe(false)
    expect(isBasicInfoComplete({ ...completeBasicInfo, owner: '' })).toBe(false)
    expect(isBasicInfoComplete(emptyBasicInfo)).toBe(false)
  })

  it('requires every Project Details field, including a team member', () => {
    expect(isProjectDetailsComplete(completeProjectDetails)).toBe(true)
    expect(
      isProjectDetailsComplete({ ...completeProjectDetails, options: [] }),
    ).toBe(false)
    expect(
      isProjectDetailsComplete({ ...completeProjectDetails, budget: '' }),
    ).toBe(false)
    expect(isProjectDetailsComplete(emptyProjectDetails)).toBe(false)
  })
})

describe('canEditProjectDetails', () => {
  it('is locked for a draft with incomplete Basic Info', () => {
    expect(canEditProjectDetails(makeResource())).toBe(false)
  })

  it('unlocks once Basic Info is complete', () => {
    expect(
      canEditProjectDetails(makeResource({ basicInfo: completeBasicInfo })),
    ).toBe(true)
  })

  it('is always available for completed resources', () => {
    expect(canEditProjectDetails(makeCompletedResource())).toBe(true)
  })
})

describe('canProvision', () => {
  it('is false for a draft with no modules complete', () => {
    expect(canProvision(makeResource())).toBe(false)
  })

  it('is false when only one module is complete', () => {
    expect(
      canProvision(makeResource({ basicInfo: completeBasicInfo })),
    ).toBe(false)
  })

  it('is true for a draft with both modules complete', () => {
    expect(
      canProvision(
        makeResource({
          basicInfo: completeBasicInfo,
          projectDetails: completeProjectDetails,
        }),
      ),
    ).toBe(true)
  })

  it('is never allowed again for a completed resource', () => {
    expect(canProvision(makeCompletedResource())).toBe(false)
  })
})

describe('completedModuleCount', () => {
  it('counts completed modules', () => {
    expect(completedModuleCount(makeResource())).toBe(0)
    expect(
      completedModuleCount(makeResource({ basicInfo: completeBasicInfo })),
    ).toBe(1)
    expect(completedModuleCount(makeCompletedResource())).toBe(2)
  })
})
