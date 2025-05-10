import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Container, Title, Text, Button, Card } from '../components/styled';
import { dbService } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';

const ProfileContainer = styled(Container)`
  padding: ${({ theme }) => theme.space.xl};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.main};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.space.md};
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.space.lg};
  margin-bottom: ${({ theme }) => theme.space.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const ProfileTitle = styled(Title)`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BackButton = styled(Button)`
  margin-left: auto;
`;

const ProfileCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space.xl};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const ProfileSection = styled.div`
  margin-bottom: ${({ theme }) => theme.space.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.space.md} 0;
  padding-bottom: ${({ theme }) => theme.space.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}30;
  }
`;

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.space.md};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  min-height: 120px;
  resize: vertical;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}30;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  margin-top: ${({ theme }) => theme.space.lg};
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.space.md} 0;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.gray[200]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const StatValue = styled(Text)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const StatusMessage = styled.div<{ isError?: boolean }>`
  padding: ${({ theme }) => theme.space.md};
  margin-top: ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background-color: ${({ theme, isError }) => 
    isError ? theme.colors.danger + '15' : theme.colors.success + '15'};
  color: ${({ theme, isError }) => 
    isError ? theme.colors.danger : theme.colors.success};
`;

interface ProfileData {
  nome: string;
  email: string;
  bio: string;
  generoPreferido: string;
  site: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    nome: '',
    email: '',
    bio: '',
    generoPreferido: '',
    site: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [stats, setStats] = useState({
    livros: 0,
    capitulos: 0,
    palavrasEscritas: 0,
    diasConsecutivos: 0
  });

  useEffect(() => {
    const carregarPerfil = async () => {
      if (!user) return;
      
      try {
        // Carregar perfil
        const perfilData = await dbService.getPerfilUsuario();
        if (perfilData) {
          setProfile({
            nome: perfilData.nome || '',
            email: user.email || '',
            bio: perfilData.bio || '',
            generoPreferido: '',
            site: perfilData.site || ''
          });
        }
        
        // Carregar estatísticas
        const livros = await dbService.getLivros();
        let totalCapitulos = 0;
        let totalPalavras = 0;
        
        for (const livro of livros) {
          const capitulos = await dbService.getCapitulosPorLivroId(livro.id);
          totalCapitulos += capitulos?.length || 0;
          
          // Calcular palavras (estimativa)
          for (const capitulo of capitulos || []) {
            if (capitulo.conteudo) {
              totalPalavras += capitulo.conteudo.split(/\s+/).filter(Boolean).length;
            }
          }
        }
        
        setStats({
          livros: livros.length,
          capitulos: totalCapitulos,
          palavrasEscritas: totalPalavras,
          diasConsecutivos: 5 // Valor de exemplo
        });
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setMessage({
          text: "Não foi possível carregar as informações do perfil.",
          isError: true
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarPerfil();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      await dbService.atualizarPerfilUsuario({
        nome: profile.nome,
        bio: profile.bio,
        site: profile.site
      });
      
      setMessage({
        text: "Perfil atualizado com sucesso!",
        isError: false
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMessage({
        text: "Não foi possível atualizar o perfil. Tente novamente.",
        isError: true
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  return (
    <ProfileContainer>
      <Header>
        <ProfileTitle>Meu Perfil</ProfileTitle>
        <BackButton 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </BackButton>
      </Header>
      
      <ProfileCard>
        {loading ? (
          <Text>Carregando perfil...</Text>
        ) : (
          <>
            <ProfileSection>
              <SectionTitle>Informações Pessoais</SectionTitle>
              <ProfileForm onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={profile.nome}
                    onChange={handleInputChange}
                    placeholder="Seu nome"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled
                    placeholder="Seu email"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    placeholder="Conte um pouco sobre você como escritor..."
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="generoPreferido">Gênero de escrita preferido</Label>
                  <Input
                    id="generoPreferido"
                    name="generoPreferido"
                    value={profile.generoPreferido}
                    onChange={handleInputChange}
                    placeholder="Ex: Ficção científica, romance, fantasia..."
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="site">Site ou blog</Label>
                  <Input
                    id="site"
                    name="site"
                    value={profile.site}
                    onChange={handleInputChange}
                    placeholder="https://seusite.com.br"
                  />
                </FormGroup>
                
                <ButtonGroup>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </ButtonGroup>
                
                {message && (
                  <StatusMessage isError={message.isError}>
                    {message.text}
                  </StatusMessage>
                )}
              </ProfileForm>
            </ProfileSection>
            
            <ProfileSection>
              <SectionTitle>Estatísticas</SectionTitle>
              
              <StatsRow>
                <StatLabel>Livros criados</StatLabel>
                <StatValue>{stats.livros}</StatValue>
              </StatsRow>
              
              <StatsRow>
                <StatLabel>Capítulos escritos</StatLabel>
                <StatValue>{stats.capitulos}</StatValue>
              </StatsRow>
              
              <StatsRow>
                <StatLabel>Palavras escritas</StatLabel>
                <StatValue>{stats.palavrasEscritas.toLocaleString('pt-BR')}</StatValue>
              </StatsRow>
              
              <StatsRow>
                <StatLabel>Dias consecutivos de escrita</StatLabel>
                <StatValue>{stats.diasConsecutivos}</StatValue>
              </StatsRow>
            </ProfileSection>
          </>
        )}
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfilePage;