import React from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
}

/**
 * Componente que atualiza o title e meta tags para SEO
 * Uma solução simples sem depender de bibliotecas externas
 */
const SEO: React.FC<SEOProps> = ({ title, description, canonicalUrl }) => {
  React.useEffect(() => {
    // Atualizar o título da página
    document.title = title;
    
    // Atualizar a meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }
    
    // Adicionar/atualizar link canônico se fornecido
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonicalUrl);
        document.head.appendChild(canonicalLink);
      }
    }
    
    // Limpeza ao desmontar
    return () => {
      // Opcionalmente, você pode restaurar valores anteriores aqui
      // Este exemplo não restaura para manter a simplicidade
    };
  }, [title, description, canonicalUrl]);
  
  // Este componente não renderiza nada visível
  return null;
};

export default SEO;