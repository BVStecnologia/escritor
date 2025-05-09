import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { debugService } from '../services/debugService';
import { Container, Button, Title, Card, Text, Paragraph } from '../components/styled';

const DebugContainer = styled(Container)`
  padding: ${({ theme }) => theme.space.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const DebugTitle = styled(Title)`
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const DebugCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.space.lg};
  padding: ${({ theme }) => theme.space.lg};
`;

const DebugSection = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const ResultContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.space.md};
  margin-top: ${({ theme }) => theme.space.md};
  overflow: auto;
  max-height: 300px;
`;

const CodeBlock = styled.pre`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

const TableList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TableItem = styled.li<{ exists?: boolean }>`
  padding: ${({ theme }) => theme.space.sm};
  margin-bottom: ${({ theme }) => theme.space.xs};
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme, exists }) => exists ? theme.colors.background.light : theme.colors.gray[100]};
  border-left: 4px solid ${({ theme, exists }) => exists ? theme.colors.success : theme.colors.danger};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DebugPage: React.FC = () => {
  const [tabelas, setTabelas] = useState<any[]>([]);
  const [estrutura, setEstrutura] = useState<any>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<any>(null);
  const [testeInsercao, setTesteInsercao] = useState<any>(null);
  const [tabelaSelecionada, setTabelaSelecionada] = useState<string>('');
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    tabelas: false,
    estrutura: false,
    usuario: false,
    insercao: false
  });
  
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      verificarUsuario();
    }
  }, [user]);
  
  const listarTabelas = async () => {
    setLoading({ ...loading, tabelas: true });
    try {
      const resultado = await debugService.listarTabelas();
      setTabelas(Array.isArray(resultado) ? resultado : []);
    } catch (error) {
      console.error('Erro ao listar tabelas:', error);
    } finally {
      setLoading({ ...loading, tabelas: false });
    }
  };
  
  const verificarEstrutura = async (tabela: string) => {
    if (!tabela) return;
    
    setTabelaSelecionada(tabela);
    setLoading({ ...loading, estrutura: true });
    
    try {
      const resultado = await debugService.verificarEstrutura(tabela);
      setEstrutura(resultado);
    } catch (error) {
      console.error(`Erro ao verificar estrutura da tabela ${tabela}:`, error);
    } finally {
      setLoading({ ...loading, estrutura: false });
    }
  };
  
  const verificarUsuario = async () => {
    setLoading({ ...loading, usuario: true });
    try {
      const resultado = await debugService.verificarUsuario();
      setUsuarioInfo(resultado);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading({ ...loading, usuario: false });
    }
  };
  
  const testarInsercaoTabela = async (tabela: string) => {
    if (!tabela) return;
    
    setLoading({ ...loading, insercao: true });
    
    try {
      const resultado = await debugService.testarInsercao(tabela);
      setTesteInsercao(resultado);
    } catch (error) {
      console.error(`Erro ao testar inserção na tabela ${tabela}:`, error);
    } finally {
      setLoading({ ...loading, insercao: false });
    }
  };
  
  return (
    <DebugContainer>
      <DebugTitle>Diagnóstico do Supabase</DebugTitle>
      
      <DebugCard>
        <SectionTitle>Informações do Usuário</SectionTitle>
        <Button 
          variant="primary" 
          onClick={verificarUsuario}
          disabled={loading.usuario}
        >
          {loading.usuario ? 'Verificando...' : 'Verificar Usuário'}
        </Button>
        
        {usuarioInfo && (
          <ResultContainer>
            <CodeBlock>
              {JSON.stringify(usuarioInfo, null, 2)}
            </CodeBlock>
          </ResultContainer>
        )}
      </DebugCard>
      
      <DebugCard>
        <SectionTitle>Tabelas Disponíveis</SectionTitle>
        <Button 
          variant="primary" 
          onClick={listarTabelas}
          disabled={loading.tabelas}
        >
          {loading.tabelas ? 'Verificando...' : 'Verificar Tabelas'}
        </Button>
        
        {tabelas.length > 0 && (
          <ResultContainer>
            <TableList>
              {tabelas.map((item, index) => (
                <TableItem key={index} exists={item.existe}>
                  <span>
                    <strong>{item.tabela}</strong>
                    {item.contagem !== undefined && ` (${item.contagem} registros)`}
                  </span>
                  <ButtonRow>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => verificarEstrutura(item.tabela)}
                      disabled={!item.existe || loading.estrutura}
                    >
                      Estrutura
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => testarInsercaoTabela(item.tabela)}
                      disabled={!item.existe || loading.insercao}
                    >
                      Testar Inserção
                    </Button>
                  </ButtonRow>
                </TableItem>
              ))}
            </TableList>
          </ResultContainer>
        )}
      </DebugCard>
      
      {estrutura && (
        <DebugCard>
          <SectionTitle>Estrutura da Tabela: {tabelaSelecionada}</SectionTitle>
          <ResultContainer>
            <CodeBlock>
              {JSON.stringify(estrutura, null, 2)}
            </CodeBlock>
          </ResultContainer>
        </DebugCard>
      )}
      
      {testeInsercao && (
        <DebugCard>
          <SectionTitle>Teste de Inserção: {tabelaSelecionada}</SectionTitle>
          <ResultContainer>
            <CodeBlock>
              {JSON.stringify(testeInsercao, null, 2)}
            </CodeBlock>
          </ResultContainer>
        </DebugCard>
      )}
    </DebugContainer>
  );
};

export default DebugPage;