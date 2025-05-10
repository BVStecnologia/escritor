import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { dbService } from '../services/dbService';
import { Livro } from '../services/dbService';
import { Button, Card, Title, Text } from './styled';

const LivrosContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const LivroCard = styled(Card)`
  margin-bottom: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LivroTitulo = styled(Title)`
  font-size: 1.5rem;
  margin-bottom: 5px;
`;

const LivroAutor = styled(Text)`
  font-style: italic;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LivroData = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const NoLivrosMessage = styled.div`
  text-align: center;
  padding: 50px 20px;
  background-color: ${({ theme }) => theme.colors.background.light};
  border-radius: 8px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.danger}20;
  color: ${({ theme }) => theme.colors.danger};
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SuccessMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.success}20;
  color: ${({ theme }) => theme.colors.success};
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.light};
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const FormTitle = styled.h3`
  margin-bottom: 15px;
  font-size: 1.2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 4px;
  font-size: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const RefreshButton = styled(Button)`
  margin-left: auto;
`;

interface LivroComponentProps {
  showForm?: boolean;
}

const LivroComponent: React.FC<LivroComponentProps> = ({ showForm = true }) => {
  const navigate = useNavigate();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  
  const carregarLivros = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Carregando livros...');
      const dados = await dbService.getLivros();
      console.log('Livros carregados:', dados);
      setLivros(dados);
    } catch (err: any) {
      console.error('Erro ao carregar livros:', err);
      setError(`Erro ao carregar livros: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    carregarLivros();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('O título é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const novoLivro = await dbService.criarLivro({
        titulo,
        autor: autor.trim() || undefined
      });
      console.log('Livro criado:', novoLivro);
      setSuccess('Livro criado com sucesso!');
      setTitulo('');
      setAutor('');
      // Recarregar a lista de livros
      await carregarLivros();
    } catch (err: any) {
      console.error('Erro ao criar livro:', err);
      setError(`Erro ao criar livro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    carregarLivros();
  };
  
  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return data;
    }
  };
  
  return (
    <LivrosContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {showForm && (
        <FormContainer>
          <FormTitle>Adicionar Novo Livro</FormTitle>
          <form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título do livro"
                required
              />
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="autor">Autor</Label>
              <Input
                id="autor"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Nome do autor (opcional)"
              />
            </InputGroup>
            
            <ButtonContainer>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Adicionar Livro'}
              </Button>
              
              <RefreshButton
                variant="secondary"
                type="button"
                onClick={handleRefresh}
                disabled={loading}
              >
                Atualizar Lista
              </RefreshButton>
            </ButtonContainer>
          </form>
        </FormContainer>
      )}
      
      <Title>Meus Livros</Title>
      
      {loading && <Text>Carregando livros...</Text>}
      
      {!loading && livros.length === 0 && (
        <NoLivrosMessage>
          <Text>Você ainda não tem livros cadastrados.</Text>
          {!showForm && (
            <Button
              variant="primary"
              onClick={handleRefresh}
              style={{ marginTop: '20px' }}
            >
              Atualizar Lista
            </Button>
          )}
        </NoLivrosMessage>
      )}
      
      {livros.map((livro) => (
        <LivroCard key={livro.id}>
          <LivroTitulo>{livro["Nome do livro"]}</LivroTitulo>
          {livro["Autor"] && <LivroAutor>por {livro["Autor"]}</LivroAutor>}
          <LivroData>Criado em: {formatarData(livro.created_at)}</LivroData>
          <ButtonContainer>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                try {
                  // Buscar capítulos do livro
                  const capitulos = await dbService.getCapitulosPorLivroId(livro.id);

                  // Se existirem capítulos, redirecionar para o primeiro
                  if (capitulos && capitulos.length > 0) {
                    navigate(`/editor/${livro.id}/${capitulos[0].id}`);
                  } else {
                    // Se não existirem capítulos, redirecionar para a criação de um novo
                    navigate(`/editor/${livro.id}`);
                  }
                } catch (err) {
                  console.error('Erro ao buscar capítulos:', err);
                  navigate(`/editor/${livro.id}`);
                }
              }}
            >
              Editar
            </Button>
          </ButtonContainer>
        </LivroCard>
      ))}
    </LivrosContainer>
  );
};

export default LivroComponent;