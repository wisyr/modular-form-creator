import { z } from 'zod'

/**
 * Validation rules mirrored from the backend (resource.service.ts) so the
 * forms reject exactly what the API would reject.
 */
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const CATEGORIES = ['internal', 'external', 'vendor'] as const
export const TEAM_MEMBERS = [
  'FE devs',
  'BE devs',
  'Designer',
  'Data Eng',
  'Product Owner',
] as const

const NAME_REGEX = /^[A-Za-z0-9 -]+$/
const OWNER_REGEX = /^[A-Za-z ]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INTEGER_REGEX = /^\d+$/

const trimmed = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const resourceNameSchema = trimmed('Resource name')
  .max(255, 'Resource name must be at most 255 characters long')
  .regex(
    NAME_REGEX,
    'Resource name can contain only letters, numbers, spaces, and hyphens',
  )

export const basicInfoSchema = z.object({
  resourceName: resourceNameSchema,
  owner: trimmed('Owner')
    .max(255, 'Owner must be at most 255 characters long')
    .regex(OWNER_REGEX, 'Owner can contain only letters and spaces'),
  email: trimmed('Email').regex(EMAIL_REGEX, 'Enter a valid email address'),
  description: trimmed('Description').max(
    1000,
    'Description must be at most 1000 characters long',
  ),
  priority: z.enum(PRIORITIES, { error: 'Select a priority' }),
})

export const projectDetailsSchema = z.object({
  projectName: trimmed('Project name')
    .max(255, 'Project name must be at most 255 characters long')
    .regex(
      NAME_REGEX,
      'Project name can contain only letters, numbers, spaces, and hyphens',
    ),
  budget: trimmed('Budget').regex(
    INTEGER_REGEX,
    'Budget must contain only digits',
  ),
  category: z.enum(CATEGORIES, { error: 'Select a category' }),
  options: z
    .array(z.enum(TEAM_MEMBERS))
    .min(1, 'Select at least one team member'),
})

export type BasicInfoValues = z.input<typeof basicInfoSchema>
export type ProjectDetailsValues = z.input<typeof projectDetailsSchema>

/** The resource name is locked after creation, so the Basic Info form omits it. */
export const basicInfoFormSchema = basicInfoSchema.omit({ resourceName: true })

export type BasicInfoFormValues = z.input<typeof basicInfoFormSchema>
export type BasicInfoFormOutput = z.output<typeof basicInfoFormSchema>
export type ProjectDetailsOutput = z.output<typeof projectDetailsSchema>
