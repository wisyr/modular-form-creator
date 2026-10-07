import { useEffect, useRef, useState } from 'react'
import type { Resource, SortOrder } from '../../api/types'
import { ErrorState, LoadingState } from '../../components/PageState'
import {
  Banner,
  Muted,
  Page,
  PageHeader,
  Row,
  SpreadRow,
  Subtitle,
  TightStack,
  Title,
} from '../../components/ui'
import { SelectField } from '../../components/SelectField'
import { Button, Drawer, Input } from '../../design-system'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useResources } from '../../features/resources/queries'
import { SORT_OPTIONS, STATUS_OPTIONS } from './ResourcesPage.constants'
import { useListParams, useReturnFocus } from './ResourcesPage.hooks'
import {
  CreateForm,
  DeleteConfirm,
  ResourceRow,
} from './ResourcesPage.components'

export const ResourcesPage = () => {
  useDocumentTitle('Resources')
  const { params, update } = useListParams()
  const { data, error, isPending, isFetching, refetch } = useResources(params)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Resource | null>(null)
  const returnFocus = useReturnFocus()

  const openCreate = () => {
    returnFocus.remember()
    setCreateOpen(true)
  }
  const closeCreate = () => {
    setCreateOpen(false)
    returnFocus.restore()
  }
  const openDelete = (resource: Resource) => {
    returnFocus.remember()
    setToDelete(resource)
  }
  const closeDelete = () => {
    setToDelete(null)
    returnFocus.restore()
  }

  // Debounce the name filter: the input stays responsive while the URL (and
  // therefore the request) updates 300 ms after the user stops typing.
  const [search, setSearch] = useState(params.name ?? '')
  const searchTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(searchTimer.current), [])

  const onSearchChange = (value: string) => {
    setSearch(value)
    window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(
      () => update({ name: value.trim() || undefined, page: undefined }),
      300,
    )
  }

  const pagination = data?.pagination

  return (
    <Page>
      <PageHeader>
        <TightStack>
          <Title>Resources</Title>
          <Subtitle>Create resources and track their module progress.</Subtitle>
        </TightStack>
        <Button type="button" onClick={openCreate}>
          Create resource
        </Button>
      </PageHeader>

      <Row>
        <Input
          aria-label="Search by name"
          placeholder="Search by name"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <SelectField
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
          value={params.status ?? ''}
          onChange={(event) =>
            update({ status: event.target.value || undefined, page: undefined })
          }
        />
        <SelectField
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
          onDelete={() => openDelete(resource)}
        />
      ))}

      {pagination && pagination.totalPages > 1 ? (
        <SpreadRow>
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
        </SpreadRow>
      ) : null}

      <Drawer
        title="Create resource"
        isOpen={isCreateOpen}
        onClose={closeCreate}
      >
        {isCreateOpen ? <CreateForm onDone={closeCreate} /> : null}
      </Drawer>

      <Drawer
        title="Delete resource"
        isOpen={toDelete !== null}
        onClose={closeDelete}
      >
        {toDelete ? (
          <DeleteConfirm resource={toDelete} onDone={closeDelete} />
        ) : null}
      </Drawer>
    </Page>
  )
}
