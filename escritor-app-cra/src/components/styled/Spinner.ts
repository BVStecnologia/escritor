import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const Spinner = styled.div<SpinnerProps>`
  display: inline-block;
  width: ${({ size }) => 
    size === 'small' ? '16px' : 
    size === 'large' ? '32px' : 
    '24px'
  };
  height: ${({ size }) => 
    size === 'small' ? '16px' : 
    size === 'large' ? '32px' : 
    '24px'
  };
  border: ${({ size }) => 
    size === 'small' ? '2px' : 
    size === 'large' ? '4px' : 
    '3px'
  } solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${({ theme, color }) => color || theme.colors.primary};
  animation: ${rotate} 0.8s linear infinite;
  margin: ${({ size }) => size === 'small' ? '0 4px 0 0' : '0 8px 0 0'};
`;