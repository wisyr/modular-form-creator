import { create } from 'zustand'
import type { BasicInfo, ProjectDetails } from '../../api/types'

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

/** True when this resource has unsaved buffered edits. */
export const useHasBufferedEdits = (id: string): boolean =>
  useEditBuffer((s) => Boolean(s.buffers[id]))
