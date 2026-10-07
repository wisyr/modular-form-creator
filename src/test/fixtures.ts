import type {
  BasicInfo,
  ProjectDetails,
  Resource,
} from '../api/types'

export const completeBasicInfo: BasicInfo = {
  resourceName: 'Alpha',
  owner: 'John Smith',
  email: 'john@example.com',
  description: 'A test resource',
  priority: 'high',
}

export const completeProjectDetails: ProjectDetails = {
  projectName: 'Project X',
  budget: '5000',
  category: 'internal',
  options: ['FE devs', 'Designer'],
}

export const emptyBasicInfo: BasicInfo = {
  resourceName: 'Alpha',
  owner: '',
  email: '',
  description: '',
  priority: '',
}

export const emptyProjectDetails: ProjectDetails = {
  projectName: '',
  budget: '',
  category: '',
  options: [],
}

/** A fresh draft (what the backend returns right after creation). */
export const makeResource = (overrides: Partial<Resource> = {}): Resource => ({
  _id: 'abc123',
  resourceId: 2,
  name: 'Alpha',
  status: 'draft',
  basicInfo: emptyBasicInfo,
  projectDetails: emptyProjectDetails,
  createdAt: '2026-10-07T10:00:00.000Z',
  updatedAt: '2026-10-07T10:00:00.000Z',
  ...overrides,
})

export const makeCompletedResource = (
  overrides: Partial<Resource> = {},
): Resource =>
  makeResource({
    status: 'completed',
    basicInfo: completeBasicInfo,
    projectDetails: completeProjectDetails,
    ...overrides,
  })
