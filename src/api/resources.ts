import { ApiError } from './ApiError'
import { apiClient } from './client'
import type { paths } from './schema'
import type {
  BasicInfo,
  ListResourcesParams,
  ProjectDetails,
  Resource,
  ResourceList,
  ResourcePayload,
} from './types'

type JsonBody<Op> = Op extends {
  requestBody: { content: { 'application/json': infer B } }
}
  ? B
  : never

// Our form types allow '' for a not-yet-chosen priority, which the generated
// enum does not; the backend validates the real value, so we cast at the edge.
type BasicInfoBody = JsonBody<paths['/api/resources/{id}/basic-info']['patch']>
type ResourceBody = JsonBody<paths['/api/resources/{id}']['put']>

type ErrorBody = { message?: string; details?: unknown } | undefined

/**
 * Unwraps an openapi-fetch result: returns `data` or throws a typed `ApiError`.
 * openapi-fetch resolves (does not throw) on HTTP errors, so we normalise here.
 */
const unwrap = <T>(result: {
  data?: T
  error?: unknown
  response: Response
}): T => {
  if (result.error !== undefined || result.data === undefined) {
    const body = result.error as ErrorBody
    throw new ApiError(
      result.response.status,
      body?.message ?? `Request failed (${result.response.status})`,
      body?.details,
    )
  }
  return result.data
}

// The generated types mark every field optional; the backend always returns
// the full shape, so we narrow the response types here, in one place.
export const listResources = async (
  params: ListResourcesParams = {},
): Promise<ResourceList> =>
  unwrap(
    await apiClient.GET('/api/resources', { params: { query: params } }),
  ) as ResourceList

export const getResource = async (id: string | number): Promise<Resource> =>
  unwrap(
    await apiClient.GET('/api/resources/{id}', {
      params: { path: { id: String(id) } },
    }),
  ) as Resource

export const createResource = async (resourceName: string): Promise<Resource> =>
  unwrap(
    await apiClient.POST('/api/resources', { body: { resourceName } }),
  ) as Resource

export const deleteResource = async (id: string | number): Promise<Resource> =>
  unwrap(
    await apiClient.DELETE('/api/resources/{id}', {
      params: { path: { id: String(id) } },
    }),
  ) as Resource

export const patchBasicInfo = async (
  id: string | number,
  body: BasicInfo,
): Promise<Resource> =>
  unwrap(
    await apiClient.PATCH('/api/resources/{id}/basic-info', {
      params: { path: { id: String(id) } },
      body: body as BasicInfoBody,
    }),
  ) as Resource

export const patchProjectDetails = async (
  id: string | number,
  body: ProjectDetails,
): Promise<Resource> =>
  unwrap(
    await apiClient.PATCH('/api/resources/{id}/project-details', {
      params: { path: { id: String(id) } },
      body,
    }),
  ) as Resource

/** Draft -> completed. The only call that changes status. */
export const provisionResource = async (
  id: string | number,
): Promise<Resource> => {
  const data = unwrap(
    await apiClient.PATCH('/api/resources/{id}/provisioning', {
      params: { path: { id: String(id) } },
    }),
  )
  // Spec: either a Resource, or `{ message, resource }` (already completed).
  return ('resource' in data && data.resource
    ? data.resource
    : data) as Resource
}

/** Persists a completed resource's buffered edits (full replace). */
export const replaceResource = async (
  id: string | number,
  body: ResourcePayload,
): Promise<Resource> =>
  unwrap(
    await apiClient.PUT('/api/resources/{id}', {
      params: { path: { id: String(id) } },
      body: body as ResourceBody,
    }),
  ) as Resource
