import React from 'react';
import styled from 'styled-components';
import { FaCloud, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

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
  pointer-events: none;
`;

export const FloatingSaveStatus = ({ saveStatus, isOnline }: { saveStatus: string, isOnline: boolean }) => {
  let statusIcon = null;
  let statusText = '';
  if (saveStatus === 'saving') {
    statusIcon = (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <ImSpinner2 />
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .floating-spinner svg { animation: spin 1s linear infinite; }
        `}</style>
      </span>
    );
    statusText = 'Salvando...';
  } else if (saveStatus === 'saved') {
    statusIcon = <FaCheckCircle color="#10b981" />;
    statusText = 'Salvo';
  } else if (isOnline) {
    statusIcon = <FaCloud color="#3b82f6" />;
    statusText = 'Online';
  } else {
    statusIcon = <FaExclamationTriangle color="#ef4444" />;
    statusText = 'Offline';
  }
  return (
    <FloatingStatus className="floating-spinner">
      {statusIcon}
      <span>{statusText}</span>
    </FloatingStatus>
  );
}; 