import type { BasicInfo, ProjectDetails, Resource } from '../../api/types'

/** Business rules in one place; pages and hooks only ask these functions. */

/**
 * "Complete" mirrors the backend exactly (resource.service.ts): a module is
 * complete when all of its fields are filled in. Format validation belongs to
 * the forms (see schemas.ts); the backend rejects invalid values on write.
 */
export const isBasicInfoComplete = (basicInfo: BasicInfo): boolean =>
  Boolean(
    basicInfo.resourceName &&
      basicInfo.owner &&
      basicInfo.email &&
      basicInfo.description &&
      basicInfo.priority,
  )

export const isProjectDetailsComplete = (
  projectDetails: ProjectDetails,
): boolean =>
  Boolean(
    projectDetails.projectName &&
      projectDetails.budget &&
      projectDetails.category &&
      projectDetails.options.length > 0,
  )

export const isCompleted = (resource: Resource): boolean =>
  resource.status === 'completed'

/** Project Details unlock only once Basic Info is complete (draft resources). */
export const canEditProjectDetails = (resource: Resource): boolean =>
  isCompleted(resource) || isBasicInfoComplete(resource.basicInfo)

/** Provisioning: draft only, and only when both modules are complete. */
export const canProvision = (resource: Resource): boolean =>
  !isCompleted(resource) &&
  isBasicInfoComplete(resource.basicInfo) &&
  isProjectDetailsComplete(resource.projectDetails)

export const completedModuleCount = (resource: Resource): number =>
  Number(isBasicInfoComplete(resource.basicInfo)) +
  Number(isProjectDetailsComplete(resource.projectDetails))
