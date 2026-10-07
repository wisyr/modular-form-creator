import { createGlobalStyle } from 'styled-components'

/** App-level accessibility styles layered on top of the design-system globals. */
export const AppGlobalStyles = createGlobalStyle`
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`
