import { Link, useParams } from 'react-router-dom'
import { ErrorState, LoadingState } from '../../components/PageState'
import { Page, PageHeader, Title } from '../../components/ui'
import { BasicInfoForm } from '../../features/resources/BasicInfoForm'
import { useResource } from '../../features/resources/queries'

export const BasicInfoPage = () => {
  const { resourceId = '' } = useParams()
  const { data: resource, error, isPending, refetch } = useResource(resourceId)

  return (
    <Page>
      <PageHeader>
        <Title>Basic Info</Title>
        <Link to={`/resources/${resourceId}`}>Back to overview</Link>
      </PageHeader>
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
      {resource ? <BasicInfoForm resource={resource} /> : null}
    </Page>
  )
}
