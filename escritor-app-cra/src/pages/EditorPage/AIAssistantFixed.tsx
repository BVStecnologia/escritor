import React, { useState } from 'react';
import { AIBrainIcon, LightbulbIcon, SendIcon, CollapseLeftIcon, CollapseRightIcon } from '../../components/icons';
import styled from 'styled-components';
import { AIContainer } from './styles';

const AIHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 89px; /* Mesma altura do cabeçalho da Sidebar */
  box-sizing: border-box;
`;

const AITitle = styled.h2<{ $isOpen: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const ToggleAIButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AIContent = styled.div<{ $isOpen: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  flex-direction: column;
  gap: 1.25rem;
`;

const AISuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const AISuggestion = styled.div`
  padding: 0.75rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary + '10'};
    border-color: ${({ theme }) => theme.colors.secondary + '30'};
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const AIActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const AIActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
    border-color: transparent;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const AIFooter = styled.div<{ $isOpen: boolean }>`
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
`;

const AIInputForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const AIInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.glass};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const AISubmitButton = styled.button<{ disabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: ${({ theme, disabled }) => 
    disabled ? theme.colors.gray[300] : theme.colors.primaryGradient
  };
  color: ${({ theme, disabled }) => 
    disabled ? theme.colors.gray[500] : 'white'
  };
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(-2px)'};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Componentes para versão colapsada
const CollapsedAIActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  width: 100%;
`;

const CollapsedAIAction = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.md || "0 8px 24px rgba(0, 0, 0, 0.1)"};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AIAssistantPanel = styled.div<{ $active: boolean }>`
  position: fixed;
  top: 101px; /* Ajustado para alinhar com o editor e outros componentes */
  right: ${({ $active }) => $active ? '2rem' : '-420px'};
  width: 350px;
  height: calc(100vh - 126px); /* Ajustado para mesma altura dos outros componentes */
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.background.paper};
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $active }) => $active ? 1 : 0.5};
  pointer-events: ${({ $active }) => $active ? 'all' : 'none'};
  z-index: 40;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  margin-top: 2px; /* Pequeno ajuste para alinhamento perfeito */
`;

interface AIAssistantFixedProps {
  bookId?: string;
  chapterId?: string;
}

export const AIAssistantFixed: React.FC<AIAssistantFixedProps> = ({
  bookId,
  chapterId
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const aiSuggestions = [
    { icon: <LightbulbIcon />, text: "Melhorar a descrição desta cena" },
    { icon: <LightbulbIcon />, text: "Adicionar mais diálogo" },
    { icon: <LightbulbIcon />, text: "Desenvolver conflito" },
    { icon: <LightbulbIcon />, text: "Expandir caracterização" },
    { icon: <LightbulbIcon />, text: "Revisar ritmo narrativo" }
  ];

  const aiActions = [
    { icon: <LightbulbIcon />, name: "Aprimorar" },
    { icon: <LightbulbIcon />, name: "Resumir" },
    { icon: <LightbulbIcon />, name: "Expandir" },
    { icon: <LightbulbIcon />, name: "Corrigir" },
    { icon: <LightbulbIcon />, name: "Reescrever" },
    { icon: <LightbulbIcon />, name: "Sugerir" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement AI prompt submission
    console.log("Enviando prompt:", aiPrompt);
    setAiPrompt('');
  };

  const toggleAIPanel = () => {
    setIsOpen(!isOpen);
  };

  const renderCollapsed = () => (
    <CollapsedAIActions>
      {aiActions.slice(0, 4).map((action, index) => (
        <CollapsedAIAction key={index}>
          {action.icon}
        </CollapsedAIAction>
      ))}
    </CollapsedAIActions>
  );

  return (
    <AIContainer $isOpen={isOpen}>
      <AIHeader>
        <AITitle $isOpen={isOpen}>
          <AIBrainIcon />
          Assistente IA
        </AITitle>
        <ToggleAIButton onClick={toggleAIPanel}>
          {isOpen ? <CollapseRightIcon /> : <CollapseLeftIcon />}
        </ToggleAIButton>
      </AIHeader>

      {!isOpen ? renderCollapsed() : (
        <>
          <AIContent $isOpen={isOpen}>
            <AISuggestionsGrid>
              {aiSuggestions.map((suggestion, index) => (
                <AISuggestion key={index}>
                  {suggestion.icon}
                  {suggestion.text}
                </AISuggestion>
              ))}
            </AISuggestionsGrid>

            <AIActionsGrid>
              {aiActions.map((action) => (
                <AIActionButton key={action.name}>
                  {action.icon}
                  {action.name}
                </AIActionButton>
              ))}
            </AIActionsGrid>
          </AIContent>

          <AIFooter $isOpen={isOpen}>
            <AIInputForm onSubmit={handleSubmit}>
              <AIInput
                placeholder="Peça ajuda com seu texto..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <AISubmitButton type="submit" disabled={!aiPrompt.trim()}>
                <SendIcon />
              </AISubmitButton>
            </AIInputForm>
          </AIFooter>
        </>
      )}
    </AIContainer>
  );
}; 