import { Link, useParams } from 'react-router-dom'
import type { Resource } from '../api/types'
import { ErrorState, LoadingState } from '../components/PageState'
import { StatusBadge } from '../components/StatusBadge'
import {
  Banner,
  DefinitionList,
  Page,
  PageHeader,
  SectionTitle,
  Subtitle,
  Title,
} from '../components/ui'
import { Badge, Card } from '../design-system'
import {
  useEffectiveResource,
  useResourceBuffer,
} from '../features/resources/editBuffer'
import { useResource } from '../features/resources/queries'
import { completedModuleCount } from '../features/resources/rules'

const orDash = (value: string) => value || '—'

export function ResourceDetailsPage() {
  const { resourceId = '' } = useParams()
  const { data: resource, error, isPending, refetch } = useResource(resourceId)

  return (
    <Page>
      <Link to={`/resources/${resourceId}`}>← Back to overview</Link>
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {resource ? <Details resource={resource} /> : null}
    </Page>
  )
}

function Details({ resource: savedResource }: { resource: Resource }) {
  // Show what the user is about to save: server data plus buffered edits.
  const resource = useEffectiveResource(savedResource)
  const buffer = useResourceBuffer(String(savedResource.resourceId))
  const { basicInfo, projectDetails } = resource

  return (
    <>
      <PageHeader>
        <div>
          <Title>{resource.name}</Title>
          <Subtitle>
            Resource #{resource.resourceId} · {completedModuleCount(resource)}{' '}
            of 2 modules complete
          </Subtitle>
        </div>
        <StatusBadge status={resource.status} />
      </PageHeader>

      {buffer ? (
        <Banner $tone="warning">
          This page includes your unsaved changes. Submit them from the
          overview page to save them.
        </Banner>
      ) : null}

      <Card variant="outline">
        <SectionTitle>
          Basic Info{' '}
          {buffer?.basicInfo ? <Badge variant="warning">Unsaved changes</Badge> : null}
        </SectionTitle>
        <DefinitionList>
          <dt>Resource name</dt>
          <dd>{orDash(basicInfo.resourceName)}</dd>
          <dt>Owner</dt>
          <dd>{orDash(basicInfo.owner)}</dd>
          <dt>Email</dt>
          <dd>{orDash(basicInfo.email)}</dd>
          <dt>Description</dt>
          <dd>{orDash(basicInfo.description)}</dd>
          <dt>Priority</dt>
          <dd>{orDash(basicInfo.priority)}</dd>
        </DefinitionList>
      </Card>

      <Card variant="outline">
        <SectionTitle>
          Project Details{' '}
          {buffer?.projectDetails ? (
            <Badge variant="warning">Unsaved changes</Badge>
          ) : null}
        </SectionTitle>
        <DefinitionList>
          <dt>Project name</dt>
          <dd>{orDash(projectDetails.projectName)}</dd>
          <dt>Budget</dt>
          <dd>{orDash(projectDetails.budget)}</dd>
          <dt>Category</dt>
          <dd>{orDash(projectDetails.category)}</dd>
          <dt>Team members</dt>
          <dd>
            {projectDetails.options.length
              ? projectDetails.options.join(', ')
              : '—'}
          </dd>
        </DefinitionList>
      </Card>
    </>
  )
}
