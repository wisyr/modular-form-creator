import { Link, useParams } from 'react-router-dom'
import type { Resource } from '../api/types'
import { ErrorState, LoadingState } from '../components/PageState'
import { StatusBadge } from '../components/StatusBadge'
import {
  Banner,
  DefinitionList,
  Page,
  PageHeader,
  Subtitle,
  Title,
} from '../components/ui'
import { Card } from '../design-system'
import { useHasBufferedEdits } from '../features/resources/editBuffer'
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

function Details({ resource }: { resource: Resource }) {
  const hasUnsaved = useHasBufferedEdits(String(resource.resourceId))
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

      {hasUnsaved ? (
        <Banner $tone="warning">
          This page shows saved data. You have unsaved changes that are not
          included here.
        </Banner>
      ) : null}

      <Card variant="outline">
        <h2 style={{ marginTop: 0 }}>Basic Info</h2>
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
        <h2 style={{ marginTop: 0 }}>Project Details</h2>
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
