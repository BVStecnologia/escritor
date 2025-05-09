import styled from 'styled-components';

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.space.lg};
  color: ${({ theme }) => theme.colors.dark};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`;

export const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.dark};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

export const Heading = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.dark};
`;

export const Paragraph = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.dark};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const Text = styled.span<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 300 | 400 | 500 | 600 | 700;
}>`
  font-size: ${({ theme, size = 'md' }) => theme.fontSizes[size]};
  font-weight: ${({ weight = 400 }) => weight};
  color: ${({ theme }) => theme.colors.dark};
`;

export const Link = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const List = styled.ul`
  list-style-position: inside;
  margin-bottom: ${({ theme }) => theme.space.md};
  
  li {
    margin-bottom: ${({ theme }) => theme.space.xs};
  }
`;

export const OrderedList = styled(List).attrs({ as: 'ol' })``;

export const ListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.space.xs};
  line-height: 1.6;
`;