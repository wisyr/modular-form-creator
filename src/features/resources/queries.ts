import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import * as api from '../../api/resources'
import type { ListResourcesParams, Resource } from '../../api/types'
import { useEditBuffer } from './editBuffer'

export const resourceKeys = {
  all: ['resources'] as const,
  list: (params: ListResourcesParams) =>
    [...resourceKeys.all, 'list', params] as const,
  detail: (id: string) => [...resourceKeys.all, 'detail', id] as const,
}

export const useResources = (params: ListResourcesParams) =>
  useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => api.listResources(params),
    placeholderData: keepPreviousData,
  })

export const useResource = (id: string) =>
  useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => api.getResource(id),
  })

/** Writes the fresh server copy into the cache and refreshes list views. */
const useSyncResource = () => {
  const queryClient = useQueryClient()
  return (resource: Resource) => {
    queryClient.setQueryData(resourceKeys.detail(String(resource.resourceId)), resource)
    void queryClient.invalidateQueries({
      queryKey: [...resourceKeys.all, 'list'],
    })
  }
}

export const useCreateResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createResource,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...resourceKeys.all, 'list'] }),
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()
  const discard = useEditBuffer((s) => s.discard)
  return useMutation({
    mutationFn: (id: string) => api.deleteResource(id),
    onSuccess: (_data, id) => {
      discard(id)
      queryClient.removeQueries({ queryKey: resourceKeys.detail(id) })
      return queryClient.invalidateQueries({
        queryKey: [...resourceKeys.all, 'list'],
      })
    },
  })
}

export const useUpdateBasicInfo = (id: string) => {
  const sync = useSyncResource()
  return useMutation({
    mutationFn: (body: Parameters<typeof api.patchBasicInfo>[1]) =>
      api.patchBasicInfo(id, body),
    onSuccess: sync,
  })
}

export const useUpdateProjectDetails = (id: string) => {
  const sync = useSyncResource()
  return useMutation({
    mutationFn: (body: Parameters<typeof api.patchProjectDetails>[1]) =>
      api.patchProjectDetails(id, body),
    onSuccess: sync,
  })
}

export const useProvisionResource = (id: string) => {
  const sync = useSyncResource()
  return useMutation({
    mutationFn: () => api.provisionResource(id),
    onSuccess: sync,
  })
}

/** Submits the buffered edits of a completed resource (PUT) and clears the buffer. */
export const useReplaceResource = (id: string) => {
  const sync = useSyncResource()
  const discard = useEditBuffer((s) => s.discard)
  return useMutation({
    mutationFn: (body: Parameters<typeof api.replaceResource>[1]) =>
      api.replaceResource(id, body),
    onSuccess: (resource) => {
      sync(resource)
      discard(id)
    },
  })
}
