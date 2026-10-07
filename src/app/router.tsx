import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { BasicInfoPage } from '../pages/BasicInfoPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProjectDetailsPage } from '../pages/ProjectDetailsPage'
import { ResourceDetailsPage } from '../pages/ResourceDetailsPage'
import { ResourceOverviewPage } from '../pages/ResourceOverviewPage'
import { ResourcesPage } from '../pages/ResourcesPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
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
])
