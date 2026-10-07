import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { getErrorMessage } from '../api/ApiError'
import { Button } from '../design-system'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { LinkButton } from './LinkButton'
import { Banner, Page, Row, Stack, Subtitle, Title } from './ui'

/**
 * Route-level error boundary (React Router `errorElement`): catches render
 * errors and thrown responses in any page, so one broken view never blanks the
 * whole app.
 */
export const RouteErrorPage = () => {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  const heading = notFound ? 'Page not found' : 'Something went wrong'
  useDocumentTitle(heading)

  return (
    <Page>
      <Stack>
        <Title>{heading}</Title>
        {notFound ? (
          <Subtitle>The page you are looking for does not exist.</Subtitle>
        ) : (
          <Banner $tone="error" role="alert">
            {getErrorMessage(error)}
          </Banner>
        )}
        <Row>
          {notFound ? null : (
            <Button type="button" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          )}
          <LinkButton $variant="secondary" to="/resources">
            Go to resources
          </LinkButton>
        </Row>
      </Stack>
    </Page>
  )
}
