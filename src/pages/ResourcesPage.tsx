import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { getErrorMessage } from '../api/ApiError'
import type { ListResourcesParams, Resource, ResourceStatus, SortOrder } from '../api/types'
import { ErrorState, LoadingState } from '../components/PageState'
import { StatusBadge } from '../components/StatusBadge'
import { Banner, Muted, Page, PageHeader, Row, Stack, Subtitle, Title } from '../components/ui'
import { Button, Card, Drawer, Input, Select } from '../design-system'
import {
  useCreateResource,
  useDeleteResource,
  useResources,
} from '../features/resources/queries'
import { completedModuleCount } from '../features/resources/rules'
import { resourceNameSchema } from '../features/resources/schemas'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]
const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
]

/** Filters live in the URL so the view is shareable and survives reloads. */
function useListParams() {
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

export function ResourcesPage() {
  const { params, update } = useListParams()
  const { data, error, isPending, isFetching, refetch } = useResources(params)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Resource | null>(null)

  // Debounce the name filter; the input is uncontrolled by the URL while typing.
  const [search, setSearch] = useState(params.name ?? '')
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (params.name ?? '')) {
        update({ name: search.trim() || undefined, page: undefined })
      }
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const pagination = data?.pagination

  return (
    <Page>
      <PageHeader>
        <Stack style={{ gap: 4 }}>
          <Title>Resources</Title>
          <Subtitle>Create resources and track their module progress.</Subtitle>
        </Stack>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Create resource
        </Button>
      </PageHeader>

      <Row>
        <Input
          aria-label="Search by name"
          placeholder="Search by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
          value={params.status ?? ''}
          onChange={(event) =>
            update({ status: event.target.value || undefined, page: undefined })
          }
        />
        <Select
          aria-label="Sort order"
          options={SORT_OPTIONS}
          value={params.sortOrder}
          onChange={(event) =>
            update({
              sort: (event.target.value as SortOrder) === 'asc' ? 'asc' : undefined,
              page: undefined,
            })
          }
        />
      </Row>

      {isPending ? <LoadingState label="Loading resources…" /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}

      {data && data.items.length === 0 ? (
        <Banner>
          {params.name || params.status
            ? 'No resources match your filters.'
            : 'No resources yet. Create your first one.'}
        </Banner>
      ) : null}

      {data?.items.map((resource) => (
        <ResourceRow
          key={resource._id}
          resource={resource}
          onDelete={() => setToDelete(resource)}
        />
      ))}

      {pagination && pagination.totalPages > 1 ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <Button
            type="button"
            variant="secondary"
            state={pagination.page <= 1 ? 'disabled' : 'normal'}
            onClick={() => update({ page: String(pagination.page - 1) })}
          >
            Previous
          </Button>
          <Muted>
            Page {pagination.page} of {pagination.totalPages} ·{' '}
            {pagination.totalItems} resources {isFetching ? '· updating…' : ''}
          </Muted>
          <Button
            type="button"
            variant="secondary"
            state={pagination.page >= pagination.totalPages ? 'disabled' : 'normal'}
            onClick={() => update({ page: String(pagination.page + 1) })}
          >
            Next
          </Button>
        </Row>
      ) : null}

      <Drawer
        title="Create resource"
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      >
        {isCreateOpen ? <CreateForm onDone={() => setCreateOpen(false)} /> : null}
      </Drawer>

      <Drawer
        title="Delete resource"
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
      >
        {toDelete ? (
          <DeleteConfirm resource={toDelete} onDone={() => setToDelete(null)} />
        ) : null}
      </Drawer>
    </Page>
  )
}

function ResourceRow({
  resource,
  onDelete,
}: {
  resource: Resource
  onDelete: () => void
}) {
  const id = resource.resourceId
  return (
    <Card variant="outline">
      <PageHeader>
        <Stack style={{ gap: 4 }}>
          <Row>
            <Link to={`/resources/${id}`}>
              <strong>{resource.name}</strong>
            </Link>
            <StatusBadge status={resource.status} />
          </Row>
          <Muted>
            #{id} · {completedModuleCount(resource)} of 2 modules complete ·
            created {new Date(resource.createdAt).toLocaleDateString()}
          </Muted>
        </Stack>
        <Row>
          <Link to={`/resources/${id}`}>Open</Link>
          <Link to={`/resources/${id}/details`}>Details</Link>
          <Button type="button" size="small" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        </Row>
      </PageHeader>
    </Card>
  )
}

const createSchema = z.object({ resourceName: resourceNameSchema })
type CreateValues = z.infer<typeof createSchema>

function CreateForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate()
  const create = useCreateResource()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateValues>({ resolver: zodResolver(createSchema) })

  const onSubmit = ({ resourceName }: CreateValues) =>
    create.mutate(resourceName, {
      onSuccess: (resource) => {
        onDone()
        navigate(`/resources/${resource.resourceId}`)
      },
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <Input
          label="Resource name"
          helperText="Letters, numbers, spaces and hyphens. Cannot be changed later."
          autoFocus
          error={errors.resourceName?.message}
          {...register('resourceName')}
        />
        {create.isError ? (
          <Banner $tone="error" role="alert">
            {getErrorMessage(create.error)}
          </Banner>
        ) : null}
        <Button type="submit" state={create.isPending ? 'disabled' : 'normal'}>
          {create.isPending ? 'Creating…' : 'Create'}
        </Button>
      </Stack>
    </form>
  )
}

function DeleteConfirm({
  resource,
  onDone,
}: {
  resource: Resource
  onDone: () => void
}) {
  const remove = useDeleteResource()
  return (
    <Stack>
      <p style={{ margin: 0 }}>
        Delete <strong>{resource.name}</strong>? This cannot be undone.
      </p>
      {remove.isError ? (
        <Banner $tone="error" role="alert">
          {getErrorMessage(remove.error)}
        </Banner>
      ) : null}
      <Row>
        <Button
          type="button"
          state={remove.isPending ? 'disabled' : 'normal'}
          onClick={() =>
            remove.mutate(String(resource.resourceId), { onSuccess: onDone })
          }
        >
          {remove.isPending ? 'Deleting…' : 'Delete'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </Row>
    </Stack>
  )
}
