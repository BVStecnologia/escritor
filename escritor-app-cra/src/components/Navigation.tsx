import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './styled';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.space.md} ${theme.space.xl}`};
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  transition: ${({ theme }) => theme.transitions.normal};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `${theme.space.md} ${theme.space.lg}`};
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.space.md};
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.space.xs};
  border-radius: ${({ theme }) => theme.radii.full};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ProfileIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const ProfileMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: ${({ theme }) => theme.space.xl};
  background-color: white;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  min-width: 200px;
  padding: ${({ theme }) => theme.space.md};
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  z-index: 50;
`;

const ProfileMenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.space.sm};
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.light};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProfileMenuHeader = styled.div`
  padding: ${({ theme }) => theme.space.sm};
  margin-bottom: ${({ theme }) => theme.space.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const ProfileEmail = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Navigation: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  
  // Fechar menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  return (
    <NavContainer>
      <Logo to="/">Bookwriter</Logo>
      
      <NavLinks>
        {!loading && (
          user ? (
            <>
              <NavLink to="/dashboard">Minha Biblioteca</NavLink>
              <ProfileButton 
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <ProfileIcon>
                  {user.user_metadata.name 
                    ? getInitials(user.user_metadata.name) 
                    : user.email?.[0].toUpperCase() || 'U'}
                </ProfileIcon>
              </ProfileButton>
              
              <ProfileMenu isOpen={isMenuOpen} ref={menuRef}>
                <ProfileMenuHeader>
                  <div>{user.user_metadata.name || 'Usuário'}</div>
                  <ProfileEmail>{user.email}</ProfileEmail>
                </ProfileMenuHeader>
                
                <ProfileMenuItem as={Link} to="/dashboard">
                  Minha Biblioteca
                </ProfileMenuItem>
                
                <ProfileMenuItem as={Link} to="/profile">
                  Meu Perfil
                </ProfileMenuItem>
                
                <ProfileMenuItem as={Link} to="/settings">
                  Configurações
                </ProfileMenuItem>
                
                <ProfileMenuItem onClick={handleSignOut}>
                  Sair
                </ProfileMenuItem>
              </ProfileMenu>
            </>
          ) : (
            <>
              <NavLink to="/login">Entrar</NavLink>
              <Button as={Link} to="/signup" variant="primary" size="sm">
                Criar Conta
              </Button>
            </>
          )
        )}
      </NavLinks>
    </NavContainer>
  );
};

export default Navigation;