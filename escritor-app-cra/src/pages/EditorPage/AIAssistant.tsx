import React, { useState } from 'react';
import { AIBrainIcon, CloseIcon, LightbulbIcon, SendIcon } from '../../components/icons';
import {
  AIAssistantButton,
  AIAssistantPanel,
  AIHeader,
  AITitle,
  AICloseButton,
  AIContent,
  AISuggestionsGrid,
  AISuggestion,
  AIActionsGrid,
  AIActionButton,
  AIFooter,
  AIInputForm,
  AIInput,
  AISubmitButton
} from './styles';

interface AIAssistantProps {
  active: boolean;
  onToggle: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  active,
  onToggle
}) => {
  const [aiPrompt, setAiPrompt] = useState('');

  const aiSuggestions = [
    { icon: <LightbulbIcon />, text: "Melhorar a descrição desta cena" },
    { icon: <LightbulbIcon />, text: "Adicionar mais diálogo entre os personagens" },
    { icon: <LightbulbIcon />, text: "Desenvolver melhor o conflito" },
    { icon: <LightbulbIcon />, text: "Expandir a caracterização do protagonista" },
    { icon: <LightbulbIcon />, text: "Revisar ritmo e pacing da narrativa" }
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
    setAiPrompt('');
  };

  return (
    <>
      <AIAssistantButton
        $active={active}
        onClick={onToggle}
      >
        <AIBrainIcon />
      </AIAssistantButton>

      <AIAssistantPanel $active={active}>
        <AIHeader>
          <AITitle>
            <AIBrainIcon />
            Assistente de Escrita
          </AITitle>
          <AICloseButton onClick={onToggle}>
            <CloseIcon />
          </AICloseButton>
        </AIHeader>

        <AIContent>
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

        <AIFooter>
          <AIInputForm onSubmit={handleSubmit}>
            <AIInput
              placeholder="Peça ajuda para melhorar seu texto..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <AISubmitButton type="submit" disabled={!aiPrompt.trim()}>
              <SendIcon />
            </AISubmitButton>
          </AIInputForm>
        </AIFooter>
      </AIAssistantPanel>
    </>
  );
};