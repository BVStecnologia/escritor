import React, { useState } from 'react';
import styled from 'styled-components';
import { diagnosticarSupabase, corrigirProblemas, testarCRUD } from '../utils/diagnostico';
import { Button, Card, Title, Text } from './styled';

const DiagnosticoContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const DiagnosticoCard = styled(Card)`
  margin-bottom: 20px;
  padding: 20px;
`;

const ResultadoContainer = styled.pre`
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  overflow: auto;
  max-height: 500px;
  font-family: monospace;
  font-size: 14px;
`;

const StatusBadge = styled.span<{ status: 'OK' | 'Erro' | 'Aviso' }>`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  margin-left: 10px;
  background-color: ${({ status, theme }) => 
    status === 'OK' ? theme.colors.success :
    status === 'Erro' ? theme.colors.danger :
    theme.colors.warning};
  color: white;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const DiagnosticoComponent: React.FC = () => {
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [correcao, setCorrecao] = useState<any>(null);
  const [testeCRUD, setTesteCRUD] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const executarDiagnostico = async () => {
    setLoading(true);
    try {
      const resultado = await diagnosticarSupabase();
      setDiagnostico(resultado);
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const executarCorrecao = async () => {
    setLoading(true);
    try {
      const resultado = await corrigirProblemas();
      setCorrecao(resultado);
    } catch (error) {
      console.error('Erro ao executar correção:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const executarTesteCRUD = async () => {
    setLoading(true);
    try {
      const resultado = await testarCRUD();
      setTesteCRUD(resultado);
    } catch (error) {
      console.error('Erro ao executar teste CRUD:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DiagnosticoContainer>
      <Title>Diagnóstico do Supabase</Title>
      <Text>
        Esta ferramenta realiza diagnósticos na conexão com o Supabase e testa operações básicas para ajudar a identificar problemas.
      </Text>
      
      <ButtonContainer>
        <Button 
          variant="primary" 
          onClick={executarDiagnostico}
          disabled={loading}
        >
          {loading ? 'Executando...' : 'Diagnóstico'}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={executarCorrecao}
          disabled={loading}
        >
          {loading ? 'Executando...' : 'Tentar Correções'}
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={executarTesteCRUD}
          disabled={loading}
        >
          {loading ? 'Executando...' : 'Testar CRUD'}
        </Button>
      </ButtonContainer>
      
      {diagnostico && (
        <DiagnosticoCard>
          <Title>Resultado do Diagnóstico</Title>
          <ResultadoContainer>
            {JSON.stringify(diagnostico, null, 2)}
          </ResultadoContainer>
        </DiagnosticoCard>
      )}
      
      {correcao && (
        <DiagnosticoCard>
          <Title>Resultado das Correções</Title>
          <ResultadoContainer>
            {JSON.stringify(correcao, null, 2)}
          </ResultadoContainer>
        </DiagnosticoCard>
      )}
      
      {testeCRUD && (
        <DiagnosticoCard>
          <Title>Resultado do Teste CRUD</Title>
          <StatusBadge status={testeCRUD.status === 'OK' ? 'OK' : 'Erro'}>
            {testeCRUD.status}
          </StatusBadge>
          <ResultadoContainer>
            {JSON.stringify(testeCRUD, null, 2)}
          </ResultadoContainer>
        </DiagnosticoCard>
      )}
    </DiagnosticoContainer>
  );
};

export default DiagnosticoComponent;