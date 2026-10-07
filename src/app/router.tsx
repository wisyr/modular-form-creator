import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { RouteErrorPage } from '../components/RouteErrorPage'
import { BasicInfoPage } from '../pages/BasicInfoPage/BasicInfoPage'
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage'
import { ProjectDetailsPage } from '../pages/ProjectDetailsPage/ProjectDetailsPage'
import { ResourceDetailsPage } from '../pages/ResourceDetailsPage/ResourceDetailsPage'
import { ResourceOverviewPage } from '../pages/ResourceOverviewPage/ResourceOverviewPage'
import { ResourcesPage } from '../pages/ResourcesPage/ResourcesPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        // Pathless route: render errors in any page below land on
        // RouteErrorPage while the layout (skip link, unsaved-edits guard) stays.
        errorElement: <RouteErrorPage />,
        children: [
          { path: '/', element: <Navigate to="/resources" replace /> },
          { path: '/resources', element: <ResourcesPage /> },
          { path: '/resources/:resourceId', element: <ResourceOverviewPage /> },
          {
            path: '/resources/:resourceId/details',
            element: <ResourceDetailsPage />,
          },
          {
            path: '/resources/:resourceId/basic-info',
            element: <BasicInfoPage />,
          },
          {
            path: '/resources/:resourceId/project-details',
            element: <ProjectDetailsPage />,
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
