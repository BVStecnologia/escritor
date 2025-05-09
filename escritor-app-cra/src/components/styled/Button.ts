import styled from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

const getButtonColor = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return theme.colors.primary;
    case 'secondary':
      return theme.colors.secondary;
    case 'danger':
      return theme.colors.danger;
    case 'success':
      return theme.colors.primary;
    case 'warning':
      return theme.colors.warning;
    case 'text':
    case 'outline':
      return 'transparent';
    default:
      return theme.colors.primary;
  }
};

const getTextColor = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'outline':
      return theme.colors.primary;
    case 'text':
      return theme.colors.dark;
    case 'primary':
    case 'secondary':
    case 'danger':
    case 'success':
    case 'warning':
      return theme.colors.white;
    default:
      return theme.colors.white;
  }
};

const getBorderColor = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'outline':
      return theme.colors.primary;
    case 'text':
      return 'transparent';
    default:
      return 'transparent';
  }
};

const getHoverBg = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return '#3d8b40';
    case 'secondary':
      return '#0b7dda';
    case 'danger':
      return '#d32f2f';
    case 'success':
      return '#3d8b40';
    case 'warning':
      return '#e68900';
    case 'outline':
      return 'rgba(76, 175, 80, 0.1)';
    case 'text':
      return 'rgba(0, 0, 0, 0.05)';
    default:
      return '#3d8b40';
  }
};

const getPadding = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return '0.25rem 0.5rem';
    case 'lg':
      return '0.75rem 1.5rem';
    case 'md':
    default:
      return '0.5rem 1rem';
  }
};

const getFontSize = (size: ButtonSize, theme: any) => {
  switch (size) {
    case 'sm':
      return theme.fontSizes.sm;
    case 'lg':
      return theme.fontSizes.lg;
    case 'md':
    default:
      return theme.fontSizes.md;
  }
};

export const Button = styled.button<{
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: string;
  fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ variant = 'primary', theme }) => getButtonColor(variant, theme)};
  color: ${({ variant = 'primary', theme }) => getTextColor(variant, theme)};
  border: 1px solid ${({ variant = 'primary', theme }) => getBorderColor(variant, theme)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ size = 'md' }) => getPadding(size)};
  font-size: ${({ size = 'md', theme }) => getFontSize(size, theme)};
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};
  width: ${({ width, fullWidth }) => width || (fullWidth ? '100%' : 'auto')};
  
  &:hover, &:focus {
    background-color: ${({ variant = 'primary', theme }) => getHoverBg(variant, theme)};
    outline: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  & > * + * {
    margin-left: 0.5rem;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;