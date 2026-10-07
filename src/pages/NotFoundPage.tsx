import { Link } from 'react-router-dom'
import { Page, Subtitle, Title } from '../components/ui'

export function NotFoundPage() {
  return (
    <Page>
      <Title>Page not found</Title>
      <Subtitle>
        <Link to="/resources">Go to resources</Link>
      </Subtitle>
    </Page>
  )
}
