import styled from 'styled-components'

/** Target of the skip link; also receives focus after each route change. */
export const MAIN_CONTENT_ID = 'main-content'

/** Small layout primitives shared by pages (built on design-system tokens). */
export const Page = styled.main.attrs({ id: MAIN_CONTENT_ID, tabIndex: -1 })`
  &:focus {
    outline: none;
  }

  max-width: 960px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.md}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.heading};
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.inkStrong};
`

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

/** Row of related actions with comfortable spacing between buttons. */
export const Actions = styled(Row)`
  gap: ${({ theme }) => theme.spacing.md};
`

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

/** Stack with tight spacing, for title + subtitle groups. */
export const TightStack = styled(Stack)`
  gap: ${({ theme }) => theme.spacing.xs};
`

/** Row that pushes its children to opposite ends. */
export const SpreadRow = styled(Row)`
  justify-content: space-between;
`

/** Paragraph that sits flush against the top of its container. */
export const LeadText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`

/** Paragraph without any outer margin. */
export const FlushText = styled.p`
  margin: 0;
`

/** Card section heading without the default top margin. */
export const SectionTitle = styled.h2`
  margin-top: 0;
`

export const Banner = styled.div<{ $tone?: 'warning' | 'error' | 'info' }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $tone = 'info' }) =>
      $tone === 'error'
        ? theme.colors.warning
        : $tone === 'warning'
          ? theme.colors.accent
          : theme.colors.border};
  background: ${({ theme, $tone = 'info' }) =>
    $tone === 'warning' ? theme.colors.accentSoft : theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.inkStrong};
`

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.inkMuted};
`

export const DefinitionList = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  margin: 0;

  dt {
    color: ${({ theme }) => theme.colors.inkMuted};
  }
  dd {
    margin: 0;
    color: ${({ theme }) => theme.colors.inkStrong};
    overflow-wrap: anywhere;
  }
`

/** Visually hidden until focused; lets keyboard users jump past navigation. */
export const SkipLink = styled.a`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: -100px;
  z-index: 100;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 600;

  &:focus {
    top: ${({ theme }) => theme.spacing.md};
  }
`
