import type { components } from './schema'

type Schemas = components['schemas']

export type ResourceStatus = Schemas['ResourceStatus']
export type Priority = NonNullable<Schemas['BasicInfo']['priority']>

/**
 * The OpenAPI spec marks every field as optional, but the backend always
 * returns them (empty strings / arrays for a fresh draft). The app-level types
 * below are the stricter shapes the UI relies on.
 * Note: a fresh draft has `priority: ''` and `category: ''`.
 */
export interface BasicInfo {
  resourceName: string
  owner: string
  email: string
  description: string
  priority: Priority | ''
}

export interface ProjectDetails {
  projectName: string
  budget: string
  category: string
  options: string[]
}

export interface Resource {
  _id: string
  resourceId: number
  name: string
  status: ResourceStatus
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ResourceList {
  items: Resource[]
  pagination: Pagination
}

export type SortOrder = 'asc' | 'desc'

export interface ListResourcesParams {
  page?: number
  pageSize?: number
  status?: ResourceStatus
  name?: string
  sortOrder?: SortOrder
}

/** Body of `PUT /api/resources/{id}` (completed resources only). */
export interface ResourcePayload {
  name: string
  basicInfo: BasicInfo
  projectDetails: ProjectDetails
}
