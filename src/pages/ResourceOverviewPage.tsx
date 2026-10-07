import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../api/ApiError'
import type { Resource } from '../api/types'
import { ErrorState, LoadingState } from '../components/PageState'
import { LinkButton } from '../components/LinkButton'
import { StatusBadge } from '../components/StatusBadge'
import {
  Banner,
  LeadText,
  Muted,
  Page,
  PageHeader,
  Row,
  Stack,
  Subtitle,
  TightStack,
  Title,
} from '../components/ui'
import { Badge, Button, Card } from '../design-system'
import { useEditBuffer } from '../features/resources/editBuffer'
import {
  useProvisionResource,
  useReplaceResource,
  useResource,
} from '../features/resources/queries'
import {
  canEditProjectDetails,
  canProvision,
  completedModuleCount,
  isBasicInfoComplete,
  isCompleted,
  isProjectDetailsComplete,
} from '../features/resources/rules'

export function ResourceOverviewPage() {
  const { resourceId = '' } = useParams()
  const { data: resource, error, isPending, refetch } = useResource(resourceId)

  return (
    <Page>
      <Link to="/resources">← All resources</Link>
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {resource ? <Overview resource={resource} /> : null}
    </Page>
  )
}

function Overview({ resource }: { resource: Resource }) {
  const id = String(resource.resourceId)
  const completed = isCompleted(resource)
  const buffer = useEditBuffer((s) => s.buffers[id])
  const discard = useEditBuffer((s) => s.discard)
  const provision = useProvisionResource(id)
  const replace = useReplaceResource(id)

  const basicDone = isBasicInfoComplete(resource.basicInfo)
  const projectDone = isProjectDetailsComplete(resource.projectDetails)
  const projectUnlocked = canEditProjectDetails(resource)

  const submitBufferedEdits = () =>
    replace.mutate({
      name: resource.name,
      basicInfo: buffer?.basicInfo ?? resource.basicInfo,
      projectDetails: buffer?.projectDetails ?? resource.projectDetails,
    })

  return (
    <>
      <PageHeader>
        <TightStack>
          <Title>{resource.name}</Title>
          <Subtitle>
            Resource #{resource.resourceId} ·{' '}
            {completedModuleCount(resource)} of 2 modules complete
          </Subtitle>
        </TightStack>
        <Row>
          <StatusBadge status={resource.status} />
          <LinkButton to={`/resources/${id}/details`}>View details</LinkButton>
        </Row>
      </PageHeader>

      {buffer ? (
        <Banner $tone="warning" role="status">
          <LeadText>
            You have unsaved changes. They exist only in this browser tab and
            will be lost if you refresh or close it.
          </LeadText>
          <Row>
            <Button
              type="button"
              state={replace.isPending ? 'disabled' : 'normal'}
              onClick={submitBufferedEdits}
            >
              {replace.isPending ? 'Submitting…' : 'Submit changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              state={replace.isPending ? 'disabled' : 'normal'}
              onClick={() => discard(id)}
            >
              Discard
            </Button>
          </Row>
        </Banner>
      ) : null}
      {replace.isError ? (
        <Banner $tone="error" role="alert">
          {getErrorMessage(replace.error)}
        </Banner>
      ) : null}

      <ModuleCard
        title="Basic Info"
        done={basicDone}
        unsaved={Boolean(buffer?.basicInfo)}
        to={`/resources/${id}/basic-info`}
        actionLabel={basicDone ? 'Edit' : 'Fill in'}
      />
      <ModuleCard
        title="Project Details"
        done={projectDone}
        unsaved={Boolean(buffer?.projectDetails)}
        to={`/resources/${id}/project-details`}
        actionLabel={projectDone ? 'Edit' : 'Fill in'}
        lockedReason={
          projectUnlocked ? undefined : 'Complete Basic Info to unlock.'
        }
      />

      <Card variant="outline">
        <Stack>
          <strong>Provisioning</strong>
          {completed ? (
            <Muted>This resource is completed and cannot be provisioned again.</Muted>
          ) : (
            <>
              <Muted>
                {canProvision(resource)
                  ? 'Both modules are complete. You can complete this resource.'
                  : 'Complete both modules to provision this resource.'}
              </Muted>
              {provision.isError ? (
                <Banner $tone="error" role="alert">
                  {getErrorMessage(provision.error)}
                </Banner>
              ) : null}
              <Row>
                <Button
                  type="button"
                  state={
                    canProvision(resource) && !provision.isPending
                      ? 'normal'
                      : 'disabled'
                  }
                  onClick={() => provision.mutate()}
                >
                  {provision.isPending ? 'Provisioning…' : 'Provision resource'}
                </Button>
              </Row>
            </>
          )}
        </Stack>
      </Card>
    </>
  )
}

interface ModuleCardProps {
  title: string
  done: boolean
  unsaved: boolean
  to: string
  actionLabel: string
  lockedReason?: string
}

function ModuleCard({
  title,
  done,
  unsaved,
  to,
  actionLabel,
  lockedReason,
}: ModuleCardProps) {
  return (
    <Card variant="outline">
      <PageHeader>
        <TightStack>
          <Row>
            <strong>{title}</strong>
            <Badge variant={done ? 'success' : 'neutral'}>
              {done ? 'Complete' : 'Incomplete'}
            </Badge>
            {unsaved ? <Badge variant="warning">Unsaved changes</Badge> : null}
          </Row>
          {lockedReason ? <Muted>{lockedReason}</Muted> : null}
        </TightStack>
        {lockedReason ? (
          <Button type="button" variant="secondary" state="locked">
            {actionLabel}
          </Button>
        ) : (
          <LinkButton to={to}>{actionLabel}</LinkButton>
        )}
      </PageHeader>
    </Card>
  )
}
