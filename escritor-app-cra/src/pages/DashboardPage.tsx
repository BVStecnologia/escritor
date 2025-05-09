import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LivroComponent from '../components/LivroComponent';
import { Container, Card, Title, Subtitle, Text, Button } from '../components/styled';
import { dbService } from '../services/dbService';

const DashboardContainer = styled(Container)`
  padding: 0 ${({ theme }) => theme.space.xl};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.main};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.space.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 ${({ theme }) => theme.space.sm};
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space.lg} 0;
  margin-bottom: ${({ theme }) => theme.space.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const NavLinks = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.dark};
    color: ${({ theme }) => theme.colors.text.primary};
    text-decoration: none;
  }
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.space['2xl']};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const SectionTitle = styled(Subtitle)`
  margin-bottom: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.space.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.space.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease-in-out;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.space.sm};
`;

const StatLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

interface StatsData {
  livros: number;
  capitulos: number;
  palavras: number;
  sessoes: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData>({
    livros: 0,
    capitulos: 0,
    palavras: 12458, // Exemplo estático por enquanto
    sessoes: 42 // Exemplo estático por enquanto
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const livros = await dbService.getLivros();

        // Contabilizar capítulos
        let totalCapitulos = 0;
        for (const livro of livros) {
          const capitulos = await dbService.getCapitulosPorLivroId(livro.id);
          totalCapitulos += capitulos?.length || 0;
        }

        setStats({
          ...stats,
          livros: livros.length,
          capitulos: totalCapitulos
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, []);

  return (
    <DashboardContainer>
      <Header>
        <Logo>Escritor App</Logo>
        <NavLinks>
          <NavLink to="/profile">Perfil</NavLink>
          <NavLink to="/">Sair</NavLink>
        </NavLinks>
      </Header>

      <Section>
        <SectionHeader>
          <SectionTitle>Biblioteca</SectionTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Atualizar
          </Button>
        </SectionHeader>
        <LivroComponent showForm={true} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Estatísticas</SectionTitle>
        </SectionHeader>
        <StatsGrid>
          <StatCard>
            <StatValue style={{ color: '#48bb78' }}>{stats.livros}</StatValue>
            <StatLabel>Livros</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue style={{ color: '#4cc9f0' }}>{stats.capitulos}</StatValue>
            <StatLabel>Capítulos</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue style={{ color: '#ff9e00' }}>{stats.palavras.toLocaleString('pt-BR')}</StatValue>
            <StatLabel>Palavras</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue style={{ color: '#f72585' }}>{stats.sessoes}</StatValue>
            <StatLabel>Sessões de escrita</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>
    </DashboardContainer>
  );
};

export default DashboardPage;