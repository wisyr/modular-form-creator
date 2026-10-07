import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/PageState'
import { Page } from '../../components/ui'
import { useResource } from '../../features/resources/queries'
import { Details } from './ResourceDetailsPage.components'

export const ResourceDetailsPage = () => {
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
