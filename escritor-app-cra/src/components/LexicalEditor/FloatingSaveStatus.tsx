import React from 'react';
import styled from 'styled-components';

const FloatingStatus = styled.div`
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  z-index: 100;
`;

const SpinnerIcon = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0,0,0,0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusIcon = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background-color: ${props => props.color};
  border-radius: 50%;
`;

export const FloatingSaveStatus = ({ saveStatus, isOnline }: { saveStatus: string, isOnline: boolean }) => {
  let statusIcon: JSX.Element;
  let statusText = '';
  let tooltipText = '';
  
  if (saveStatus === 'saving') {
    statusIcon = <SpinnerIcon />;
    statusText = 'Salvando...';
  } else if (saveStatus === 'saved') {
    statusIcon = <StatusIcon color="#10b981" />;
    statusText = 'Salvo';
    tooltipText = 'O salvamento é automático após 5 segundos sem digitar.';
  } else if (isOnline) {
    statusIcon = <StatusIcon color="#3b82f6" />;
    statusText = 'Online';
  } else {
    statusIcon = <StatusIcon color="#ef4444" />;
    statusText = 'Offline';
  }
  
  return (
    <FloatingStatus>
      {statusIcon}
      {saveStatus === 'saved' ? (
        <span style={{ cursor: 'pointer' }} title={tooltipText}>{statusText}</span>
      ) : (
        <span>{statusText}</span>
      )}
    </FloatingStatus>
  );
}; 