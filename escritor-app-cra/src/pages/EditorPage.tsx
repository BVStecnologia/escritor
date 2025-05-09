import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

// Corrigir a tipagem useParams de acordo com a versão do React Router
const EditorPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bookId, chapterId } = useParams<Record<string, string | undefined>>();
  const [content, setContent] = useState<string>('Comece a escrever aqui...');
  const [showAIPanel, setShowAIPanel] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  // Simulação da geração de conteúdo com IA
  const generateContent = (prompt: string): void => {
    // Em uma implementação real, isso seria uma chamada à API Claude
    setTimeout(() => {
      setAiSuggestion(`Aqui está uma sugestão para o seu texto: 
      
${content.slice(0, 100)}... e continuou seu caminho pela floresta densa, percebendo que algo importante estava prestes a acontecer. As árvores pareciam sussurrar segredos antigos, e o vento carregava um aroma de mistério que só ele conseguia identificar.`);
    }, 1000);
  };

  return (
    <div className="editor-page" style={{ 
      display: 'flex',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Barra lateral */}
      <div style={{ 
        width: '250px',
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #e0e0e0',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginTop: 0 }}>Capítulos</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            backgroundColor: '#4CAF50', 
            color: 'white',
            marginBottom: '8px'
          }}>
            Capítulo 1: Introdução
          </li>
          <li style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            backgroundColor: 'white', 
            marginBottom: '8px'
          }}>
            Capítulo 2: O Encontro
          </li>
          <li style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            backgroundColor: 'white', 
            marginBottom: '8px'
          }}>
            Capítulo 3: A Jornada
          </li>
          <li style={{ 
            padding: '10px', 
            borderRadius: '4px', 
            backgroundColor: 'white', 
            marginBottom: '8px'
          }}>
            + Novo Capítulo
          </li>
        </ul>
        
        <div style={{ marginTop: '40px' }}>
          <h3>Estatísticas</h3>
          <p>Palavras: 367</p>
          <p>Caracteres: 2,154</p>
          <p>Tempo de leitura: 2 min</p>
        </div>
        
        <Link to="/dashboard" style={{ 
          display: 'block',
          marginTop: '40px',
          padding: '10px',
          textAlign: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          textDecoration: 'none',
          color: '#333'
        }}>
          Voltar para Dashboard
        </Link>
      </div>
      
      {/* Área do editor */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Barra de ferramentas */}
        <div style={{ 
          padding: '10px 20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px'
        }}>
          <button style={{ padding: '5px 10px' }}>B</button>
          <button style={{ padding: '5px 10px' }}>I</button>
          <button style={{ padding: '5px 10px' }}>U</button>
          <span style={{ margin: '0 10px', borderLeft: '1px solid #e0e0e0' }}></span>
          <button style={{ padding: '5px 10px' }}>H1</button>
          <button style={{ padding: '5px 10px' }}>H2</button>
          <span style={{ margin: '0 10px', borderLeft: '1px solid #e0e0e0' }}></span>
          <button 
            style={{ 
              padding: '5px 15px', 
              backgroundColor: '#4CAF50', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginLeft: 'auto'
            }}
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            IA Assistente
          </button>
        </div>
        
        {/* Área de texto */}
        <div style={{ 
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              lineHeight: '1.6',
              resize: 'none',
              padding: '0'
            }}
          />
        </div>
      </div>
      
      {/* Painel de assistente IA */}
      {showAIPanel && (
        <div style={{ 
          width: '300px',
          backgroundColor: '#f9f9f9',
          borderLeft: '1px solid #e0e0e0',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Assistente Claude</h3>
            <button 
              onClick={() => setShowAIPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontWeight: 'bold' }}>O que você gostaria de fazer?</p>
            <button 
              onClick={() => generateContent('continue')}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Continuar Texto
            </button>
            <button 
              onClick={() => generateContent('improve')}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Melhorar Texto
            </button>
            <button 
              onClick={() => generateContent('ideas')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Gerar Ideias
            </button>
          </div>
          
          {aiSuggestion && (
            <div style={{ 
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>Sugestão:</p>
              <p style={{ margin: 0, lineHeight: '1.6' }}>{aiSuggestion}</p>
            </div>
          )}
          
          {aiSuggestion && (
            <button 
              onClick={() => setContent(aiSuggestion.replace('Aqui está uma sugestão para o seu texto: \n      \n', ''))}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Aplicar Sugestão
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EditorPage;