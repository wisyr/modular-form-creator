import { useMemo } from 'react'
import { create } from 'zustand'
import type { BasicInfo, ProjectDetails, Resource } from '../../api/types'

/**
 * Temporary edits for COMPLETED resources, keyed by resource id.
 * Deliberately in-memory only (no persist middleware): a refresh or closing
 * the tab drops the buffer, as the business rules require.
 */
export interface EditBuffer {
  basicInfo?: BasicInfo
  projectDetails?: ProjectDetails
}

interface EditBufferState {
  buffers: Record<string, EditBuffer>
  setBasicInfo: (id: string, value: BasicInfo) => void
  setProjectDetails: (id: string, value: ProjectDetails) => void
  /** Drop the buffer after a successful PUT, a discard, or a delete. */
  discard: (id: string) => void
}

export const useEditBuffer = create<EditBufferState>()((set) => ({
  buffers: {},
  setBasicInfo: (id, value) =>
    set((s) => ({
      buffers: { ...s.buffers, [id]: { ...s.buffers[id], basicInfo: value } },
    })),
  setProjectDetails: (id, value) =>
    set((s) => ({
      buffers: {
        ...s.buffers,
        [id]: { ...s.buffers[id], projectDetails: value },
      },
    })),
  discard: (id) =>
    set((s) => {
      const rest = { ...s.buffers }
      delete rest[id]
      return { buffers: rest }
    }),
}))

/** The resource as the user currently sees it: server data plus any buffered edits. */
export const applyBuffer = (
  resource: Resource,
  buffer: EditBuffer | undefined,
): Resource =>
  buffer
    ? {
        ...resource,
        basicInfo: buffer.basicInfo ?? resource.basicInfo,
        projectDetails: buffer.projectDetails ?? resource.projectDetails,
      }
    : resource

export const useResourceBuffer = (id: string): EditBuffer | undefined =>
  useEditBuffer((s) => s.buffers[id])

/** Server resource merged with its buffered edits (what the Details page shows). */
export const useEffectiveResource = (resource: Resource): Resource => {
  const buffer = useResourceBuffer(String(resource.resourceId))
  return useMemo(() => applyBuffer(resource, buffer), [resource, buffer])
}
