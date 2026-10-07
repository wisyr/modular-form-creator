import styled from 'styled-components'

/** Small layout primitives shared by pages (built on design-system tokens). */
export const Page = styled.main`
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
