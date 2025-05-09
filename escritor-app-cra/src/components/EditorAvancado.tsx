import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { assistantService } from '../services/assistantService';
import { Button, Card, Title, Text } from './styled';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

// Componentes estilizados
const EditorContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background.main};
`;

const EditorArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.space.lg};
  overflow: hidden;
  position: relative;
`;

const ToolsPanel = styled.div`
  width: 320px;
  background-color: ${({ theme }) => theme.colors.white};
  border-left: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.space.lg};
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.md};
  padding-bottom: ${({ theme }) => theme.space.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const EditorTitle = styled(Title)`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const EditorControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  align-items: center;
`;

const SaveStatus = styled.div<{ saved: boolean; saving: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ saved, saving, theme }) =>
    saving ? theme.colors.primary : saved ? theme.colors.success : theme.colors.warning};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ saved, saving, theme }) =>
    saving ? theme.colors.primary + '10' : saved ? theme.colors.success + '10' : theme.colors.warning + '10'};
  animation: ${({ saving }) => (saving ? pulse : 'none')} 1.5s infinite ease-in-out;
  transition: all 0.3s ease;
`;

const StatusDot = styled.span<{ saved: boolean; saving: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ saved, saving, theme }) =>
    saving ? theme.colors.primary : saved ? theme.colors.success : theme.colors.warning};
  display: inline-block;
`;

const TitleInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes['xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.space.md};
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover, &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:focus {
    outline: none;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  background-color: ${({ theme }) => theme.colors.white};
`;

const ContentTextarea = styled.textarea`
  flex: 1;
  padding: ${({ theme }) => theme.space.xl};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.8;
  border: none;
  resize: none;
  background-color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const EditorFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.colors.background.light};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const WordCount = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
`;

const CountItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};
`;

const CountValue = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ToolsHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.lg};
  padding-bottom: ${({ theme }) => theme.space.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const ToolsTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin: 0 0 ${({ theme }) => theme.space.xs} 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const ToolsDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const ToolGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
  animation: ${slideIn} 0.4s ease-out;
`;

const ToolGroupTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: 0 0 ${({ theme }) => theme.space.md} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
  }
`;

const ToolButton = styled(Button)<{ active?: boolean }>`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.space.sm};
  text-align: left;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.md};
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary + '15' : theme.colors.background.light};
  border: 1px solid ${({ active, theme }) =>
    active ? theme.colors.primary + '30' : theme.colors.gray[200]};
  box-shadow: ${({ active, theme }) =>
    active ? theme.shadows.md : 'none'};

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primary + '20' : theme.colors.background.dark};
  }
`;

const ToolIcon = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.primary + '15'};
  border-radius: 50%;
`;

const ToolContent = styled.div`
  flex: 1;
`;

const ToolName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: 2px;
`;

const ToolDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.colors.danger + '15'};
  color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  animation: ${fadeIn} 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};

  &::before {
    content: '⚠️';
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const AIResponseArea = styled.div`
  margin-top: ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.primary + '30'};
  overflow: hidden;
  animation: ${slideIn} 0.4s ease-out;
`;

const AIResponseHeader = styled.div`
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  background-color: ${({ theme }) => theme.colors.primary + '10'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primary + '20'};
`;

const AIResponseTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs};

  &::before {
    content: '🤖';
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const AIResponseContent = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.6;
  white-space: pre-wrap;
  padding: ${({ theme }) => theme.space.md};
  max-height: 300px;
  overflow-y: auto;
`;

const AIResponseFooter = styled.div`
  padding: ${({ theme }) => theme.space.sm};
  background-color: ${({ theme }) => theme.colors.background.light};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space.sm};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.gray[300]};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatsCard = styled(Card)`
  padding: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
  border: none;
  background-color: ${({ theme }) => theme.colors.background.light};
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space.xs} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatValue = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AutoSaveMessage = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: ${({ theme }) => theme.colors.success + '15'};
  color: ${({ theme }) => theme.colors.success};
  padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transform: translateY(${({ visible }) => (visible ? 0 : '20px')});
  transition: all 0.3s ease;
  z-index: 100;

  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background-color: ${({ theme }) => theme.colors.success};
    color: white;
    border-radius: 50%;
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;

