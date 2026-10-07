import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getErrorMessage } from '../../api/ApiError'
import type { Resource } from '../../api/types'
import { DangerButton, LinkButton } from '../../components/LinkButton'
import { StatusBadge } from '../../components/StatusBadge'
import {
  Actions,
  Banner,
  FlushText,
  Muted,
  PageHeader,
  Row,
  Stack,
  TightStack,
} from '../../components/ui'
import { Button, Card, Input } from '../../design-system'
import {
  useCreateResource,
  useDeleteResource,
} from '../../features/resources/queries'
import { completedModuleCount } from '../../features/resources/rules'
import { resourceNameSchema } from '../../features/resources/schemas'

export const ResourceRow = ({
  resource,
  onDelete,
}: {
  resource: Resource
  onDelete: () => void
}) => {
  const id = resource.resourceId
  return (
    <Card variant="outline">
      <PageHeader>
        <TightStack>
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
        </TightStack>
        <Actions>
          <LinkButton
            $variant="primary"
            to={`/resources/${id}`}
            aria-label={`Open ${resource.name}`}
          >
            Open
          </LinkButton>
          <LinkButton
            to={`/resources/${id}/details`}
            aria-label={`View details of ${resource.name}`}
          >
            Details
          </LinkButton>
          <DangerButton
            type="button"
            size="small"
            variant="ghost"
            onClick={onDelete}
            aria-label={`Delete ${resource.name}`}
          >
            Delete
          </DangerButton>
        </Actions>
      </PageHeader>
    </Card>
  )
}

const createSchema = z.object({ resourceName: resourceNameSchema })

type CreateValues = z.infer<typeof createSchema>

export const CreateForm = ({ onDone }: { onDone: () => void }) => {
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

export const DeleteConfirm = ({
  resource,
  onDone,
}: {
  resource: Resource
  onDone: () => void
}) => {
  const remove = useDeleteResource()
  return (
    <Stack>
      <FlushText>
        Delete <strong>{resource.name}</strong>? This cannot be undone.
      </FlushText>
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
        <Button type="button" variant="ghost" onClick={onDone} autoFocus>
          Cancel
        </Button>
      </Row>
    </Stack>
  )
}
