import styled from 'styled-components'
import { Select } from '../design-system'

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%235e6c76' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"

/**
 * The design-system Select keeps the browser's native arrow, which sits flush
 * against the field's right edge. This wrapper (the design system itself is
 * untouched) hides the native arrow and draws a chevron with breathing room.
 */
export const SelectField = styled(Select)`
  && {
    appearance: none;
    background-image: ${chevron};
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 12px 8px;
    padding-right: 44px;
  }
`
