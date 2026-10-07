import type { Resource } from '../../api/types'
import { StatusBadge } from '../../components/StatusBadge'
import {
  Banner,
  DefinitionList,
  PageHeader,
  SectionTitle,
  Subtitle,
  Title,
} from '../../components/ui'
import { Badge, Card } from '../../design-system'
import {
  useEffectiveResource,
  useResourceBuffer,
} from '../../features/resources/editBuffer'
import { completedModuleCount } from '../../features/resources/rules'

const orDash = (value: string) => value || '—'

export const Details = ({ resource: savedResource }: { resource: Resource }) => {
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
