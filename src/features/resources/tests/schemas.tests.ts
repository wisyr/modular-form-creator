import { describe, expect, it } from 'vitest'
import { completeBasicInfo, completeProjectDetails } from '../../../tests/fixtures'
import {
  basicInfoSchema,
  projectDetailsSchema,
  resourceNameSchema,
} from '../schemas'

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? []

describe('resourceNameSchema', () => {
  it('accepts letters, numbers, spaces and hyphens, and trims', () => {
    const result = resourceNameSchema.safeParse('  My Resource-2  ')
    expect(result.success).toBe(true)
    expect(result.data).toBe('My Resource-2')
  })

  it.each(['', '   ', 'bad_name', 'bad!', 'x'.repeat(256)])(
    'rejects %j',
    (value) => {
      expect(resourceNameSchema.safeParse(value).success).toBe(false)
    },
  )
})

describe('basicInfoSchema', () => {
  it('accepts a complete payload', () => {
    expect(basicInfoSchema.safeParse(completeBasicInfo).success).toBe(true)
  })

  it('rejects owners with digits or symbols', () => {
    const result = basicInfoSchema.safeParse({ ...completeBasicInfo, owner: 'John3' })
    expect(messages(result)).toContain('Owner can contain only letters and spaces')
  })

  it('rejects invalid emails', () => {
    expect(
      basicInfoSchema.safeParse({ ...completeBasicInfo, email: 'not-an-email' })
        .success,
    ).toBe(false)
  })

  it('rejects descriptions over 1000 characters', () => {
    expect(
      basicInfoSchema.safeParse({
        ...completeBasicInfo,
        description: 'x'.repeat(1001),
      }).success,
    ).toBe(false)
  })

  it('only accepts the known priorities', () => {
    expect(
      basicInfoSchema.safeParse({ ...completeBasicInfo, priority: 'urgent' })
        .success,
    ).toBe(false)
    expect(
      basicInfoSchema.safeParse({ ...completeBasicInfo, priority: '' }).success,
    ).toBe(false)
  })
})

describe('projectDetailsSchema', () => {
  it('accepts a complete payload', () => {
    expect(projectDetailsSchema.safeParse(completeProjectDetails).success).toBe(
      true,
    )
  })

  it('requires the budget to be digits only', () => {
    expect(
      projectDetailsSchema.safeParse({ ...completeProjectDetails, budget: '12abc' })
        .success,
    ).toBe(false)
    expect(
      projectDetailsSchema.safeParse({ ...completeProjectDetails, budget: '12.5' })
        .success,
    ).toBe(false)
  })

  it('only accepts the known categories', () => {
    expect(
      projectDetailsSchema.safeParse({
        ...completeProjectDetails,
        category: 'other',
      }).success,
    ).toBe(false)
  })

  it('requires at least one known team member', () => {
    const none = projectDetailsSchema.safeParse({
      ...completeProjectDetails,
      options: [],
    })
    expect(messages(none)).toContain('Select at least one team member')
    expect(
      projectDetailsSchema.safeParse({
        ...completeProjectDetails,
        options: ['Unknown role'],
      }).success,
    ).toBe(false)
  })
})
