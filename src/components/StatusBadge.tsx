import type { ResourceStatus } from '../api/types'
import { Badge } from '../design-system'

export const StatusBadge = ({ status }: { status: ResourceStatus }) => {
  return (
    <Badge variant={status === 'completed' ? 'success' : 'warning'}>
      {status === 'completed' ? 'Completed' : 'Draft'}
    </Badge>
  )
}
