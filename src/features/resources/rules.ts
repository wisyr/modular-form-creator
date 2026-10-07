import type { BasicInfo, ProjectDetails, Resource } from '../../api/types'
import { basicInfoSchema, projectDetailsSchema } from './schemas'

/** Business rules in one place; pages and hooks only ask these functions. */

export const isBasicInfoComplete = (basicInfo: BasicInfo): boolean =>
  basicInfoSchema.safeParse(basicInfo).success

export const isProjectDetailsComplete = (
  projectDetails: ProjectDetails,
): boolean => projectDetailsSchema.safeParse(projectDetails).success

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
