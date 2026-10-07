import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Button } from '../design-system'

type Variant = 'primary' | 'secondary'

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border-color: transparent;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryStrong};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.inkStrong};
    border-color: ${({ theme }) => theme.colors.border};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primaryStrong};
    }
  `,
}

/**
 * A router link that looks like the design-system "small" Button (same tokens),
 * so navigation actions get proper button affordance while staying real links.
 */
export const LinkButton = styled(Link)<{ $variant?: Variant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  ${({ $variant = 'secondary' }) => variants[$variant]}
`

/** Ghost button tinted with the warning colour for destructive actions. */
export const DangerButton = styled(Button)`
  && {
    color: ${({ theme }) => theme.colors.warning};

    &:hover {
      border-color: ${({ theme }) => theme.colors.warning};
      color: ${({ theme }) => theme.colors.warning};
      background: rgba(180, 71, 27, 0.08);
    }
  }
`
