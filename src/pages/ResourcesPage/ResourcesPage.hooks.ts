import { useSearchParams } from 'react-router-dom'
import type { ListResourcesParams, ResourceStatus } from '../../api/types'
import { PAGE_SIZE } from './ResourcesPage.constants'

/** Filters live in the URL so the view is shareable and survives reloads. */
export const useListParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status')
  const params: ListResourcesParams = {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    pageSize: PAGE_SIZE,
    name: searchParams.get('name') || undefined,
    status:
      status === 'draft' || status === 'completed'
        ? (status as ResourceStatus)
        : undefined,
    sortOrder: searchParams.get('sort') === 'asc' ? 'asc' : 'desc',
  }

  const update = (changes: Record<string, string | undefined>) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      return next
    })

  return { params, update }
}
