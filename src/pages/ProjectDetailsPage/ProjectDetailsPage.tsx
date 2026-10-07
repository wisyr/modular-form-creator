import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/PageState'
import { Banner, Page, PageHeader, Title } from '../../components/ui'
import { ProjectDetailsForm } from '../../features/resources/ProjectDetailsForm'
import { useResource } from '../../features/resources/queries'
import { canEditProjectDetails } from '../../features/resources/rules'

export const ProjectDetailsPage = () => {
  const { resourceId = '' } = useParams()
  const { data: resource, error, isPending, refetch } = useResource(resourceId)
  useDocumentTitle(
    resource ? `Project Details · ${resource.name}` : 'Project Details',
  )

  return (
    <Page>
      <PageHeader>
        <Title>Project Details</Title>
        <Link to={`/resources/${resourceId}`}>Back to overview</Link>
      </PageHeader>
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {resource && !canEditProjectDetails(resource) ? (
        <Banner $tone="warning" role="alert">
          Complete Basic Info first. Project Details unlock once Basic Info is
          complete.{' '}
          <Link to={`/resources/${resourceId}/basic-info`}>Go to Basic Info</Link>
        </Banner>
      ) : null}
      {resource && canEditProjectDetails(resource) ? (
        <ProjectDetailsForm resource={resource} />
      ) : null}
    </Page>
  )
}