interface EditorProps {
  livroId: number;
  capituloId?: string;
  onSaved?: () => void;
}

const EditorAvancado: React.FC<EditorProps> = ({ livroId, capituloId, onSaved }) => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState('Novo Capítulo');
  const [conteudo, setConteudo] = useState('');
  const [saved, setSaved] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [activeAITool, setActiveAITool] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');
  const lastSavedTitle = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carregar capítulo existente, se houver
  useEffect(() => {
    const carregarCapitulo = async () => {
      if (!capituloId) return;

      try {
        const capitulo = await dbService.getCapituloPorId(capituloId);
        if (capitulo) {
          setTitulo(capitulo.titulo || 'Sem título');
          setConteudo(capitulo.conteudo || '');
          lastSavedContent.current = capitulo.conteudo || '';
          lastSavedTitle.current = capitulo.titulo || '';

          // Atualizar contagens
          updateWordAndCharCount(capitulo.conteudo || '');
        }
      } catch (error) {
        console.error('Erro ao carregar capítulo:', error);
        setErro('Não foi possível carregar o capítulo.');
      }
    };

    carregarCapitulo();
  }, [capituloId]);

  // Função para atualizar contagens de palavras e caracteres
  const updateWordAndCharCount = (text: string) => {
    setCharacterCount(text.length);
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  };

  // Atualizar estatísticas quando o conteúdo mudar
  useEffect(() => {
    updateWordAndCharCount(conteudo);
  }, [conteudo]);

  // Focar no textarea quando carregar
  useEffect(() => {
    if (textareaRef.current && !capituloId) {
      textareaRef.current.focus();
    }
  }, [capituloId]);

  // Salvamento automático
  const salvarCapitulo = useCallback(async () => {
    if (!livroId) return;

    // Verificar se houve mudanças
    if (
      conteudo === lastSavedContent.current &&
      titulo === lastSavedTitle.current
    ) {
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      if (capituloId) {
        // Atualizar capítulo existente
        await dbService.atualizarCapitulo(capituloId, {
          titulo,
          conteudo
        });
      } else {
        // Criar novo capítulo
        const novoCapitulo = await dbService.criarCapitulo(livroId, {
          titulo,
          conteudo
        });

        // Redirecionar para o URL com o ID do novo capítulo
        if (novoCapitulo && novoCapitulo.id) {
          navigate(`/editor/${livroId}/${novoCapitulo.id}`, { replace: true });
        }
      }

      // Atualizar referências
      lastSavedContent.current = conteudo;
      lastSavedTitle.current = titulo;
      setSaved(true);

      // Mostrar mensagem temporária de salvamento
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);

      // Atualizar horário do último salvamento
      const now = new Date();
      setLastSavedTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error('Erro ao salvar capítulo:', error);
      setErro('Não foi possível salvar o capítulo. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }, [livroId, capituloId, titulo, conteudo, onSaved, navigate]);

  // Configurar salvamento automático quando o conteúdo mudar
  useEffect(() => {
    setSaved(false);

    // Limpar timeout existente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Configurar novo timeout (salvar após 3 segundos de inatividade)
    saveTimeoutRef.current = setTimeout(() => {
      salvarCapitulo();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [conteudo, titulo, salvarCapitulo]);

  // Funções para ferramentas de IA
  const handleAutocomplete = async () => {
    if (!conteudo.trim()) return;

    setActiveAITool('autocomplete');
    setAILoading(true);
    setAIResponse(null);

    try {
      const resultado = await assistantService.autocomplete({
        input: conteudo,
        cursorPosition: conteudo.length,
        maxSuggestions: 1,
        livroId: livroId.toString()
      });

      if (resultado?.suggestions && resultado.suggestions.length > 0) {
        setAIResponse(resultado.suggestions[0]);
      } else {
        setAIResponse('Não foi possível gerar sugestões para este texto.');
      }
    } catch (error) {
      console.error('Erro ao usar autocomplete:', error);
      setAIResponse('Erro ao gerar sugestões. Tente novamente.');
    } finally {
      setAILoading(false);
    }
  };

  const handleImproveWriting = async () => {
    if (!conteudo.trim()) return;

    setActiveAITool('improve');
    setAILoading(true);
    setAIResponse(null);

    try {
      const resultado = await assistantService.writingAssistant({
        input: conteudo,
        action: 'improve',
        focusAreas: ['clarity', 'engagement'],
        livroId: livroId.toString(),
        capituloId: capituloId
      });

      if (resultado?.revised_text) {
        setAIResponse(resultado.revised_text);
      } else {
        setAIResponse('Não foi possível melhorar o texto.');
      }
    } catch (error) {
      console.error('Erro ao melhorar texto:', error);
      setAIResponse('Erro ao processar o texto. Tente novamente.');
    } finally {
      setAILoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    setActiveAITool('ideas');
    setAILoading(true);
    setAIResponse(null);

    try {
      const resultado = await assistantService.creativeIdeas({
        input: conteudo || 'Gere ideias para continuar a história',
        ideaType: 'plot_points',
        numIdeas: 3,
        livroId: livroId.toString(),
        capituloId: capituloId
      });

      if (resultado?.ideas) {
        setAIResponse(resultado.ideas);
      } else {
        setAIResponse('Não foi possível gerar ideias.');
      }
    } catch (error) {
      console.error('Erro ao gerar ideias:', error);
      setAIResponse('Erro ao gerar ideias. Tente novamente.');
    } finally {
      setAILoading(false);
    }
  };

  // Funções para aplicar sugestões
  const applyAIResponse = () => {
    if (!aiResponse) return;

    if (activeAITool === 'improve') {
      // Substituir todo o conteúdo para melhorias de texto
      setConteudo(aiResponse);
    } else {
      // Adicionar ao final para outras ferramentas
      setConteudo(prev => prev + '\n\n' + aiResponse);
    }

    setAIResponse(null);
    setActiveAITool(null);

    // Focar no textarea depois de aplicar
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Descartar sugestão
  const discardAIResponse = () => {
    setAIResponse(null);
    setActiveAITool(null);
  };

  // Calcular tempo de leitura estimado
  const calculateReadingTime = (): string => {
    const wordsPerMinute = 200; // Velocidade de leitura média
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    if (minutes < 1) return 'menos de 1 min de leitura';
    return `${minutes} min de leitura`;
  };

  return (
    <EditorContainer>
      <EditorArea>
        <EditorHeader>
          <EditorTitle>Editor de Capítulo</EditorTitle>
          <EditorControls>
            <SaveStatus saved={saved} saving={salvando}>
              <StatusDot saved={saved} saving={salvando} />
              {salvando ? 'Salvando...' : saved ? 'Salvo' : 'Não salvo'}
            </SaveStatus>
            <Button
              variant="primary"
              size="sm"
              onClick={salvarCapitulo}
              disabled={salvando || saved}
            >
              {salvando ? <LoadingSpinner /> : 'Salvar agora'}
            </Button>
          </EditorControls>
        </EditorHeader>

        {erro && <ErrorMessage>{erro}</ErrorMessage>}

        <TitleInput
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título do capítulo"
          aria-label="Título do capítulo"
        />

        <ContentWrapper>
          <ContentTextarea
            ref={textareaRef}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Comece a escrever seu capítulo aqui..."
            aria-label="Conteúdo do capítulo"
          />

          <EditorFooter>
            <WordCount>
              <CountItem>
                <span>Palavras:</span> <CountValue>{wordCount}</CountValue>
              </CountItem>
              <CountItem>
                <span>Caracteres:</span> <CountValue>{characterCount}</CountValue>
              </CountItem>
              <CountItem>
                <span>Tempo de leitura:</span> <CountValue>{calculateReadingTime()}</CountValue>
              </CountItem>
            </WordCount>

            {lastSavedTime && (
              <div>Último salvamento: {lastSavedTime}</div>
            )}
          </EditorFooter>
        </ContentWrapper>

        {aiResponse && (
          <AIResponseArea>
            <AIResponseHeader>
              <AIResponseTitle>
                {activeAITool === 'autocomplete' && 'Sugestão de continuação'}
                {activeAITool === 'improve' && 'Versão melhorada'}
                {activeAITool === 'ideas' && 'Ideias para sua história'}
              </AIResponseTitle>
            </AIResponseHeader>

            <AIResponseContent>{aiResponse}</AIResponseContent>

            <AIResponseFooter>
              <Button
                variant="secondary"
                size="sm"
                onClick={discardAIResponse}
              >
                Descartar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={applyAIResponse}
              >
                {activeAITool === 'improve' ? 'Substituir texto' : 'Aplicar sugestão'}
              </Button>
            </AIResponseFooter>
          </AIResponseArea>
        )}

        <AutoSaveMessage visible={showSavedMessage}>
          Capítulo salvo automaticamente
        </AutoSaveMessage>
      </EditorArea>

      <ToolsPanel>
        <ToolsHeader>
          <ToolsTitle>Ferramentas</ToolsTitle>
          <ToolsDescription>
            Use estas ferramentas para melhorar sua escrita
          </ToolsDescription>
        </ToolsHeader>

        <ToolGroup>
          <ToolGroupTitle>Assistente de IA Claude</ToolGroupTitle>

          <ToolButton
            variant="secondary"
            onClick={handleAutocomplete}
            disabled={aiLoading}
            active={activeAITool === 'autocomplete'}
          >
            <ToolIcon>✍️</ToolIcon>
            <ToolContent>
              <ToolName>Completar texto</ToolName>
              <ToolDescription>
                Gera uma continuação para o seu texto atual
              </ToolDescription>
            </ToolContent>
          </ToolButton>

          <ToolButton
            variant="secondary"
            onClick={handleImproveWriting}
            disabled={aiLoading}
            active={activeAITool === 'improve'}
          >
            <ToolIcon>✨</ToolIcon>
            <ToolContent>
              <ToolName>Melhorar escrita</ToolName>
              <ToolDescription>
                Melhora a clareza e fluidez do seu texto
              </ToolDescription>
            </ToolContent>
          </ToolButton>

          <ToolButton
            variant="secondary"
            onClick={handleGenerateIdeas}
            disabled={aiLoading}
            active={activeAITool === 'ideas'}
          >
            <ToolIcon>💡</ToolIcon>
            <ToolContent>
              <ToolName>Ideias criativas</ToolName>
              <ToolDescription>
                Sugestões para desenvolver sua história
              </ToolDescription>
            </ToolContent>
          </ToolButton>
        </ToolGroup>

        <ToolGroup>
          <ToolGroupTitle>Estatísticas</ToolGroupTitle>
          <StatsCard>
            <StatRow>
              <StatLabel>Palavras</StatLabel>
              <StatValue>{wordCount}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Caracteres</StatLabel>
              <StatValue>{characterCount}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Tempo de leitura</StatLabel>
              <StatValue>{calculateReadingTime()}</StatValue>
            </StatRow>
            <StatRow>
              <StatLabel>Estado</StatLabel>
              <StatValue>{salvando ? 'Salvando...' : saved ? 'Salvo' : 'Não salvo'}</StatValue>
            </StatRow>
            {lastSavedTime && (
              <StatRow>
                <StatLabel>Último salvamento</StatLabel>
                <StatValue>{lastSavedTime}</StatValue>
              </StatRow>
            )}
          </StatsCard>
        </ToolGroup>
      </ToolsPanel>
    </EditorContainer>
  );
};

export default EditorAvancado;