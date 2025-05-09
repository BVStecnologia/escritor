import React, { useState } from 'react';
import styled from 'styled-components';
import { executarDiagnosticoSimples } from '../utils/diagnosticoSimples';
import { Button, Card, Title, Text } from './styled';

const DiagnosticoContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const ResultadoCard = styled(Card)`
  margin-top: 20px;
  padding: 20px;
`;

const ResultadoSecao = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SecaoTitulo = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  background-color: ${({ status, theme }) => 
    status === 'OK' || status === 'Autenticado' ? theme.colors.success :
    status === 'Erro' || status === 'Falha' ? theme.colors.danger :
    theme.colors.warning};
`;

const ResultadoDados = styled.pre`
  background-color: ${({ theme }) => theme.colors.background.dark};
  padding: 15px;
  border-radius: 5px;
  overflow: auto;
  max-height: 300px;
  font-family: monospace;
  font-size: 14px;
`;

const DiagnosticoSimples: React.FC = () => {
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleDiagnostico = async () => {
    setLoading(true);
    try {
      const dados = await executarDiagnosticoSimples();
      setResultado(dados);
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DiagnosticoContainer>
      <Title>Diagnóstico Simplificado do Supabase</Title>
      <Text>
        Esta página realiza testes básicos para verificar sua conexão com o Supabase
        e identificar possíveis problemas de autenticação ou tabelas.
      </Text>
      
      <Button
        variant="primary"
        onClick={handleDiagnostico}
        disabled={loading}
      >
        {loading ? 'Executando...' : 'Executar Diagnóstico'}
      </Button>
      
      {resultado && (
        <ResultadoCard>
          <Title>Resultados do Diagnóstico</Title>
          <Text>Executado em: {new Date(resultado.timestamp).toLocaleString()}</Text>
          
          <ResultadoSecao>
            <SecaoTitulo>
              Conexão com Supabase 
              <StatusBadge status={resultado.conexao.status}>
                {resultado.conexao.status}
              </StatusBadge>
            </SecaoTitulo>
            <Text>{resultado.conexao.mensagem}</Text>
          </ResultadoSecao>
          
          <ResultadoSecao>
            <SecaoTitulo>
              Autenticação 
              <StatusBadge status={resultado.autenticacao.status}>
                {resultado.autenticacao.status}
              </StatusBadge>
            </SecaoTitulo>
            <Text>{resultado.autenticacao.mensagem}</Text>
          </ResultadoSecao>
          
          <ResultadoSecao>
            <SecaoTitulo>
              Tabela de Livros 
              <StatusBadge status={resultado.tabelaLivros.status}>
                {resultado.tabelaLivros.status}
              </StatusBadge>
            </SecaoTitulo>
            <Text>{resultado.tabelaLivros.mensagem}</Text>
            
            {resultado.tabelaLivros.dados && (
              <ResultadoDados>
                {JSON.stringify(resultado.tabelaLivros.dados, null, 2)}
              </ResultadoDados>
            )}
          </ResultadoSecao>
          
          <ResultadoSecao>
            <SecaoTitulo>
              Livros do Usuário 
              <StatusBadge status={resultado.livrosUsuario.status}>
                {resultado.livrosUsuario.status}
              </StatusBadge>
            </SecaoTitulo>
            <Text>{resultado.livrosUsuario.mensagem}</Text>
            
            {resultado.livrosUsuario.dados && (
              <ResultadoDados>
                {JSON.stringify(resultado.livrosUsuario.dados, null, 2)}
              </ResultadoDados>
            )}
          </ResultadoSecao>
        </ResultadoCard>
      )}
    </DiagnosticoContainer>
  );
};

export default DiagnosticoSimples;